import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { getAccessToken, getAuthTokenPath } from '.'
import apiConfig from '../../config/api.config'
import type { OdDriveItem } from '../../types'
import { mapAbsolutePath } from '../../utils/mapAbsolutePath'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get access token from storage
  const accessToken = await getAccessToken()

  // Get item details (specifically, its path) by its unique ID in OneDrive
  const { id = '' } = req.query

  // Set edge function caching for faster load times, check docs:
  // https://vercel.com/docs/concepts/functions/edge-caching
  res.setHeader('Cache-Control', apiConfig.cacheControlHeader)

  if (typeof id === 'string') {
    const itemApi = `${apiConfig.driveApi}/items/${id}`

    try {
      const { data } = await axios.get(itemApi, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          select: 'id,name,parentReference',
        },
      })

      // Check if path of the item are protected
      const item = data as OdDriveItem
      const path = `${decodeURIComponent(mapAbsolutePath(item.parentReference.path))}/${item.name}`
      if (getAuthTokenPath(path) !== '') {
        res.status(403).json({ error: 'The driveItem is password protected.' })
        return
      }

      res.status(200).json(data)
    } catch (error: any) {
      res.status(error?.response?.status ?? 500).json({ error: error?.response?.data ?? 'Internal server error.' })
    }
  } else {
    res.status(400).json({ error: 'Invalid driveItem ID.' })
  }
  return
}
