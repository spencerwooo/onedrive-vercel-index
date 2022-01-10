import axios from 'axios'
import useSWR, { cache, Key, useSWRInfinite } from 'swr'

import { getStoredToken } from './protectedRouteHandler'

// Common axios fetch function for use with useSWR
export async function fetcher(url: string, token?: string): Promise<any> {
  try {
    return (
      await (token
        ? axios.get(url, {
            headers: { 'od-protected-token': token },
          })
        : axios.get(url))
    ).data
  } catch (err: any) {
    throw { status: err.response.status, message: err.response.data }
  }
}
/**
 * Use stale SWR instead of revalidating on each request. Not ideal for this scenario but have to do
 * if fetching serverside props from component instead of pages.
 * @param url request url
 * @returns useSWR instance
 */
export function useStaleSWR({ url, path = '' }: { url: Key; path?: string }) {
  const revalidationOptions = {
    revalidateOnMount: !(cache.has(`arg@"${url}"@null`) || cache.has(url)),
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  }

  const hashedToken = getStoredToken(path)
  return useSWR([url, hashedToken], fetcher, revalidationOptions)
}

/**
 * Paging with useSWRInfinite + protected token support
 * @param path Current query directory path
 * @returns useSWRInfinite API
 */
export function useProtectedSWRInfinite(path: string = '') {
  const hashedToken = getStoredToken(path)

  /**
   * Next page infinite loading for useSWR
   * @param pageIdx The index of this paging collection
   * @param prevPageData Previous page information
   * @param path Directory path
   * @returns API to the next page
   */
  function getNextKey(pageIndex, previousPageData): (string | null)[] | null {
    // Reached the end of the collection
    if (previousPageData && !previousPageData.folder) return null

    // First page with no prevPageData
    if (pageIndex === 0) return [`/api?path=${path}`, hashedToken]

    // Add nextPage token to API endpoint
    return [`/api?path=${path}&next=${previousPageData.next}`, hashedToken]
  }

  // const revalidationOptions = {
  //   revalidateOnMount: !(cache.has(`arg@"/api?path=${path}"@null`) || cache.has(`/api?path=${path}`)),
  //   revalidateOnFocus: false,
  //   revalidateOnReconnect: true,
  // }
  // return useSWRInfinite(getNextKey, fetcher, revalidationOptions)
  return useSWRInfinite(getNextKey, fetcher)
}
