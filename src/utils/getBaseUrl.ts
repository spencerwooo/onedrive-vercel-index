/**
 * Extract the current web page's base url
 * @returns base url of the page
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}
