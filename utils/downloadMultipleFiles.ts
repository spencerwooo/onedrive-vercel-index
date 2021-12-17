import toast from 'react-hot-toast'
import JSZip from 'jszip'

import { fetcher } from './fetchWithSWR'
import { getStoredToken } from './protectedRouteHandler'

// Blob download helper
export function downloadBlob({ blob, name }: { blob: Blob; name: string }) {
  // Prepare for download
  const el = document.createElement('a')
  el.style.display = 'none'
  document.body.appendChild(el)

  // Download zip file
  const bUrl = window.URL.createObjectURL(blob)
  el.href = bUrl
  el.download = name
  el.click()
  window.URL.revokeObjectURL(bUrl)
  el.remove()
}

/**
 * Download multiple files after compressing them into a zip
 * @param toastId Toast ID to be used for toast notification
 * @param files Files to be downloaded
 * @param folder Optional folder name to hold files, otherwise flatten files in the zip
 */
export async function downloadMultipleFiles({
  toastId,
  files,
  folder,
}: {
  toastId: string
  files: { name: string; url: string }[]
  folder?: string
}): Promise<void> {
  const zip = new JSZip()
  const dir = folder ? zip.folder(folder)! : zip

  // Add selected file blobs to zip
  files.forEach(({ name, url }) => {
    dir.file(
      name,
      fetch(url).then(r => {
        return r.blob()
      })
    )
  })

  // Create zip file and download it
  const b = await zip.generateAsync({ type: 'blob' }, metadata => {
    toast.loading(`Downloading ${metadata.percent.toFixed(0)}%. Refresh to cancel...`, {
      id: toastId,
    })
  })
  downloadBlob({ blob: b, name: folder ? folder + '.zip' : 'download.zip' })
}

/**
 * Download hierarchical tree-like files after compressing them into a zip
 * @param toastId Toast ID to be used for toast notification
 * @param files Files to be downloaded. Array of file and folder items excluding root folder.
 * Folder items MUST be in front of its children items in the array.
 * Use async generator because generation of the array may be slow.
 * When waiting for its generation, we can meanwhile download bodies of already got items.
 * Only folder items can have url undefined.
 * @param basePath Root dir path of files to be downloaded
 * @param folder Optional folder name to hold files, otherwise flatten files in the zip
 */

export async function downloadTreelikeMultipleFiles({
  toastId,
  files,
  basePath,
  folder,
}: {
  toastId: string
  files: AsyncGenerator<{
    name: string
    url?: string
    path: string
    isFolder: boolean
  }>
  basePath: string
  folder?: string
}): Promise<void> {
  const zip = new JSZip()
  const root = folder ? zip.folder(folder)! : zip
  const map = [{ path: basePath, dir: root }]

  // Add selected file blobs to zip according to its path
  for await (const { name, url, path, isFolder } of files) {
    // Search parent dir in map
    const i = map
      .slice()
      .reverse()
      .findIndex(
        ({ path: parent }) =>
          path.substring(0, parent.length) === parent && path.substring(parent.length + 1).indexOf('/') === -1
      )
    if (i === -1) {
      throw new Error('File array does not satisfy requirement')
    }

    // Add file or folder to zip
    const dir = map[map.length - 1 - i].dir
    if (isFolder) {
      map.push({ path, dir: dir.folder(name)! })
    } else {
      dir.file(
        name,
        fetch(url!).then(r => r.blob())
      )
    }
  }

  // Create zip file and download it
  const b = await zip.generateAsync({ type: 'blob' }, metadata => {
    toast.loading(`Downloading ${metadata.percent.toFixed(0)}%. Refresh to cancel...`, {
      id: toastId,
    })
  })
  downloadBlob({ blob: b, name: folder ? folder + '.zip' : 'download.zip' })
}

/**
 * One-shot concurrent BFS file traversing for the folder.
 * Due to react hook limit, we cannot reuse SWR utils for recursive actions.
 * We will directly fetch API and arrange responses instead.
 * In folder tree, we visit folders with same level concurrently.
 * Every time we visit a folder, we fetch and return meta of all its children.
 * @param path Folder to be traversed
 * @returns Array of items representing folders and files of traversed folder in BFS order and excluding root folder.
 * Due to BFS, folder items are ALWAYS in front of its children items.
 */
export async function* traverseFolder(path: string): AsyncGenerator<
  {
    path: string
    meta: any
    isFolder: boolean
  },
  void,
  undefined
> {
  const hashedToken = getStoredToken(path)
  let folderPaths = [path]

  while (folderPaths.length > 0) {
    const itemLists = await Promise.all(
      folderPaths.map(fp =>
        (async fp => {
          const data = await fetcher(`/api?path=${fp}`, hashedToken ?? undefined)
          if (data && data.folder) {
            return data.folder.value.map((c: any) => {
              const p = `${fp === '/' ? '' : fp}/${encodeURIComponent(c.name)}`
              return { path: p, meta: c, isFolder: Boolean(c.folder) }
            })
          } else {
            throw new Error('Path is not folder')
          }
        })(fp)
      )
    )

    const items = itemLists.flat() as { path: string; meta: any; isFolder: boolean }[]
    yield* items
    folderPaths = items.filter(i => i.isFolder).map(i => i.path)
  }
}
