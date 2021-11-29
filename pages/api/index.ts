import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import apiConfig from '../../config/api.json'
import siteConfig from '../../config/site.json'
import { compareHashedToken } from '../../utils/tools'

import { Provider, QueryErrors } from '../../providers/interface'
import onedrive from '../../providers/onedrive'
import nginxAutoindex from '../../providers/nginxAutoindex'

const provider: Provider = (() => {
  switch (apiConfig.provider) {
    case 'onedrive':
      return onedrive
    case 'nginxAutoindex':
      return nginxAutoindex
    default:
      throw new Error('Unsupported provider')
  }
})()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path = '/', raw = false, next = '' } = req.query
  if (path === '[...path]') {
    res.status(400).json({ error: 'No path specified.' })
    return
  }

  if (typeof path === 'string') {
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
        const data = await provider.query(authTokenPath, { assertFile: true })

        // Handle request and check for header 'od-protected-token'
        const odProtectedToken = await axios.get(data['@microsoft.graph.downloadUrl'])
        // console.log(req.headers['od-protected-token'], odProtectedToken.data.trim())

        if (!compareHashedToken(req.headers['od-protected-token'] as string, odProtectedToken.data)) {
          res.status(401).json({ error: 'Password required for this folder.' })
          return
        }
      } catch (error: any) {
        // Password file not found, fallback to 404
        if (error.response?.status === 404) {
          res.status(404).json({ error: "You didn't set a password for your protected folder." })
        }
        res.status(500).end()
        return
      }
    }

    // Go for file raw download link and query with only temporary link parameter
    if (raw) {
      const data = await provider.query(path, { assertFile: true }).catch(e => {
        if (e instanceof Error && e.message === QueryErrors['assertFileErrMsg']) {
          return null
        }
        throw e
      })
      if (data === null) {
        res.status(400).json({ error: "Folders doesn't have raw download urls." })
        return
      }
      res.redirect(data['@microsoft.graph.downloadUrl'])
      return
    }

    const resData = await provider.query(path, { next: typeof next === 'string' ? next : next[0] })
    res.status(200).json(resData)
    return
  }

  res.status(404).json({ error: 'Path query invalid.' })
  return
}
