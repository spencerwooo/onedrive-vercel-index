import pathPosix from 'path-browserify'

import apiConfig from '@cfg/api.config'
import siteConfig from '@cfg/site.config'
import { NextRequest } from 'next/server'
import {
  getAccessToken,
  checkAuthRoute,
  encodePath,
  setCaching,
  noCacheForProtectedPath,
  handleResponseError,
  ResponseCompat,
} from '@/utils/api/common'
import { handleRaw } from './raw'
import { revealObfuscatedToken } from '@/utils/oAuthHandler'
import { Redis, storeOdAuthTokens } from '@/utils/odAuthTokenStore'

export default async function handler(kv: Redis, req: NextRequest) {
  // If method is POST, then the API is called by the client to store acquired tokens
  if (req.method === 'POST') {
    const { obfuscatedAccessToken, accessTokenExpiry, obfuscatedRefreshToken } = await req.json()
    const accessToken = revealObfuscatedToken(obfuscatedAccessToken)
    const refreshToken = revealObfuscatedToken(obfuscatedRefreshToken)

    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      return ResponseCompat.text('Invalid request body', { status: 400 })
    }

    await storeOdAuthTokens(kv, { accessToken, accessTokenExpiry, refreshToken })
    return ResponseCompat.text('OK', { status: 200 })
  }

  // If method is GET, then the API is a normal request to the OneDrive API for files or folders
  const search = req.nextUrl.searchParams

  const path = search.get('path') ?? '/',
    raw = search.has('raw'),
    next = search.get('next') ?? '',
    sort = search.get('sort') ?? ''

  const headers = new Headers()

  setCaching(headers)

  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    return ResponseCompat.json({ error: 'No path specified.' }, { status: 400, headers })
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    return ResponseCompat.json({ error: 'Path query invalid.' }, { status: 400, headers })
  }
  // Besides normalizing and making absolute, trailing slashes are trimmed
  const cleanPath = pathPosix.resolve('/', pathPosix.normalize(path)).replace(/\/$/, '')

  // Validate sort param
  if (typeof sort !== 'string') {
    return ResponseCompat.json({ error: 'Sort query invalid.' }, { status: 400, headers })
  }

  const accessToken = await getAccessToken(kv)

  // Return error 403 if access_token is empty
  if (!accessToken) {
    return ResponseCompat.json({ error: 'No access token.' }, { status: 403, headers })
  }

  // Handle protected routes authentication
  const { code, message } = await checkAuthRoute(cleanPath, accessToken, req.headers.get('od-protected-token') ?? '')
  // Status code other than 200 means user has not authenticated yet
  if (code !== 200) {
    return ResponseCompat.json({ error: message }, { status: code, headers })
  }

  noCacheForProtectedPath(headers, message)

  const requestPath = encodePath(cleanPath)

  // Go for file raw download link, add CORS headers, and redirect to @microsoft.graph.downloadUrl
  // (kept here for backwards compatibility, and cache headers will be reverted to no-cache)
  if (raw) {
    return await handleRaw({ headers, requestPath, accessToken })
  }

  // Handle response from OneDrive API
  const requestUrl = `${apiConfig.driveApi}/root${requestPath}`
  // Whether path is root, which requires some special treatment
  const isRoot = requestPath === ''

  const setSelectProps = (url: URL) =>
    url.searchParams.set('select', 'name,size,id,lastModifiedDateTime,folder,file,video,image')
  // Querying current path identity (file or folder) and follow up query childrens in folder
  try {
    const identityUrl = new URL(requestUrl)
    setSelectProps(identityUrl)
    const identityData = await fetch(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => (res.ok ? res.json() : Promise.reject(res)))

    if (!('folder' in identityData)) return ResponseCompat.json({ file: identityData }, { status: 200, headers })

    const childUrl = new URL(`${requestUrl}${isRoot ? '' : ':'}/children`)
    setSelectProps(childUrl)
    childUrl.searchParams.set('$top', siteConfig.maxItems.toString())
    if (next) childUrl.searchParams.set('$skipToken', next)
    if (sort) childUrl.searchParams.set('$orderby', sort)

    const folderData = await fetch(childUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => (res.ok ? res.json() : Promise.reject(res)))

    // Extract next page token from full @odata.nextLink
    const nextPage = folderData['@odata.nextLink'] ? folderData['@odata.nextLink'].match(/&\$skiptoken=(.+)/i)[1] : null

    // Return paging token if specified
    return ResponseCompat.json({ folder: folderData, next: nextPage ? nextPage : undefined }, { status: 200, headers })
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return ResponseCompat.json(data, { status, headers })
  }
}
