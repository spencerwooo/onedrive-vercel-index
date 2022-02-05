import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import { encodePath, getAccessToken } from '.'
import apiConfig from '../../config/api.config'
import siteConfig from '../../config/site.config'

/**
 * Sanitize the search query
 *
 * @param query User search query, which may contain special characters
 * @returns Sanitised query string which replaces non-alphanumeric characters with ' '
 */
function sanitiseQuery(query: string): string {
/**  const sanitisedQuery = query.replace(/[^a-zA-Z0-9]/g, ' ')
 * Actually this will cause problems with CJK only query words as it will remove every character.
 * After removing it, CJK search will be much improved.
 */
  return encodeURIComponent(sanitisedQuery)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get access token from storage
  const accessToken = await getAccessToken()

  // Query parameter from request
  const { q: searchQuery = '' } = req.query

  if (typeof searchQuery === 'string') {
    // Construct Microsoft Graph Search API URL, and perform search only under the base directory
    const searchRootPath = encodePath('/')
    const encodedPath = searchRootPath === '' ? searchRootPath : searchRootPath + ':'

    const searchApi = `${apiConfig.driveApi}/root${encodedPath}/search(q='${sanitiseQuery(searchQuery)}')`

    try {
      const { data } = await axios.get(searchApi, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          select: 'id,name,file,folder,parentReference',
          top: siteConfig.maxItems,
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
