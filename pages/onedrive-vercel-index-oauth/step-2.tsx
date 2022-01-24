import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import siteConfig from '../../config/site.json'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { LoadingIcon } from '../../components/Loading'
import { extractAuthCodeFromRedirected, generateAuthorisationUrl } from '../../utils/oAuthHandler'

export default function OAuthStep2() {
  const router = useRouter()

  const [oAuthRedirectedUrl, setOAuthRedirectedUrl] = useState('')
  const [authCode, setAuthCode] = useState('')
  const [buttonLoading, setButtonLoading] = useState(false)

  const oAuthUrl = generateAuthorisationUrl()

  return (
    <div className="dark:bg-gray-900 flex flex-col items-center justify-center min-h-screen bg-white">
      <Head>
        <title>{`OAuth Step 2 - ${siteConfig.title}`}</title>
      </Head>

      <main className="bg-gray-50 dark:bg-gray-800 flex flex-col flex-1 w-full">
        <Navbar />

        <div className="w-full max-w-5xl p-4 mx-auto">
          <div className="dark:bg-gray-900 dark:text-gray-100 bg-white rounded p-3">
            <div className="mx-auto w-52">
              <Image
                src="/images/fabulous-come-back-later.png"
                width={912}
                height={912}
                alt="fabulous come back later"
                priority
              />
            </div>
            <h3 className="font-medium text-xl mb-4 text-center">Welcome to your new onedrive-vercel-index 🎉</h3>

            <h3 className="font-medium text-lg mt-4 mb-2">Step 2/3: Get authorisation code</h3>

            <p className="py-1 text-red-400 font-medium text-sm">
              <FontAwesomeIcon icon="exclamation-circle" className="mr-1" /> If you are not the owner of this website,
              stop now, as continuing with this process may expose your personal files in OneDrive.
            </p>

            <div
              className="relative my-2 font-mono border border-gray-500/50 rounded text-sm bg-gray-50 dark:bg-gray-800 cursor-pointer hover:opacity-80"
              onClick={() => {
                window.open(oAuthUrl)
              }}
            >
              <div className="absolute top-0 right-0 p-1 opacity-60">
                <FontAwesomeIcon icon="external-link-alt" />
              </div>
              <pre className="p-2 whitespace-pre-wrap overflow-x-auto">
                <code>{oAuthUrl}</code>
              </pre>
            </div>

            <p className="py-1">
              The OAuth link for getting the authorisation code has been created. Click on the link above to get the{' '}
              <b className="underline decoration-wavy decoration-yellow-400">authorisation code</b>. Your browser will
              open a new tab to Microsoft&apos;s account login page. After logging in and authenticating with your
              Microsoft account, you will be redirected to a blank page on localhost. Paste{' '}
              <b className="underline decoration-wavy decoration-teal-500">the entire redirected URL</b> down below.
            </p>

            <div className="my-4 rounded overflow-hidden w-2/3 mx-auto">
              <Image src="/images/step-2-screenshot.png" width={1466} height={607} alt="step 2 screenshot" />
            </div>

            <input
              className={`w-full flex-1 border bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring focus:outline-none p-2 font-mono rounded my-2 font-medium text-sm ${
                authCode
                  ? 'border-green-500/50 focus:ring-green-500/30 dark:focus:ring-green-500/40'
                  : 'border-red-500/50 focus:ring-red-500/30 dark:focus:ring-red-500/40'
              }`}
              autoFocus
              type="text"
              placeholder="http://localhost/?code=M.R3_BAY.c0..."
              value={oAuthRedirectedUrl}
              onChange={e => {
                setOAuthRedirectedUrl(e.target.value)
                setAuthCode(extractAuthCodeFromRedirected(e.target.value))
              }}
            />

            <p className="py-1">The authorisation code extracted is:</p>
            <p className="my-2 font-mono border border-gray-400/20 rounded text-sm bg-gray-50 dark:bg-gray-800 p-2 opacity-80 truncate overflow-hidden">
              {authCode || <span className="animate-pulse">Waiting for code...</span>}
            </p>

            <p>
              {authCode
                ? '✅ You can now proceed onto the next step: requesting your access token and refresh token.'
                : '❌ No valid code extracted.'}
            </p>

            <div className="text-right mb-2 mt-6">
              <button
                className="text-white bg-gradient-to-br from-green-500 to-cyan-400 hover:bg-gradient-to-bl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center disabled:cursor-not-allowed disabled:grayscale"
                disabled={authCode === ''}
                onClick={() => {
                  setButtonLoading(true)
                  router.push({ pathname: '/onedrive-vercel-index-oauth/step-3', query: { authCode } })
                }}
              >
                {buttonLoading ? (
                  <>
                    <span>Requesting tokens</span> <LoadingIcon className="animate-spin w-4 h-4 ml-1 inline" />
                  </>
                ) : (
                  <>
                    <span>Get tokens</span> <FontAwesomeIcon icon="arrow-right" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
