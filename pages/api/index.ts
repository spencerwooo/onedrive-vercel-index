import { posix as pathPosix } from 'path'

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import Cors from 'cors'

import apiConfig from '../../config/api.config'
import siteConfig from '../../config/site.config'
import { revealObfuscatedToken } from '../../utils/oAuthHandler'
import { compareHashedToken } from '../../utils/protectedRouteHandler'
import { getOdAuthTokens, storeOdAuthTokens } from '../../utils/odAuthTokenStore'

const basePath = pathPosix.resolve('/', siteConfig.baseDirectory)
const clientSecret = revealObfuscatedToken(apiConfig.obfuscatedClientSecret)

// CORS middleware for raw links: https://nextjs.org/docs/api-routes/api-middlewares
function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  const cors = Cors({ methods: ['GET', 'HEAD'] })
  return new Promise((resolve, reject) => {
    cors(req, res, result => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

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
export async function getAccessToken(): Promise<string> {
  const { accessToken, refreshToken } = await getOdAuthTokens()

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

  const resp = await axios.post(apiConfig.authApi, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if ('access_token' in resp.data && 'refresh_token' in resp.data) {
    const { expires_in, access_token, refresh_token } = resp.data
    await storeOdAuthTokens({
      accessToken: access_token,
      accessTokenExpiry: parseInt(expires_in),
      refreshToken: refresh_token,
    })
    console.log('Fetch new access token with stored refresh token.')
    return access_token
  }

  return ''
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // If method is POST, then the API is called by the client to store acquired tokens
  if (req.method === 'POST') {
    const { obfuscatedAccessToken, accessTokenExpiry, obfuscatedRefreshToken } = req.body
    const accessToken = revealObfuscatedToken(obfuscatedAccessToken)
    const refreshToken = revealObfuscatedToken(obfuscatedRefreshToken)

    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      res.status(400).send('Invalid request body')
      return
    }

    await storeOdAuthTokens({
      accessToken,
      accessTokenExpiry,
      refreshToken,
    })
    res.status(200).send('OK')
    return
  }

  // If method is GET, then the API is a normal request to the OneDrive API for files or folders
  const { path = '/', raw = false, next = '' } = req.query

  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    res.status(400).json({ error: 'No path specified.' })
    return
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    res.status(400).json({ error: 'Path query invalid.' })
    return
  }
  const cleanPath = pathPosix.resolve('/', pathPosix.normalize(path))

  const accessToken = await getAccessToken()

  // Return error 403 if access_token is empty
  if (!accessToken) {
    res.status(403).json({ error: 'No access token.' })
    return
  }

  // Handle authentication through .password
  const protectedRoutes = siteConfig.protectedRoutes
  let authTokenPath = ''
  for (const r of protectedRoutes) {
    if (cleanPath.startsWith(r)) {
      authTokenPath = `${r}/.password`
      break
    }
  }

  // Fetch password from remote file content
  if (authTokenPath !== '') {
    try {
      const token = await axios.get(`${apiConfig.driveApi}/root${encodePath(authTokenPath)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          select: '@microsoft.graph.downloadUrl,file',
        },
      })

      // Handle request and check for header 'od-protected-token'
      const odProtectedToken = await axios.get(token.data['@microsoft.graph.downloadUrl'])
      // console.log(req.headers['od-protected-token'], odProtectedToken.data.trim())

      if (
        !compareHashedToken({
          odTokenHeader: req.headers['od-protected-token'] as string,
          dotPassword: odProtectedToken.data,
        })
      ) {
        res.status(401).json({ error: 'Password required for this folder.' })
        return
      }
    } catch (error: any) {
      // Password file not found, fallback to 404
      if (error.response.status === 404) {
        res.status(404).json({ error: "You didn't set a password for your protected folder." })
      }
      res.status(500).end()
      return
    }
  }

  const requestPath = encodePath(cleanPath)
  // Handle response from OneDrive API
  const requestUrl = `${apiConfig.driveApi}/root${requestPath}`
  // Whether path is root, which requires some special treatment
  const isRoot = requestPath === ''

  // Go for file raw download link, add CORS headers, and redirect to @microsoft.graph.downloadUrl
  if (raw) {
    await runCorsMiddleware(req, res)

    const { data } = await axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: '@microsoft.graph.downloadUrl,folder,file',
      },
    })

    if ('folder' in data) {
      res.status(400).json({ error: "Folders doesn't have raw download urls." })
      return
    }
    if ('file' in data) {
      res.redirect(data['@microsoft.graph.downloadUrl'])
      return
    }
  }

  // Querying current path identity (file or folder) and follow up query childrens in folder
  try {
    const { data: identityData } = await axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: '@microsoft.graph.downloadUrl,name,size,id,lastModifiedDateTime,folder,file,video,image',
        $expand: 'thumbnails',
      },
    })

    if ('folder' in identityData) {
      const { data: folderData } = await axios.get(`${requestUrl}${isRoot ? '' : ':'}/children`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: next
          ? {
              select: '@microsoft.graph.downloadUrl,name,size,id,lastModifiedDateTime,folder,file,video,image',
              $expand: 'thumbnails',
              top: siteConfig.maxItems,
              $skipToken: next,
            }
          : {
              select: '@microsoft.graph.downloadUrl,name,size,id,lastModifiedDateTime,folder,file,video,image',
              $expand: 'thumbnails',
              top: siteConfig.maxItems,
            },
      })

      // Extract next page token from full @odata.nextLink
      const nextPage = folderData['@odata.nextLink']
        ? folderData['@odata.nextLink'].match(/&\$skiptoken=(.+)/i)[1]
        : null

      // Return paging token if specified
      if (nextPage) {
        res.status(200).json({ folder: folderData, next: nextPage })
      } else {
        res.status(200).json({ folder: folderData })
      }
      return
    }
    res.status(200).json({ file: identityData })
    return
  } catch (error: any) {
    res.status(error.response.status).json({ error: error.response.data })
    return
  }
}
