import axios from 'axios'
import sha256 from 'crypto-js/sha256'
import useSWR, { cache, Key, useSWRInfinite } from 'swr'
import JSZip from 'jszip'

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

// Common axios fetch function for use with useSWR
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

  const hashedToken = getStoredToken(path)
  return useSWR([url, hashedToken], fetcher, revalidationOptions)
}

/**
 * Paging with useSWRInfinite + protected token support
 * @param path Current query directory path
 * @returns useSWRInfinite API
 */
export const useProtectedSWRInfinite = (path: string = '') => {
  const hashedToken = getStoredToken(path)

  /**
   * Next page infinite loading for useSWR
   * @param pageIdx The index of this paging collection
   * @param prevPageData Previous page information
   * @param path Directory path
   * @returns API to the next page
   */
  const getNextKey = (pageIndex, previousPageData) => {
    // Reached the end of the collection
    if (previousPageData && !previousPageData.folder) return null

    // First page with no prevPageData
    if (pageIndex === 0) return [`/api?path=${path}`, hashedToken]

    // Add nextPage token to API endpoint
    return [`/api?path=${path}&next=${previousPageData.next}`, hashedToken]
  }

  const revalidationOptions = {
    revalidateOnMount: !(cache.has(`arg@"/api?path=${path}"@null`) || cache.has(`/api?path=${path}`)),
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  }
  return useSWRInfinite(getNextKey, fetcher, revalidationOptions)
}

// Hash password token with SHA256
const encryptToken = (token: string) => {
  return sha256(token).toString()
}
// Fetch stored token from localStorage and encrypt with SHA256
const getStoredToken = (path: string) => {
  const storedToken =
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(matchProtectedRoute(path)) as string) : ''
  return storedToken ? encryptToken(storedToken) : null
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

/**
 * Match the specified route against a list of predefined routes
 * @param route directory path
 * @returns whether the directory is protected
 */
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

/**
 * Download multiple files after compressing them into a zip
 * @param files Files to be downloaded
 * @param folder Optional folder name to hold files, otherwise flatten files in the zip
 */
export const downloadMultipleFiles = async (files: { name: string; url: string }[], folder?: string) => {
  const zip = new JSZip()
  const dir = folder ? zip.folder(folder)! : zip

  // Add selected file blobs to zip
  files.forEach(({ name, url }) => {
    dir.file(
      name,
      fetch(url).then(r => r.blob())
    )
  })

  // Create zip file and download it
  const b = await zip.generateAsync({ type: 'blob' })
  downloadBlob(b, folder ? folder + '.zip' : 'download.zip')
}

// Blob download helper
const downloadBlob = (b: Blob, name: string) => {
  // Prepare for download
  const el = document.createElement('a')
  el.style.display = 'none'
  document.body.appendChild(el)

  // Download zip file
  const bUrl = window.URL.createObjectURL(b)
  el.href = bUrl
  el.download = name
  el.click()
  window.URL.revokeObjectURL(bUrl)
  el.remove()
}

// One-shot DFS file traversing for the folder.
// Due to react hook limit, we cannot reuse SWR utils for recursive actions.
// Only root dir meta, without returning from API, will be undefined.
export async function* traverseFolder(path: string) {
  const hashedToken = getStoredToken(path)
  const root = new PathNode(path)
  const loader = async (path: string) => {
    const data: any = await fetcher(`/api?path=${path}`, hashedToken ?? undefined)
    if (data && data.folder) {
      return data.folder.value.map(c => {
        const p = `${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`
        return new PathNode(p, Boolean(c.folder), c)
      })
    } else {
      throw new Error('Path is not folder')
    }
  }
  yield* root.dfs(loader)
}

// Traverse helper
class PathNode {
  private _path: string
  private _meta: any
  private _isFolder: boolean

  constructor(path: string, isFolder?: boolean, meta?: any) {
    this._path = path
    this._meta = meta
    this._isFolder = isFolder ?? true
  }

  async* dfs(loader: (path: string) => Promise<PathNode[]>) {
    const ancestors = [this as PathNode]
    while (ancestors.length > 0) {
      const next = ancestors.pop()!
      if (next._isFolder) {
        ancestors.push(...await loader(next._path))
      }
      yield { path: next._path, meta: next._meta, isFolder: next._isFolder }
    }
  }
}

/**
 * Download hieratical tree-like files after compressing them into a zip
 * @param files Files to be downloaded. Folder should be in front of its children in the array.
 * Use async generator because generation of elements may be slow.
 * When waiting for generation, we can also download bodies of got element.
 * The root dir should be the first element.
 * Only folder elements have url param undefined. And only root dir of the folders have name param undefined.
 * @param folder Optional folder name to hold files, otherwise flatten files in the zip.
 * Root folder name passed in files param is not unused, on the contrary use this param as top-level folder name.
 */
export const downloadTreelikeMultipleFiles = async (
  files: AsyncGenerator<{ name: string, url?: string, path: string, isFolder: boolean }>, folder?: string,
) => {
  const zip = new JSZip()
  const root = folder ? zip.folder(folder)! : zip
  const map = [{ path: '/', dir: root }] // Root path will be set later in looping

  // Add selected file blobs to zip according to its path
  for await (const { name, url, path, isFolder } of files) {
    if (name === undefined) {
      map[0].path = path
      continue
    }
    const i = map.slice().reverse().findIndex(({ path: parent }) => (
      path.substring(0, parent.length) === parent && path.substring(parent.length + 1).indexOf('/') === -1
    ))
    if (i === -1) throw new Error('File array does not satisfy requirement')
    const dir = map[map.length - 1 - i].dir
    if (isFolder) {
      map.push({ path, dir: dir.folder(name)! })
    } else {
      dir.file(name, fetch(url!).then(r => r.blob()))
    }
  }

  // Create zip file and download it
  const b = await zip.generateAsync({ type: 'blob' })
  downloadBlob(b, folder ? folder + '.zip' : 'download.zip')
}
