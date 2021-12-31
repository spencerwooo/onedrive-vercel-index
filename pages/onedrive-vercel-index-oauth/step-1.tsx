import Head from 'next/head'
import { useRouter } from 'next/router'

import siteConfig from '../../config/site.json'
import apiConfig from '../../config/api.json'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function OAuthStep1() {
  const redis_url = process.env.REDIS_URL
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
            <h3 className="font-medium text-xl mb-4">Welcome to your new onedrive-vercel-index 🎉</h3>

            <p className="py-1">
              Authorisation is required as no valid{' '}
              <code className="text-sm font-mono underline decoration-wavy decoration-pink-600">access_token</code> or{' '}
              <code className="text-sm font-mono underline decoration-wavy decoration-green-600">refresh_token</code> is
              present on this deployed instance.
            </p>

            <h3 className="font-medium text-lg mt-4 mb-2">Step 1/3: Preparations</h3>

            <p className="py-1">
              Check the following configurations (especially <code className="text-sm font-mono">client_id</code> and{' '}
              <code className="text-sm font-mono">client_secret</code> (obfuscated)) and see if they match the official
              ones specified in the documentation of{' '}
              <a
                href="https://github.com/spencerwooo/onedrive-vercel-index"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-blue-600 dark:text-blue-500"
              >
                onedrive-vercel-index
              </a>{' '}
              before proceeding with authorising this application with your own Microsoft account.
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

            <p className="py-1">
              <FontAwesomeIcon icon="exclamation-triangle" className="mr-1 text-yellow-400" /> If you see anything
              missing or incorrect, you need to reconfigure <code className="text-sm font-mono">/config/api.json</code>{' '}
              and redeploy this instance.
            </p>
            <p className="py-1">
              <FontAwesomeIcon icon="exclamation-triangle" className="mr-1 text-yellow-400" />️ If you are previewing
              this locally, you would need to reauthorise yourself when you eventually deploy the site on Vercel.
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
