export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}
