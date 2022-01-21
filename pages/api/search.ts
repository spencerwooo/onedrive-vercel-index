import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { encodePath, getAccessToken } from '.'
import apiConfig from '../../config/api.json'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get access token from storage
  const accessToken = await getAccessToken()

  // Query parameter from request
  const { q: searchQuery = '' } = req.query

  if (typeof searchQuery === 'string') {
    // Construct Microsoft Graph Search API URL, and perform search only under the base dir
    const encodedPath = encodePath('/') === '' ? encodePath('/') : encodePath('/') + ':'
    const searchApi = `${apiConfig.driveApi}/root${encodedPath}/search(q='${encodeURIComponent(searchQuery)}')`

    try {
      const { data } = await axios.get(searchApi, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          select: 'id,name,file,folder,parentReference',
        },
      })
      res.status(200).json(data.value)
    } catch (error: any) {
      res.status(error.response.status).json({ error: error.response.data })
    }
  } else {
    res.status(200).json([])
  }
  return
}
