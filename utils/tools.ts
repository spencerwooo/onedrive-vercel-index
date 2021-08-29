import useSWR, { cache, Key } from 'swr'
import axios from 'axios'

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
const fetcher = (url: string) => axios.get(url).then(res => res.data)
/**
 * Use stale SWR instead of revalidating on each request. Not ideal for this scenario but have to do
 * if fetching serverside props from component instead of pages.
 * @param dataKey request url
 * @returns useSWR instance
 */
export const useStaleSWR = (dataKey: Key) => {
  const revalidationOptions = {
    revalidateOnMount: !cache.has(dataKey), //here we refer to the SWR cache
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  }

  return useSWR(dataKey, fetcher, revalidationOptions)
}
