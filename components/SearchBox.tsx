import { FunctionComponent, useState } from 'react'
import { ParsedUrlQuery } from 'querystring'

import { queryToPath } from './FileListing'
import siteConfig from '../config/site.json'
import apiConfig from '../config/api.json'
import { fetcher } from '../utils/fetchWithSWR'
import { getStoredToken } from '../utils/protectedRouteHandler'
import { traverseFolder } from './MultiFileDownloader'
import getStrSimilarity from '../utils/getStrSimilarity'

const SearchBox: FunctionComponent<{ query?: ParsedUrlQuery }> = ({ query }) => {
  const path = queryToPath(query)
  const [q, setQ] = useState<string>('')

  const handleSearch = () => {
    if (q) {
      console.log(search(path, q))
    }
  }

  return (
    <div className="flex space-x-2 pb-4">
      <input
        className="flex-1 border border-gray-600/10 dark:bg-gray-600 dark:text-white focus:ring focus:ring-blue-300 dark:focus:ring-blue-700 focus:outline-none py-1 px-2 rounded text-sm"
        autoFocus
        placeholder="Search..."
        value={q}
        onChange={e => {
          setQ(e.target.value)
        }}
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === 'NumpadEnter') {
            handleSearch()
          }
        }}
      />
      <button
        className="focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-400 px-2 py-1 text-white bg-blue-500 rounded"
        onClick={handleSearch}
      >
        <SearchIcon className="w-5 h-5 fill-white" />
      </button>
    </div>
  )
}
export default SearchBox

/**
 * Search according to searchPolicy in site config
 * @param path Root path to search its descendants
 * @param q Query string. Should be not empty.
 * @returns Results ordered by relevance
 */
async function search(path: string, q: string): Promise<{ name: string; path: string }[]> {
  switch (siteConfig.searchPolicy) {
    case 'provided':
      return await searchProvided(path, q)
    case 'shipped':
      return await searchShipped(path, q)
    case 'ascii-provided':
    default:
      // If all ASCII, use provided search; else use shipped search
      if (q.match(/^[\x00-\x7f]+$/)) {
        return await searchProvided(path, q)
      } else {
        return await searchShipped(path, q)
      }
  }
}

// OneDrive API provided search
async function searchProvided(path: string, q: string) {
  const hashedToken = getStoredToken(path)
  const data = await fetcher(`/api?path=${path}&q=${q}`, hashedToken ?? undefined)
  return data.value.map((c: any) => ({ name: c.name, path: getPathFromWebUrl(c.webUrl) }))
}

// Search shipped by the app which supports Chinese
async function searchShipped(path: string, q: string) {
  const res: [number, { name: string; path: string }][] = []
  for await (const { meta: c, path: p } of traverseFolder(path)) {
    const name: string = c.name
    if (name.includes(q)) {
      res.push([getStrSimilarity(name, q), { name, path: p }])
    }
  }
  res.sort((a, b) => a[0] - b[0])
  return res.slice(0, siteConfig.maxSearchItems).map(r => r[1])
}

// Helper to extract path from webUrl
// as OneDrive API does not provide an easy way to convert ID to path
function getPathFromWebUrl(webUrl: string): string {
  const url = new URL(webUrl)
  const ps = url.pathname.split('/').filter(p => p)

  // Remove meaningless segments to get full path
  ps.splice(0, 3)

  // Remove base segments set in api config
  const basePs = apiConfig.base.split('/').filter(p => p)
  for (let i = 0; i < basePs.length; i++) {
    if (basePs[i] != ps[i]) {
      throw new Error('Path does not match base')
    }
  }
  ps.splice(0, basePs.length)

  return ps.join('/')
}

// Material design search icon licensed under Apache 2.0,
// wrapped into a React component without essential code changes.
const SearchIcon: FunctionComponent<{ className?: string }> = ({ className }) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  )
}
