import { FunctionComponent, useState, useRef } from 'react'
import { ParsedUrlQuery } from 'querystring'
import { Menu, Transition } from '@headlessui/react'

import { queryToPath } from './FileListing'
import siteConfig from '../config/site.json'
import { fetcher } from '../utils/fetchWithSWR'
import { getStoredToken } from '../utils/protectedRouteHandler'
import { traverseFolder } from './MultiFileDownloader'
import getStrSimilarity from '../utils/getStrSimilarity'
import useClickAwayListener from '../utils/useClickAwayListener'

const SearchBox: FunctionComponent<{ query?: ParsedUrlQuery }> = ({ query }) => {
  const path = queryToPath(query)

  const [q, setQ] = useState<string>('')
  const [results, setResults] = useState<{ name: string; path: string }[]>([])

  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickAwayListener(ref, () => setOpen(false))

  const handleSearch = () => {
    if (q) {
      search(path, q).then(res => {
        setResults(res)
        setOpen(true)
      })
    }
  }

  return (
    <Menu as="div" className="relative pb-4">
      <div className="flex space-x-2">
        <input
          title="Search in current folder"
          className="flex-1 border border-gray-600/10 dark:bg-gray-600 dark:text-white focus:ring focus:ring-blue-300 dark:focus:ring-blue-700 focus:outline-none py-1 px-2 rounded text-sm"
          id="search"
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
          title="Search in current folder"
          className="focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-400 px-2 py-1 text-white bg-blue-500 rounded"
          onClick={handleSearch}
        >
          <SearchIcon className="w-5 h-5 fill-white" />
        </button>
      </div>
      {
        <Transition
          show={open}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            ref={ref}
            static
            className="origin-top-right absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            {results.length > 0 ? (
              results.map(({ name, path }) => (
                <Menu.Item key={name}>
                  {({ active }) => (
                    <a
                      href={path}
                      className={[
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block px-4 py-2 text-sm'
                      ].join(' ')}
                    >
                      {name}
                    </a>
                  )}
                </Menu.Item>
              ))
            ) : (
              <div className="px-4 py-2 text-sm">No search results in current folder</div>
            )}
          </Menu.Items>
        </Transition>
      }
    </Menu>
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
    case 'onedrive':
      return await searchViaOnedriveApi(path, q)
    case 'bultin':
      return await searchViaBuiltinAlgo(path, q)
    case 'ascii-onedrive-else-builtin':
    default:
      // If all ASCII, use OneDrive API provided search; else use builtin search
      if (q.match(/^[\x00-\x7f]+$/)) {
        return await searchViaOnedriveApi(path, q)
      } else {
        return await searchViaBuiltinAlgo(path, q)
      }
  }
}

// OneDrive API provided search
async function searchViaOnedriveApi(path: string, q: string) {
  const hashedToken = getStoredToken(path)
  const data = await fetcher(`/api?path=${path}&q=${q}`, hashedToken ?? undefined)
  return data.value.map((c: any) => {
    let basePath = siteConfig.baseDirectory
    basePath = basePath.startsWith('/') ? basePath : '/' + basePath
    basePath = basePath === '/' ? '' : basePath
    basePath = basePath.endsWith('/') ? basePath.substring(0, basePath.length - 1) : basePath

    let itemPath = c.path as string
    // Base dir will not be in search results
    itemPath = itemPath.substring(itemPath.indexOf(':') + 1)
    itemPath = itemPath.substring(basePath.length)

    return { name: c.name, path: itemPath }
  })
}

// Builtin search shipped by the app which supports Chinese
async function searchViaBuiltinAlgo(path: string, q: string) {
  // Space-separated q is recoginzed as a list of keywords
  const qs = q.split(' ').filter(Boolean)

  const res: [number, { name: string; path: string }][] = []
  for await (const { meta: c, path: p } of traverseFolder(path)) {
    const name: string = c.name
    const sim = qs.map(q => getStrSimilarity(name, q)).reduce((a, b) => a + b) / qs.length
    if (sim > 0) {
      res.push([sim, { name, path: p }])
    }
  }
  res.sort((a, b) => b[0] - a[0])
  return res.slice(0, siteConfig.maxSearchItems).map(r => r[1])
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
