import axios from 'axios'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import { useAsync } from 'react-async-hook'
import useConstant from 'use-constant'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Dispatch, Fragment, SetStateAction, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'

import { OdDriveItem, OdSearchResult } from '../types'
import { LoadingIcon } from './Loading'

import { getFileIcon } from '../utils/getFileIcon'
import useAxiosGet from '../utils/fetchOnMount'
import siteConfig from '../config/site.json'

/**
 * Extract the searched item's path in field 'parentReference' and convert it to the
 * absolute path represented in onedrive-vercel-index
 *
 * @param path Path returned from the parentReference field of the driveItem
 * @returns The absolute path of the driveItem in the search result
 */
function mapAbsolutePath(path: string): string {
  return path.split(siteConfig.baseDirectory === '/' ? 'root:' : siteConfig.baseDirectory)[1]
}

/**
 * Implements a debounced search function that returns a promise that resolves to an array of
 * search results.
 *
 * @returns A react hook for a debounced async search of the drive
 */
function useDriveItemSearch() {
  const [query, setQuery] = useState('')
  const searchDriveItem = async (q: string) => {
    const { data } = await axios.get<OdSearchResult>(`/api/search?q=${q}`)

    // Map parentReference to the absolute path of the search result
    data.map(item => {
      item['path'] =
        'path' in item.parentReference
          ? // OneDrive International have the path returned in the parentReference field
            `${mapAbsolutePath(item.parentReference.path)}/${encodeURIComponent(item.name)}`
          : // OneDrive for Business/Education does not, so we need extra steps here
            ''
    })

    return data
  }

  const debouncedDriveItemSearch = useConstant(() => AwesomeDebouncePromise(searchDriveItem, 1000))
  const results = useAsync(async () => {
    if (query.length === 0) {
      return []
    } else {
      return debouncedDriveItemSearch(query)
    }
  }, [query])

  return {
    query,
    setQuery,
    results,
  }
}

function SearchResultItemTemplate({
  driveItem,
  driveItemPath,
  itemDescription,
  disabled,
}: {
  driveItem: OdSearchResult[number]
  driveItemPath: string
  itemDescription: string
  disabled: boolean
}) {
  return (
    <Link href={driveItemPath} passHref>
      <a
        className={`flex items-center space-x-4 border-b border-gray-400/30 px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-850 ${
          disabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'
        }`}
      >
        <FontAwesomeIcon icon={driveItem.file ? getFileIcon(driveItem.name) : ['far', 'folder']} />
        <div>
          <div className="text-sm font-medium leading-8">{driveItem.name}</div>
          <div
            className={`text-xs font-mono opacity-60 truncate overflow-hidden ${
              itemDescription === 'Loading ...' && 'animate-pulse'
            }`}
          >
            {itemDescription}
          </div>
        </div>
      </a>
    </Link>
  )
}

function SearchResultItemLoadRemote({ result }: { result: OdSearchResult[number] }) {
  const {
    content,
    error,
    validating,
  }: {
    content: OdDriveItem
    error: string
    validating: boolean
  } = useAxiosGet(`/api/item?id=${result.id}`)

  if (error) {
    return <SearchResultItemTemplate driveItem={result} driveItemPath={''} itemDescription={error} disabled={true} />
  }

  if (validating) {
    return (
      <SearchResultItemTemplate driveItem={result} driveItemPath={''} itemDescription={'Loading ...'} disabled={true} />
    )
  }

  const driveItemPath = `${mapAbsolutePath(content.parentReference.path)}/${encodeURIComponent(content.name)}`
  return (
    <SearchResultItemTemplate
      driveItem={result}
      driveItemPath={driveItemPath}
      itemDescription={decodeURIComponent(driveItemPath)}
      disabled={false}
    />
  )
}

function SearchResultItem({ result }: { result: OdSearchResult[number] }) {
  if (result.path === '') {
    // path is empty, which means we need to fetch the parentReference to get the path
    return <SearchResultItemLoadRemote result={result} />
  } else {
    // path is not an empty string in the search result, such that we can directly render the component as is
    const driveItemPath = decodeURIComponent(result.path)
    return (
      <SearchResultItemTemplate
        driveItem={result}
        driveItemPath={driveItemPath}
        itemDescription={driveItemPath}
        disabled={false}
      />
    )
  }
}

export default function SearchModal({
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
                <div className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 font-medium text-xs">ESC</div>
              </Dialog.Title>

              <div
                className="bg-white dark:text-white dark:bg-gray-900 max-h-[80vh] overflow-x-hidden overflow-y-scroll"
                onClick={closeSearchBox}
              >
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
                      results.result.map(result => <SearchResultItem key={result.id} result={result} />)
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
