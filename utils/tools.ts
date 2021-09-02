import axios from 'axios'
import sha256 from 'crypto-js/sha256'
import useSWR, { cache, Key } from 'swr'

import siteConfig from '../config/site.json'

/**
 * Extract the current web page's base url
 * @returns base url of the page
 */
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

// Common axios fetch function
const fetcher = (url: string, token?: string) => {
  return token
    ? axios
        .get(url, {
          headers: { 'od-protected-token': token },
        })
        .then(res => res.data)
    : axios.get(url).then(res => res.data)
}
/**
 * Use stale SWR instead of revalidating on each request. Not ideal for this scenario but have to do
 * if fetching serverside props from component instead of pages.
 * @param url request url
 * @returns useSWR instance
 */
export const useStaleSWR = (url: Key, path: string = '') => {
  const revalidationOptions = {
    revalidateOnMount: !(cache.has(`arg@"${url}"@null`) || cache.has(url)),
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  }

  const storedToken =
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(matchProtectedRoute(path)) as string) : ''
  const hashedToken = storedToken ? encryptToken(storedToken) : null

  return useSWR([url, hashedToken], fetcher, revalidationOptions)
}

const encryptToken = (token: string) => {
  return sha256(token).toString()
}
/**
 * Compares the hash of .password and od-protected-token header
 * @param odTokenHeader od-protected-token header (sha256 hashed token)
 * @param dotPassword non-hashed .password file
 * @returns whether the two hashes are the same
 */
export const compareHashedToken = (odTokenHeader: string, dotPassword: string) => {
  return encryptToken(dotPassword.trim()) === odTokenHeader
}

export const matchProtectedRoute = (route: string) => {
  const protectedRoutes: string[] = siteConfig.protectedRoutes
  let authTokenPath = ''

  for (const r of protectedRoutes) {
    // protected route array could be empty
    if (r) {
      if (
        route.startsWith(
          r
            .split('/')
            .map(p => encodeURIComponent(p))
            .join('/')
        )
      ) {
        authTokenPath = r
        break
      }
    }
  }
  return authTokenPath
}
