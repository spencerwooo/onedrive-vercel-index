import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Image from 'next/image'
import { useRouter } from 'next/router'
import { FunctionComponent } from 'react'

import { matchProtectedRoute } from '../utils/tools'
import useLocalStorage from '../utils/useLocalStorage'

const Auth: FunctionComponent<{ redirect: string }> = ({ redirect }) => {
  const authTokenPath = matchProtectedRoute(redirect)

  const router = useRouter()
  const [token, setToken] = useLocalStorage(authTokenPath, '')

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

      <input
        className="bg-blue-50 dark:bg-gray-600 dark:text-white focus:ring focus:ring-blue-300 dark:focus:ring-blue-700 focus:outline-none p-2 font-mono rounded"
        autoFocus
        type="text"
        placeholder="************"
        value={token}
        onChange={e => {
          setToken(e.target.value)
        }}
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === 'NumpadEnter') {
            router.reload()
          }
        }}
      />
      <button
        className="focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-600 inline-flex items-center justify-center px-4 py-2 space-x-2 text-white bg-blue-500 rounded"
        onClick={() => {
          router.reload()
        }}
      >
        <span>Lemme in</span>
        <FontAwesomeIcon icon="arrow-right" />
      </button>
    </div>
  )
}

export default Auth
