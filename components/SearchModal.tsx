import axios from 'axios'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import { useAsync } from 'react-async-hook'
import useConstant from 'use-constant'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Dispatch, FC, Fragment, SetStateAction, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'

import { OdSearchResult } from '../types'
import { getFileIcon } from '../utils/getFileIcon'
import siteConfig from '../config/site.json'
import { LoadingIcon } from './Loading'

function useDriveItemSearch() {
  const [query, setQuery] = useState('')
  const searchDriveItem = async (q: string) => {
    const { data } = await axios.get<OdSearchResult>(`/api/search?q=${q}`)

    // Extract the searched item's path and convert it to the absolute path in onedrive-vercel-index
    function mapAbsolutePath(path: string): string {
      return siteConfig.baseDirectory === '/' ? path.split('root:')[1] : path.split(siteConfig.baseDirectory)[1]
    }

    // Map parentReference to the absolute path of the search result
    data.map(item => {
      item['path'] = `${mapAbsolutePath(item.parentReference.path)}/${encodeURIComponent(item.name)}`
    })

    return data
  }

  const debouncedNotionSearch = useConstant(() => AwesomeDebouncePromise(searchDriveItem, 1000))
  const results = useAsync(async () => {
    if (query.length === 0) {
      return []
    } else {
      return debouncedNotionSearch(query)
    }
  }, [query])

  return {
    query,
    setQuery,
    results,
  }
}

function SearchModal({
  searchOpen,
  setSearchOpen,
}: {
  searchOpen: boolean
  setSearchOpen: Dispatch<SetStateAction<boolean>>
}) {
  const closeSearchBox = () => setSearchOpen(false)

  const { query, setQuery, results } = useDriveItemSearch()

  return (
    <Transition appear show={searchOpen} as={Fragment}>
      <Dialog as="div" className="inset-0 z-[200] fixed overflow-y-auto" onClose={closeSearchBox}>
        <div className="min-h-screen text-center px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="bg-white/80 inset-0 fixed dark:bg-gray-800/80" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="border rounded border-gray-400/30 shadow-xl my-12 text-left w-full max-w-3xl transform transition-all inline-block overflow-hidden">
              <Dialog.Title
                as="h3"
                className="flex items-center space-x-4 dark:text-white border-b bg-gray-50 border-gray-400/30 p-4 dark:bg-gray-800"
              >
                <FontAwesomeIcon icon="search" className="w-4 h-4" />
                <input
                  type="text"
                  id="search-box"
                  className="w-full bg-transparent focus:outline-none focus-visible:outline-none"
                  placeholder="Search ..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <div className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 font-medium text-xs">ESC</div>
              </Dialog.Title>

              <div className="bg-white dark:text-white dark:bg-gray-900 max-h-[80vh] overflow-x-hidden overflow-y-scroll">
                {results.loading && (
                  <div className="text-center px-4 py-12 text-sm font-medium">
                    <LoadingIcon className="animate-spin w-4 h-4 mr-2 inline-block svg-inline--fa" />
                    <span>Loading ...</span>
                  </div>
                )}
                {results.error && (
                  <div className="text-center px-4 py-12 text-sm font-medium">Error: {results.error.message}</div>
                )}
                {results.result && (
                  <>
                    {results.result.length === 0 ? (
                      <div className="text-center px-4 py-12 text-sm font-medium">Nothing here.</div>
                    ) : (
                      results.result.map(result => (
                        <Link href={result.path} key={result.id} passHref>
                          <div
                            className="flex items-center space-x-4 border-b cursor-pointer border-gray-400/30 px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-850"
                            onClick={closeSearchBox}
                          >
                            <FontAwesomeIcon icon={result.file ? getFileIcon(result.name) : ['far', 'folder']} />
                            <div>
                              <div className="text-sm font-medium leading-8">{result.name}</div>
                              <div className="text-xs font-mono opacity-60 truncate overflow-hidden">
                                {decodeURIComponent(result.path)}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default SearchModal
