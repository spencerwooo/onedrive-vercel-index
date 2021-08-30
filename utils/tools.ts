import axios from 'axios'
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

  const token =
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(matchProtectedRoute(path)) as string) : ''

  return useSWR([url, token], fetcher, revalidationOptions)
}

export const matchProtectedRoute = (route: string) => {
  const protectedRoutes = siteConfig.protectedRoutes
  let authTokenPath = ''
  for (const r of protectedRoutes) {
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
  return authTokenPath
}
