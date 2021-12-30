import Head from 'next/head'
import router from 'next/router'
import { useState } from 'react'

import siteConfig from '../../config/site.json'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { extractAuthCodeFromRedirected, generateAuthorisationUrl } from '../../utils/accessTokenHandler'

export default function OAuthStep2() {
  const [oAuthRedirectedUrl, setOAuthRedirectedUrl] = useState('')
  const [authCode, setAuthCode] = useState('')
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
            <h3 className="font-medium text-xl mb-4">Welcome to your new onedrive-vercel-index 🎉</h3>

            <p className="py-1">
              Authorisation is required as no valid{' '}
              <code className="text-sm font-mono underline decoration-wavy decoration-pink-600">access_token</code> or{' '}
              <code className="text-sm font-mono underline decoration-wavy decoration-green-600">refresh_token</code> is
              present on this deployed instance.
            </p>

            <h3 className="font-medium text-lg mt-4 mb-2">Step 2: Get authorisation code</h3>
            <p className="py-1">The OAuth URL has been generated for you:</p>
            <div
              className="relative my-2 font-mono border border-gray-400/20 rounded text-sm bg-gray-50 dark:bg-gray-800 cursor-pointer hover:opacity-80"
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
              Click on the link to get the{' '}
              <b className="underline decoration-wavy decoration-yellow-400">authorisation code</b>. Your browser will
              open a new tab to Microsoft&apos;s account login page. Authenticate with your Microsoft account and copy
              the redirected URL down below.
            </p>

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
            <p className="my-2 font-mono border border-gray-400/20 rounded text-sm bg-gray-50 dark:bg-gray-800 p-2 opacity-80">
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
                  router.push({ pathname: '/onedrive-vercel-index-oauth/step-3', query: { authCode } })
                }}
              >
                <span>Get tokens</span> <FontAwesomeIcon icon="arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
