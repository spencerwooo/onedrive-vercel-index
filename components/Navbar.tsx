import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconName } from '@fortawesome/fontawesome-svg-core'
import { Dialog, Transition } from '@headlessui/react'
import toast, { Toaster } from 'react-hot-toast'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'

import siteConfig from '../config/site.json'

const Navbar = () => {
  const router = useRouter()
  const [tokenPresent, setTokenPresent] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
    <div className="text-left p-1 bg-white dark:bg-gray-900 sticky top-0 bg-opacity-80 backdrop-blur-md shadow-sm z-[100]">
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <Toaster />

        <Link href="/">
          <a className="flex items-center space-x-2 font-bold text-xl p-2 dark:text-white hover:opacity-80">
            <Image src={siteConfig.icon} alt="icon" width="32" height="32" />
            <span className="hidden sm:block">{siteConfig.title}</span>
          </a>
        </Link>

        <div className="flex items-center">
          {siteConfig.contacts.map((c, i) => (
            <a
              key={i}
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
            >
              {c.platform === 'email' ? (
                <FontAwesomeIcon icon={['far', 'envelope']} size="lg" />
              ) : (
                <FontAwesomeIcon icon={['fab', c.platform as IconName]} size="lg" />
              )}
            </a>
          ))}

          {tokenPresent && (
            <button
              className="flex space-x-2 items-center p-2 rounded hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
              onClick={() => setIsOpen(true)}
            >
              <span>Logout</span>
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
              <Dialog.Overlay className="fixed inset-0 bg-gray-50 dark:bg-gray-800" />
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
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-lg rounded">
                <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Clear all tokens?
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    These tokens are used to authenticate yourself into password protected folders, clearing them means
                    that you will need to re-enter the passwords again.
                  </p>
                </div>

                <div className="mt-4 font-mono text-sm dark:text-gray-100 max-h-32 overflow-y-scroll">
                  {siteConfig.protectedRoutes.map((r, i) => (
                    <div key={i} className="flex space-x-1 items-center">
                      <FontAwesomeIcon icon="key" />
                      <span className="truncate">{r}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end items-center">
                  <button
                    className="inline-flex space-x-2 items-center justify-center bg-blue-500 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-600 mr-3"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex space-x-2 items-center justify-center bg-red-500 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-red-300 hover:bg-red-600"
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
