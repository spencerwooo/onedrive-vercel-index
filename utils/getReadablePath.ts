/**
 * Make path readable but still valid in URL (means the whole URL is still recognized as a URL)
 * @param path Path. May be used as URL path or query value.
 * @returns Readable but still valid path
 */
export function getReadablePath(path: string) {
  path = path
    .split('/')
    .map(s => decodeURIComponent(s))
    .map(s =>
      Array.from(s)
        .map(c => (isSafeChar(c) ? c : encodeURIComponent(c)))
        .join('')
    )
    .join('/')
  return path
}

// Check if the character is safe (means no need of percent-encoding)
function isSafeChar(c: string) {
  if (c.charCodeAt(0) < 0x80) {
    // ASCII
    if (/^[a-zA-Z0-9\-._~]$/.test(c)) {
      // RFC3986 unreserved chars
      return true
    } else if (/^[*:@,!]$/.test(c)) {
      // Some extra pretty safe chars for URL path or query
      // Ref: https://stackoverflow.com/a/42287988/11691878
      return true
    }
  } else {
    if (!/\s|\u180e/.test(c)) {
      // Non-whitespace char. \u180e is missed in \s.
      return true
    }
  }
  return false
}
