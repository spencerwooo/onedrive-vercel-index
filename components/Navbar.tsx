import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconName } from '@fortawesome/fontawesome-svg-core'
import { Dialog, Transition } from '@headlessui/react'
import toast, { Toaster } from 'react-hot-toast'
import { useHotkeys } from 'react-hotkeys-hook'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'

import siteConfig from '../config/site.json'
import SearchModal from './SearchModal'
import useDeviceOS from '../utils/useDeviceOS'

const Navbar = () => {
  const router = useRouter()
  const os = useDeviceOS()

  const [tokenPresent, setTokenPresent] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const [searchOpen, setSearchOpen] = useState(false)
  const openSearchBox = () => setSearchOpen(true)

  useHotkeys(`${os === 'mac' ? 'cmd' : 'ctrl'}+k`, openSearchBox)

  useEffect(() => {
    const storedToken = () => {
      for (const r of siteConfig.protectedRoutes) {
        if (localStorage.hasOwnProperty(r)) {
          return true
        }
      }
      return false
    }
    setTokenPresent(storedToken())
  }, [])

  const clearTokens = () => {
    setIsOpen(false)

    siteConfig.protectedRoutes.forEach(r => {
      localStorage.removeItem(r)
    })

    toast.success('Cleared all tokens')
    setTimeout(() => {
      router.reload()
    }, 1000)
  }

  return (
    <div className="bg-white dark:bg-gray-900 dark:border-gray-500/30 sticky top-0 bg-opacity-80 border-b border-gray-900/10 backdrop-blur-md z-[100]">
      <Toaster />

      <SearchModal searchOpen={searchOpen} setSearchOpen={setSearchOpen} />

      <div className="flex items-center space-x-4 justify-between w-full mx-auto px-4 py-1">
        <Link href="/" passHref>
          <a className="dark:text-white hover:opacity-80 flex items-center py-2 md:p-2 space-x-2">
            <Image src={siteConfig.icon} alt="icon" width="25" height="25" priority />
            <span className="sm:block hidden font-bold">{siteConfig.title}</span>
          </a>
        </Link>

        <div className="flex items-center flex-1 md:flex-initial space-x-4 text-gray-700">
          <button
            className="flex-1 flex items-center justify-between rounded-lg bg-gray-100 dark:bg-gray-800 md:w-48 px-2.5 py-1.5 dark:text-white hover:opacity-80"
            onClick={openSearchBox}
          >
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon="search" />
              <span className="text-sm font-medium">Search ...</span>
            </div>

            <div className="flex items-center space-x-1">
              <div className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 font-medium text-xs">
                {os === 'mac' ? '⌘' : 'Ctrl'}
              </div>
              <div className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 font-medium text-xs">K</div>
            </div>
          </button>

          {siteConfig.links.length !== 0 &&
            siteConfig.links.map((l: { name: string; link: string }) => (
              <a
                key={l.name}
                href={l.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 dark:text-white hover:opacity-80"
              >
                <FontAwesomeIcon icon={['fab', l.name.toLowerCase() as IconName]} />
                <span className="text-sm font-medium hidden md:inline-block">{l.name}</span>
              </a>
            ))}

          {siteConfig.email && (
            <a href={siteConfig.email} className="flex items-center space-x-2 dark:text-white hover:opacity-80">
              <FontAwesomeIcon icon={['far', 'envelope']} />
              <span className="text-sm font-medium hidden md:inline-block">Email</span>
            </a>
          )}

          {tokenPresent && (
            <button
              className="dark:text-white flex items-center p-2 space-x-2 hover:opacity-80"
              onClick={() => setIsOpen(true)}
            >
              <span className="text-sm font-medium">Logout</span>
              <FontAwesomeIcon icon="sign-out-alt" />
            </button>
          )}
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" open={isOpen} onClose={() => setIsOpen(false)}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="bg-gray-50 dark:bg-gray-800 fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="dark:bg-gray-900 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg">
                <Dialog.Title className="dark:text-gray-100 text-lg font-bold text-gray-900">
                  Clear all tokens?
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    These tokens are used to authenticate yourself into password protected folders, clearing them means
                    that you will need to re-enter the passwords again.
                  </p>
                </div>

                <div className="dark:text-gray-100 max-h-32 mt-4 overflow-y-scroll font-mono text-sm">
                  {siteConfig.protectedRoutes.map((r, i) => (
                    <div key={i} className="flex items-center space-x-1">
                      <FontAwesomeIcon icon="key" />
                      <span className="truncate">{r}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end mt-8">
                  <button
                    className="focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-400 inline-flex items-center justify-center px-4 py-2 mr-3 space-x-2 text-white bg-blue-500 rounded"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="focus:outline-none focus:ring focus:ring-red-300 hover:bg-red-400 inline-flex items-center justify-center px-4 py-2 space-x-2 text-white bg-red-500 rounded"
                    onClick={() => clearTokens()}
                  >
                    <FontAwesomeIcon icon={['far', 'trash-alt']} />
                    <span>Clear all</span>
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default Navbar
