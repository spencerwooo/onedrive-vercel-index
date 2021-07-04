export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

export const getTitle = () => {
  return process.env.TITLE ? process.env.TITLE : siteConfig.title
}