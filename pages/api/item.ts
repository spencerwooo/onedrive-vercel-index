import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { getAccessToken } from '.'
import apiConfig from '../../config/api.config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get access token from storage
  const accessToken = await getAccessToken()

  // Get item details (specifically, its path) by its unique ID in OneDrive
  const { id = '' } = req.query

  if (typeof id === 'string') {
    const itemApi = `${apiConfig.driveApi}/items/${id}`

    try {
      const { data } = await axios.get(itemApi, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          select: 'id,name,parentReference',
        },
      })
      res.status(200).json(data)
    } catch (error: any) {
      res.status(error.response.status).json({ error: error.response.data })
    }
  } else {
    res.status(400).json({ error: 'Invalid driveItem ID.' })
  }
  return
}
