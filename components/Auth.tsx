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
    <div className="flex flex-col space-y-4 max-w-sm mx-auto md:my-10">
      <div className="mx-auto w-3/4 md:w-5/6">
        <Image src={'/images/no-looking.png'} alt="authenticate" width={912} height={912} />
      </div>
      <div className="dark:text-gray-100 text-gray-900 text-lg font-bold">Enter Password</div>

      <p className="text-sm text-gray-500">
        This route (the folder itself and the files inside) is password protected. If you know the password, please
        enter it below.
      </p>

      <input
        className="font-mono p-2 bg-blue-50 dark:bg-gray-600 dark:text-white rounded focus:ring focus:ring-blue-300 dark:focus:ring-blue-700 focus:outline-none"
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
        className="inline-flex space-x-2 items-center justify-center bg-blue-500 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-600"
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
