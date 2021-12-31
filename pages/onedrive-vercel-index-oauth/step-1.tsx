import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'

import siteConfig from '../../config/site.json'
import apiConfig from '../../config/api.json'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function OAuthStep1() {
  const router = useRouter()

  return (
    <div className="dark:bg-gray-900 flex flex-col items-center justify-center min-h-screen bg-white">
      <Head>
        <title>{`OAuth Step 1 - ${siteConfig.title}`}</title>
      </Head>

      <main className="bg-gray-50 dark:bg-gray-800 flex flex-col flex-1 w-full">
        <Navbar />

        <div className="w-full max-w-5xl p-4 mx-auto">
          <div className="dark:bg-gray-900 dark:text-gray-100 bg-white rounded p-3">
            <div className="mx-auto w-52">
              <Image src="/images/fabulous-fireworks.png" width={912} height={912} alt="fabulous fireworks" />
            </div>
            <h3 className="font-medium text-xl mb-4 text-center">Welcome to your new onedrive-vercel-index 🎉</h3>

            <h3 className="font-medium text-lg mt-4 mb-2">Step 1/3: Preparations</h3>

            <p className="py-1 text-yellow-400 font-medium text-sm">
              <FontAwesomeIcon icon="exclamation-triangle" className="mr-1" /> If you have not specified a REDIS_URL
              inside your Vercel env variable, go initialise one at{' '}
              <a href="https://upstash.com/" target="_blank" rel="noopener noreferrer" className="underline">
                Upstash
              </a>
              . Docs:{' '}
              <a
                href="https://docs.upstash.com/redis/howto/vercelintegration"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Vercel Integration - Upstash
              </a>
              .
            </p>

            <p className="py-1">
              Authorisation is required as no valid{' '}
              <code className="text-sm font-mono underline decoration-wavy decoration-pink-600">access_token</code> or{' '}
              <code className="text-sm font-mono underline decoration-wavy decoration-green-600">refresh_token</code> is
              present on this deployed instance. Check the following configurations before proceeding with authorising
              onedrive-vercel-index with your own Microsoft account.
            </p>

            <div className="overflow-hidden my-4">
              <table className="table-auto min-w-full">
                <tbody>
                  <tr className="bg-white border-y dark:bg-gray-900 dark:border-gray-700">
                    <td className="bg-gray-50 dark:bg-gray-800 py-1 px-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                      CLIENT_ID
                    </td>
                    <td className="py-1 px-3 text-gray-500 whitespace-nowrap dark:text-gray-400">
                      <code className="text-sm font-mono">{apiConfig.clientId}</code>
                    </td>
                  </tr>
                  <tr className="bg-white border-y dark:bg-gray-900 dark:border-gray-700">
                    <td className="bg-gray-50 dark:bg-gray-800 py-1 px-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                      CLIENT_SECRET*
                    </td>
                    <td className="py-1 px-3 text-gray-500 whitespace-nowrap dark:text-gray-400">
                      <code className="text-sm font-mono">{apiConfig.obfuscatedClientSecret}</code>
                    </td>
                  </tr>
                  <tr className="bg-white border-y dark:bg-gray-900 dark:border-gray-700">
                    <td className="bg-gray-50 dark:bg-gray-800 py-1 px-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                      REDIRECT_URI
                    </td>
                    <td className="py-1 px-3 text-gray-500 whitespace-nowrap dark:text-gray-400">
                      <code className="text-sm font-mono">{apiConfig.redirectUri}</code>
                    </td>
                  </tr>
                  <tr className="bg-white border-y dark:bg-gray-900 dark:border-gray-700">
                    <td className="bg-gray-50 dark:bg-gray-800 py-1 px-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                      Auth API URL
                    </td>
                    <td className="py-1 px-3 text-gray-500 whitespace-nowrap dark:text-gray-400">
                      <code className="text-sm font-mono">{apiConfig.authApi}</code>
                    </td>
                  </tr>
                  <tr className="bg-white border-y dark:bg-gray-900 dark:border-gray-700">
                    <td className="bg-gray-50 dark:bg-gray-800 py-1 px-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                      Drive API URL
                    </td>
                    <td className="py-1 px-3 text-gray-500 whitespace-nowrap dark:text-gray-400">
                      <code className="text-sm font-mono">{apiConfig.driveApi}</code>
                    </td>
                  </tr>
                  <tr className="bg-white border-y dark:bg-gray-900 dark:border-gray-700">
                    <td className="bg-gray-50 dark:bg-gray-800 py-1 px-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                      API Scope
                    </td>
                    <td className="py-1 px-3 text-gray-500 whitespace-nowrap dark:text-gray-400">
                      <code className="text-sm font-mono">{apiConfig.scope}</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="py-1 font-medium text-sm">
              <FontAwesomeIcon icon="exclamation-triangle" className="mr-1 text-yellow-400" /> If you see anything
              missing or incorrect, you need to reconfigure <code className="text-xs font-mono">/config/api.json</code>{' '}
              and redeploy this instance.
            </p>

            <div className="text-right mb-2 mt-6">
              <button
                className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center"
                onClick={() => {
                  router.push('/onedrive-vercel-index-oauth/step-2')
                }}
              >
                <span>Proceed to OAuth</span> <FontAwesomeIcon icon="arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
