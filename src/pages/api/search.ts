import { encodePath, getAccessToken, handleResponseError, setCaching } from '@/utils/api'
import { kv } from '@/utils/kv/edge'
import apiConfig from '@cfg/api.config'
import siteConfig from '@cfg/site.config'
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
}

/**
 * Sanitize the search query
 *
 * @param query User search query, which may contain special characters
 * @returns Sanitised query string, which:
 * - encodes the '<' and '>' characters,
 * - replaces '?' and '/' characters with ' ',
 * - replaces ''' with ''''
 * Reference: https://stackoverflow.com/questions/41491222/single-quote-escaping-in-microsoft-graph.
 */
function sanitiseQuery(query: string): string {
  const sanitisedQuery = query
    .replace(/'/g, "''")
    .replace('<', ' &lt; ')
    .replace('>', ' &gt; ')
    .replace('?', ' ')
    .replace('/', ' ')
  return encodeURIComponent(sanitisedQuery)
}

export default async function handler(req: NextRequest) {
  // Get access token from storage
  const accessToken = await getAccessToken(kv)

  // Query parameter from request
  const searchQuery = req.nextUrl.searchParams.get('q') ?? ''

  const headers = new Headers()

  setCaching(headers)

  if (typeof searchQuery !== 'string') return NextResponse.json([], { status: 200, headers })

  // Construct Microsoft Graph Search API URL, and perform search only under the base directory
  const searchRootPath = encodePath('/')
  const encodedPath = searchRootPath === '' ? searchRootPath : searchRootPath + ':'

  const searchApi = new URL(`${apiConfig.driveApi}/root${encodedPath}/search(q='${sanitiseQuery(searchQuery)}')`)

  searchApi.searchParams.set('select', 'id,name,file,folder,parentReference')
  searchApi.searchParams.set('top', siteConfig.maxItems.toString())
  try {
    const data = await fetch(searchApi, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => (res.ok ? res.json() : Promise.reject(res)))
    return NextResponse.json(data.value, { status: 200, headers })
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return NextResponse.json(data, { status, headers })
  }
}
