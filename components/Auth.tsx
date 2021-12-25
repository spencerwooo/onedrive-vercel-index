import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Image from 'next/image'
import { useRouter } from 'next/router'
import { FunctionComponent, useState } from 'react'

import { matchProtectedRoute } from '../utils/protectedRouteHandler'
import useLocalStorage from '../utils/useLocalStorage'

const Auth: FunctionComponent<{ redirect: string }> = ({ redirect }) => {
  const authTokenPath = matchProtectedRoute(redirect)

  const router = useRouter()
  const [token, setToken] = useState('')
  const [persistedToken, setPersistedToken] = useLocalStorage(authTokenPath, '')

  return (
    <div className="md:my-10 flex flex-col max-w-sm mx-auto space-y-4">
      <div className="md:w-5/6 w-3/4 mx-auto">
        <Image src={'/images/no-looking.png'} alt="authenticate" width={912} height={912} />
      </div>
      <div className="dark:text-gray-100 text-lg font-bold text-gray-900">Enter Password</div>

      <p className="text-sm text-gray-500">
        This route (the folder itself and the files inside) is password protected. If you know the password, please
        enter it below.
      </p>

      <div className="flex items-center space-x-2">
        <input
          className="flex-1 border border-gray-600/10 dark:bg-gray-600 dark:text-white focus:ring focus:ring-blue-300 dark:focus:ring-blue-700 focus:outline-none p-2 font-mono rounded"
          autoFocus
          type="text"
          placeholder="************"
          value={token}
          onChange={e => {
            setToken(e.target.value)
          }}
          onKeyPress={e => {
            if (e.key === 'Enter' || e.key === 'NumpadEnter') {
              setPersistedToken(token)
              router.reload()
            }
          }}
        />
        <button
          className="focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-400 px-4 py-2 text-white bg-blue-500 rounded"
          onClick={() => {
            setPersistedToken(token)
            router.reload()
          }}
        >
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      </div>
    </div>
  )
}

export default Auth
