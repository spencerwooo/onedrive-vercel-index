import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { posix as pathPosix } from 'path'

import apiConfig from '../../config/api.json'

const basePath = pathPosix.resolve('/', apiConfig.base)
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
  body.append('client_id', apiConfig.clientId)
  body.append('redirect_uri', apiConfig.redirectUri)
  body.append('client_secret', process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : '')
  body.append('refresh_token', process.env.REFRESH_TOKEN ? process.env.REFRESH_TOKEN : '')
  body.append('grant_type', 'refresh_token')

  const resp = await axios.post(apiConfig.authApi, body, {
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
    const requestUrl = `${apiConfig.driveApi}/root${encodePath(path)}`
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
