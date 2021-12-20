import { FunctionComponent, useState } from 'react'
import { ParsedUrlQuery } from 'querystring'

import { queryToPath } from './FileListing'
import siteConfig from '../config/site.json'
import { fetcher } from '../utils/fetchWithSWR'
import { getStoredToken } from '../utils/protectedRouteHandler'

const SearchBox: FunctionComponent<{ query?: ParsedUrlQuery }> = ({ query }) => {
  const path = queryToPath(query)
  const [q, setQ] = useState<string>('')

  const handleSearch = () => {
    if (q) {
      const hashedToken = getStoredToken(path)
      fetcher(`/api?path=${path}&q=${q}`, hashedToken ?? undefined).then(data => {
        console.log(data)
      })
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
