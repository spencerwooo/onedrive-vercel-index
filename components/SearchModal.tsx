import axios from 'axios'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import { useAsync } from 'react-async-hook'
import useConstant from 'use-constant'

import { Dispatch, FC, Fragment, SetStateAction, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const useDriveItemSearch = () => {
  const [query, setQuery] = useState('')
  const searchDriveItem = async (q: string) => {
    // TODO: currently using mock data, change this to a query to OneDrive API
    const result = await axios.get('https://jsonplaceholder.typicode.com/posts')
    console.log(q, result.data)

    return result.data
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

const SearchModal: FC<{
  searchOpen: boolean
  setSearchOpen: Dispatch<SetStateAction<boolean>>
}> = ({ searchOpen, setSearchOpen }) => {
  const closeSearchBox = () => setSearchOpen(false)

  const { query, setQuery, results } = useDriveItemSearch()

  return (
    <Transition appear show={searchOpen} as={Fragment}>
      <Dialog as="div" className="inset-0 z-50 fixed overflow-y-auto" onClose={closeSearchBox}>
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
            <div className="border rounded border-gray-400/30 shadow-xl my-20 text-left w-full max-w-3xl transform transition-all inline-block overflow-hidden ">
              <Dialog.Title as="h3" className="relative dark:text-white">
                <div className="flex pl-3 inset-y-0 left-0 absolute items-center pointer-events-none">
                  <FontAwesomeIcon icon="search" />
                </div>
                <input
                  type="text"
                  id="search-box"
                  className="border-b bg-gray-50 border-gray-400/30 w-full p-2.5 pt-4 pl-10 block dark:bg-gray-800 focus:outline-none focus-visible:outline-none"
                  placeholder="Search ..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </Dialog.Title>

              <div className="bg-white dark:text-white dark:bg-gray-900">
                {results.loading && (
                  <div className="text-center">
                    <div className="animate-pulse">
                      <Image src="/images/fabulous-come-back-later.png" alt="purr loading" width={300} height={300} />
                    </div>
                    <div className="pb-4 text-sm font-medium">Loading ...</div>
                  </div>
                )}
                {results.error && (
                  <div className="text-center">
                    <Image src="/images/fabulous-page-not-found.png" alt="errored out" width={300} height={300} />
                    <div className="pb-4 text-sm font-medium">Error: {results.error.message}</div>
                  </div>
                )}
                {results.result && (
                  <>
                    {results.result.length === 0 ? (
                      <div className="text-center">
                        <Image src="/images/fabulous-rip-2.png" alt="empty list" width={300} height={300} />
                        <div className="pb-4 text-sm font-medium">Nothing here...</div>
                      </div>
                    ) : (
                      results.result.map((result: any, i: number) => (
                        <Link href={`/`} key={i} passHref>
                          <div className="border-b cursor-pointer border-gray-400/30 p-4 hover:bg-gray-50 dark:hover:bg-gray-850">
                            <div className="font-medium">{result.title}</div>
                            <div className="text-sm opacity-70">{result.body}</div>
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
