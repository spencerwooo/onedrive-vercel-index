import apiConfig, { cacheControlHeader, driveApi } from '@cfg/api.config'
import siteConfig from '@cfg/site.config'
import { revealObfuscatedToken } from './oAuthHandler'
import { Redis, getOdAuthTokens, storeOdAuthTokens } from './odAuthTokenStore'
import { compareHashedToken } from './protectedRouteHandler'
import pathPosix from 'path-browserify'
import { NextRequest, NextResponse } from 'next/server'
import cors from './cors'

const basePath = pathPosix.resolve('/', siteConfig.baseDirectory)
const clientSecret = revealObfuscatedToken(apiConfig.obfuscatedClientSecret)

/**
 * Encode the path of the file relative to the base directory
 *
 * @param path Relative path of the file to the base directory
 * @returns Absolute path of the file inside OneDrive
 */
export function encodePath(path: string): string {
  let encodedPath = pathPosix.join(basePath, path)
  if (encodedPath === '/' || encodedPath === '') {
    return ''
  }
  encodedPath = encodedPath.replace(/\/$/, '')
  return `:${encodeURIComponent(encodedPath)}`
}

/**
 * Fetch the access token from Redis storage and check if the token requires a renew
 *
 * @returns Access token for OneDrive API
 */
export async function getAccessToken(kv: Redis): Promise<string> {
  const { accessToken, refreshToken } = await getOdAuthTokens(kv)

  // Return in storage access token if it is still valid
  if (typeof accessToken === 'string') {
    console.log('Fetch access token from storage.')
    return accessToken
  }

  // Return empty string if no refresh token is stored, which requires the application to be re-authenticated
  if (typeof refreshToken !== 'string') {
    console.log('No refresh token, return empty access token.')
    return ''
  }

  // Fetch new access token with in storage refresh token
  const body = new URLSearchParams()
  body.append('client_id', apiConfig.clientId)
  body.append('redirect_uri', apiConfig.redirectUri)
  body.append('client_secret', clientSecret)
  body.append('refresh_token', refreshToken)
  body.append('grant_type', 'refresh_token')

  const data = await fetch(apiConfig.authApi, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(resp => (resp.ok ? resp.json() : Promise.reject(resp)))

  if ('access_token' in data && 'refresh_token' in data) {
    const { expires_in, access_token, refresh_token } = data
    await storeOdAuthTokens(kv, {
      accessToken: access_token,
      accessTokenExpiry: parseInt(expires_in),
      refreshToken: refresh_token,
    })
    console.log('Fetch new access token with stored refresh token.')
    return access_token
  }

  return ''
}

/**
 * Match protected routes in site config to get path to required auth token
 * @param path Path cleaned in advance
 * @returns Path to required auth token. If not required, return empty string.
 */
export function getAuthTokenPath(path: string) {
  // Ensure trailing slashes to compare paths component by component. Same for protectedRoutes.
  // Since OneDrive ignores case, lower case before comparing. Same for protectedRoutes.
  path = path.toLowerCase() + '/'
  const protectedRoutes = siteConfig.protectedRoutes
  let authTokenPath = ''
  for (let r of protectedRoutes) {
    if (typeof r !== 'string') continue
    r = r.toLowerCase().replace(/\/$/, '') + '/'
    if (path.startsWith(r)) {
      authTokenPath = `${r}.password`
      break
    }
  }
  return authTokenPath
}

/**
 * Handles protected route authentication:
 * - Match the cleanPath against an array of user defined protected routes
 * - If a match is found:
 * - 1. Download the .password file stored inside the protected route and parse its contents
 * - 2. Check if the od-protected-token header is present in the request
 * - The request is continued only if these two contents are exactly the same
 *
 * @param cleanPath Sanitised directory path, used for matching whether route is protected
 * @param accessToken OneDrive API access token
 * @param req Next.js request object
 * @param res Next.js response object
 */
export async function checkAuthRoute(
  cleanPath: string,
  accessToken: string,
  odTokenHeader: string
): Promise<{ code: 200 | 401 | 404 | 500; message: string }> {
  // Handle authentication through .password
  const authTokenPath = getAuthTokenPath(cleanPath)

  // Fetch password from remote file content
  if (authTokenPath === '') {
    return { code: 200, message: '' }
  }

  try {
    const url = new URL(`${driveApi}/root${encodePath(authTokenPath)}`)
    url.searchParams.append('select', '@microsoft.graph.downloadUrl,file')
    const { ['@microsoft.graph.downloadUrl']: downloadUrl } = await fetch(
      `${apiConfig.driveApi}/root${encodePath(authTokenPath)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    ).then(res => (res.ok ? res.json() : Promise.reject(res)))

    // Handle request and check for header 'od-protected-token'
    const odProtectedToken = await fetch(downloadUrl).then(res => (res.ok ? res.text() : Promise.reject(res)))

    // console.log(odTokenHeader, odProtectedToken.data.trim())

    if (
      !compareHashedToken({
        odTokenHeader: odTokenHeader,
        dotPassword: odProtectedToken,
      })
    ) {
      return { code: 401, message: 'Password required.' }
    }
  } catch (error) {
    const { status } = await handleResponseError(error)
    // Password file not found, fallback to 404
    if (status === 404) {
      return { code: 404, message: "You didn't set a password." }
    } else {
      return { code: 500, message: 'Internal server error.' }
    }
  }

  return { code: 200, message: 'Authenticated.' }
}

/**
 * Set edge function caching for faster load times
 * @see https://vercel.com/docs/concepts/functions/edge-caching
 */
export function setCaching(header: Headers) {
  header.set('Cache-Control', apiConfig.cacheControlHeader)
  return header
}

/**
 * If message is empty, then the path is not protected.
 * Conversely, protected routes are not allowed to serve from cache.
 */
export function noCacheForProtectedPath(header: Headers, message: any) {
  if (message !== '') setNoCache(header)
  return header
}

export function setNoCache(header: Headers) {
  header.set('Cache-Control', 'no-cache')
  return header
}

export function initCorsForRaw(req: NextRequest) {
  return (res: Response) => cors(req, res, { methods: ['GET', 'HEAD'] })
}

export async function handleRaw(
  req: NextRequest,
  ctx: { headers?: Headers; requestPath: string; accessToken: string },
  proxy = false
) {
  const headers = ctx.headers ?? new Headers(),
    cors = initCorsForRaw(req)

  try {
    // Handle response from OneDrive API
    const requestUrl = new URL(`${driveApi}/root${ctx.requestPath}`)
    // OneDrive international version fails when only selecting the downloadUrl (what a stupid bug)
    requestUrl.searchParams.append('select', 'id,size,@microsoft.graph.downloadUrl')
    const { ['@microsoft.graph.downloadUrl']: downloadUrl, size } = await fetch(requestUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${ctx.accessToken}` },
    }).then(res => (res.ok ? res.json() : Promise.reject(res)))

    if (!downloadUrl)
      return await cors(NextResponse.json({ error: 'No download url found.' }, { status: 404, headers }))

    // Only proxy raw file content response for files up to 4MB
    if (!(proxy && size && size < 4194304))
      return await cors(NextResponse.redirect(downloadUrl, { headers }))

    const { body: dlBody, headers: dlHeader } = await fetch(downloadUrl)
    dlHeader.set('Cache-Control', cacheControlHeader)

    if (!dlBody)
      return await cors(
        NextResponse.json({ error: 'No body from requested download URL.', url: downloadUrl }, { status: 404 })
      )

    return await cors(new Response(dlBody, { status: 200, headers: dlHeader }))
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return await cors(NextResponse.json(data, { status, headers }))
  }
}

export async function handleResponseError(error: unknown) {
  let output: { data: { error: string }; status: number }
  if (error instanceof Response) {
    output = { data: { error: (await error.json()) ?? error.statusText }, status: error.status }
    console.error(output)
  } else {
    output = { data: { error: 'Internal server error.' }, status: 500 }
    console.error('Error while handling response:', error)
  }
  return output
}
