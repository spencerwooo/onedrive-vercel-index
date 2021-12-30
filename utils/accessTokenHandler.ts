import axios from 'axios'
import CryptoJS from 'crypto-js'
import Keyv from 'keyv'
import KeyvFile from 'keyv-file'

import apiConfig from '../config/api.json'

const AES_SECRET_KEY = 'onedrive-vercel-index'

export function obfuscateToken(token: string): string {
  // Encrypt token with AES
  const encrypted = CryptoJS.AES.encrypt(token, AES_SECRET_KEY)
  return encrypted.toString()
}

export function revealObfuscatedToken(obfuscated: string): string {
  // Decrypt SHA256 obfuscated token
  const decrypted = CryptoJS.AES.decrypt(obfuscated, AES_SECRET_KEY)
  return decrypted.toString(CryptoJS.enc.Utf8)
}

export function generateAuthorisationUrl(): string {
  const { clientId, redirectUri, authApi } = apiConfig
  const authUrl = authApi.replace('/token', '/authorize')

  // Construct URL parameters for OAuth2
  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('redirect_uri', redirectUri)
  params.append('response_type', 'code')
  params.append('scope', 'files.readwrite offline_access')
  params.append('response_mode', 'query')

  return `${authUrl}?${params.toString()}`
}

export function extractAuthCodeFromRedirected(url: string): string {
  // Return empty string if the url is not the defined redirect uri
  if (!url.startsWith(apiConfig.redirectUri)) {
    return ''
  }

  // New URL search parameter
  const params = new URLSearchParams(url.split('?')[1])
  return params.get('code') || ''
}

export async function requestTokenWithAuthCode(
  code: string
): Promise<
  | { expiryTime: string; accessToken: string; refreshToken: string }
  | { error: string; errorDescription: string; errorUri: string }
> {
  const { clientId, redirectUri, authApi } = apiConfig
  const clientSecret = revealObfuscatedToken(apiConfig.obfuscatedClientSecret)

  // Construct URL parameters for OAuth2
  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('redirect_uri', redirectUri)
  params.append('client_secret', clientSecret)
  params.append('code', code)
  params.append('grant_type', 'authorization_code')

  // Request access token
  return axios
    .post(authApi, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(resp => {
      const { expires_in, access_token, refresh_token } = resp.data
      return { expiryTime: expires_in, accessToken: access_token, refreshToken: refresh_token }
    })
    .catch(err => {
      const { error, error_description, error_uri } = err.response.data
      return { error, errorDescription: error_description, errorUri: error_uri }
    })
}

export function storeTokens(accessToken: string, refreshToken: string) {
  // We can safely leverage Vercel's /tmp directory, and persist the tokens with file-system based KV storage
  const kv = new Keyv({ store: new KeyvFile(), namespace: 'onedrive-vercel-index' })
}
