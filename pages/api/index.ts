import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { posix as pathPosix } from 'path'
import crypto from 'crypto'

import apiConfig from '../../config/api.json'
import siteConfig from '../../config/site.json'

const driveApi = process.env.DRIVE_API ? process.env.DRIVE_API : apiConfig.driveApi
const authApi = process.env.AUTH_API ? process.env.AUTH_API : apiConfig.authApi
const basePath = pathPosix.resolve('/', process.env.BASE_DIR ? process.env.BASE_DIR : apiConfig.base)
const encodePath = (path: string) => {
  const encodedPath = pathPosix.join(basePath, pathPosix.resolve('/', path))
  if (encodedPath === '/' || encodedPath === '') {
    return ''
  }
  return encodeURIComponent(':' + encodedPath)
}

// Store access token in memory, cuz Vercel doesn't provide key-value storage natively
let _access_token = ''
const getAccessToken = async () => {
  if (_access_token) {
    console.log('Fetch token from memory.')
    return _access_token
  }

  const body = new URLSearchParams()
  body.append('client_id', process.env.CLIENT_ID ? process.env.CLIENT_ID : apiConfig.clientId)
  body.append('redirect_uri', process.env.REDIRECT_URI ? process.env.REDIRECT_URI : apiConfig.redirectUri)
  body.append('client_secret', process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : '')
  body.append('refresh_token', process.env.REFRESH_TOKEN ? process.env.REFRESH_TOKEN : '')
  body.append('grant_type', 'refresh_token')

  const resp = await axios.post(authApi, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (resp.data.access_token) {
    _access_token = resp.data.access_token
    return _access_token
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path = '/', raw = false } = req.query
  if (path === '[...path]') {
    res.status(400).json({ error: 'No path specified.' })
    return
  }

  if (typeof path === 'string') {
    const accessToken = await getAccessToken()

    // Handle authentication through .password
    const protectedRoutes = siteConfig.protectedRoutes
    let authTokenPath = ''
    for (const r of protectedRoutes) {
      if (path.startsWith(r)) {
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
        let authenticated
        if(process.env.PASSWORD_HASHING) {
          authenticated = (!req.headers.hasOwnProperty('od-protected-token')
          || !req.headers['od-protected-token']
          || odProtectedToken.data.trim() !== crypto.createHash('sha256').update(req.headers['od-protected-token'].toString()).digest('hex'))
        } else {
          authenticated = (req.headers['od-protected-token'] !== odProtectedToken.data.trim())
        }

        if(authenticated){
          res.status(401).json({ error: 'Password required for this folder.' })
          return
        }

      } catch (error) {
        // Password file not found, fallback to 404
        if (error.response.status === 404) {
          res.status(404).json({ error: "You didn't set a password for your protected folder." })
        }
        res.status(500).end()
        return
      }
    }

    // Handle response from OneDrive API
    const requestUrl = `${driveApi}/root${encodePath(path)}`
    const { data } = await axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: '@microsoft.graph.downloadUrl,name,size,id,lastModifiedDateTime,folder,file',
        expand: 'children(select=@content.downloadUrl,name,lastModifiedDateTime,eTag,size,id,folder,file)',
      },
    })

    if (raw) {
      if ('folder' in data) {
        res.status(400).json({ error: "Folders doesn't have raw download urls." })
        return
      }
      if ('file' in data) {
        res.redirect(data['@microsoft.graph.downloadUrl'])
        return
      }
    }

    res.status(200).json({ path, data })
    return
  }

  res.status(404).json({ error: 'Path query invalid.' })
  return
}
