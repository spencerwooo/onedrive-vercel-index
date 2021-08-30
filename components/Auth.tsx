import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { FunctionComponent, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { matchProtectedRoute } from '../utils/tools'
import useLocalStorage from '../utils/useLocalStorage'

const Auth: FunctionComponent<{ redirect: string }> = ({ redirect }) => {
  const authTokenPath = matchProtectedRoute(redirect)

  const router = useRouter()
  const [token, setToken] = useLocalStorage(authTokenPath, '')

  return (
    <div className="text-center my-20">
      <div className="dark:text-white text-xl font-bold mb-8 mt-5">Enter Password</div>
      <input
        className="mr-2 text-center p-2 bg-blue-50 dark:bg-gray-600 dark:text-white rounded focus:ring focus:ring-blue-300 dark:focus:ring-blue-700 focus:outline-none"
        type="text"
        value={token}
        onChange={e => {
          setToken(e.target.value)
        }}
      />
      <button
        className="bg-blue-500 rounded px-3 py-[0.43em] text-white focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-600"
        onClick={() => {
          router.reload()
        }}
      >
        <FontAwesomeIcon icon="arrow-right" />
      </button>
    </div>
  )
}

export default Auth
