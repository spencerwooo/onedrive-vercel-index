import Head from 'next/head'
import router from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import siteConfig from '../../config/site.json'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

import { obfuscateToken, requestTokenWithAuthCode } from '../../utils/oAuthHandler'
import axios from 'axios'

export default function OAuthStep3({ accessToken, refreshToken, error, description, errorUri }) {
  return (
    <div className="dark:bg-gray-900 flex flex-col items-center justify-center min-h-screen bg-white">
      <Head>
        <title>{`OAuth Step 3 - ${siteConfig.title}`}</title>
      </Head>

      <main className="bg-gray-50 dark:bg-gray-800 flex flex-col flex-1 w-full">
        <Navbar />

        <div className="w-full max-w-5xl p-4 mx-auto">
          <div className="dark:bg-gray-900 dark:text-gray-100 bg-white rounded p-3">
            <h3 className="font-medium text-xl mb-4">Welcome to your new onedrive-vercel-index 🎉</h3>

            <p className="py-1">
              Authorisation is required as no valid{' '}
              <code className="text-sm font-mono underline decoration-wavy decoration-pink-600">access_token</code> or{' '}
              <code className="text-sm font-mono underline decoration-wavy decoration-green-600">refresh_token</code> is
              present on this deployed instance.
            </p>

            <h3 className="font-medium text-lg mt-4 mb-2">Step 3/3: Get access and refresh tokens</h3>
            {error ? (
              <div>
                <p className="text-red-500 py-1 font-medium">
                  <FontAwesomeIcon icon="exclamation-circle" className="mr-2" />
                  <span>Whoops, looks like we got a problem: {error}.</span>
                </p>
                <p className="my-2 font-mono border border-gray-400/20 rounded text-sm bg-gray-50 dark:bg-gray-800 p-2 opacity-80 whitespace-pre-line">
                  {description}
                </p>
                {errorUri && (
                  <p>
                    Check out{' '}
                    <a
                      href={errorUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600 dark:text-blue-500"
                    >
                      Microsoft&apos;s official explanation
                    </a>{' '}
                    on the error message.
                  </p>
                )}
                <div className="text-right mb-2 mt-6">
                  <button
                    className="text-white bg-gradient-to-br from-red-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center disabled:cursor-not-allowed disabled:grayscale"
                    onClick={() => {
                      router.push('/onedrive-vercel-index-oauth/step-1')
                    }}
                  >
                    <FontAwesomeIcon icon="arrow-left" /> <span>Restart</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="py-1 font-medium">Success, the API returned what we needed.</p>
                <ol className="py-1">
                  {accessToken && (
                    <li>
                      <FontAwesomeIcon icon={['far', 'check-circle']} className="text-green-500" />{' '}
                      <span>
                        Acquired access_token:{' '}
                        <code className="text-sm font-mono opacity-80">{`${accessToken.substring(0, 30)}...`}</code>.
                      </span>
                    </li>
                  )}
                  {refreshToken && (
                    <li>
                      <FontAwesomeIcon icon={['far', 'check-circle']} className="text-green-500" />{' '}
                      <span>
                        Acquired refresh_token:{' '}
                        <code className="text-sm font-mono opacity-80">{`${refreshToken.substring(0, 50)}...`}</code>.
                      </span>
                    </li>
                  )}
                </ol>

                <p className="py-1">Your onedrive-vercel-index should be up and running. Go back home to find out.</p>

                <div className="text-right mb-2 mt-6">
                  <button
                    className="text-white bg-gradient-to-br from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-bl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center disabled:cursor-not-allowed disabled:grayscale"
                    onClick={() => {
                      router.push('/')
                    }}
                  >
                    <FontAwesomeIcon icon="home" /> <span>Back home</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export async function getServerSideProps({ query }) {
  const { authCode } = query

  // Return if no auth code is present
  if (!authCode) {
    return {
      props: {
        error: 'No auth code present',
        description: 'Where is the auth code? Did you follow step 2 you silly donut?',
      },
    }
  }

  const response = await requestTokenWithAuthCode(authCode)

  // If error response, return invalid
  if ('error' in response) {
    return {
      props: {
        error: response.error,
        description: response.errorDescription,
        errorUri: response.errorUri,
      },
    }
  }

  const { expiryTime, accessToken, refreshToken } = response

  // await tokenStore.storeOdAuthTokens({ accessToken, accessTokenExpiry: parseInt(expiryTime), refreshToken })

  // We perform a POST request to the default API route to store the tokens inside the main route memory
  // This is a bit of a hack, but it's the only way to get the tokens to the main route
  await axios.post('/api', {
    obfuscatedAccessToken: obfuscateToken(accessToken),
    accessTokenExpiry: parseInt(expiryTime),
    obfuscatedRefreshToken: obfuscateToken(refreshToken),
  })

  return {
    props: {
      error: null,
      expiryTime,
      accessToken,
      refreshToken,
    },
  }
}
