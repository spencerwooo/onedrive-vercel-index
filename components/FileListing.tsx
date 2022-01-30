import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast'
import emojiRegex from 'emoji-regex'
import { useClipboard } from 'use-clipboard-copy'

import { ParsedUrlQuery } from 'querystring'
import { FC, MouseEventHandler, SetStateAction, useEffect, useRef, useState } from 'react'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import { humanFileSize, formatModifiedDateTime } from '../utils/fileDetails'
import { getExtension, getFileIcon } from '../utils/getFileIcon'
import { getPreviewType, preview } from '../utils/getPreviewType'
import { useProtectedSWRInfinite } from '../utils/fetchWithSWR'
import { getBaseUrl } from '../utils/getBaseUrl'
import {
  DownloadingToast,
  downloadMultipleFiles,
  downloadTreelikeMultipleFiles,
  traverseFolder,
} from './MultiFileDownloader'

import Loading, { LoadingIcon } from './Loading'
import FourOhFour from './FourOhFour'
import Auth from './Auth'
import TextPreview from './previews/TextPreview'
import MarkdownPreview from './previews/MarkdownPreview'
import CodePreview from './previews/CodePreview'
import OfficePreview from './previews/OfficePreview'
import AudioPreview from './previews/AudioPreview'
import VideoPreview from './previews/VideoPreview'
import PDFPreview from './previews/PDFPreview'
import URLPreview from './previews/URLPreview'
import DefaultPreview from './previews/DefaultPreview'
import { DownloadBtnContainer, PreviewContainer } from './previews/Containers'
import DownloadButtonGroup from './DownloadBtnGtoup'

import { OdFileObject, OdFolderObject } from '../types'

// Disabling SSR for some previews (image gallery view, and PDF view)
const ReactViewer = dynamic(() => import('react-viewer'), { ssr: false })
const EPUBPreview = dynamic(() => import('./previews/EPUBPreview'), { ssr: false })

/**
 * Convert url query into path string
 *
 * @param query Url query property
 * @returns Path string
 */
const queryToPath = (query?: ParsedUrlQuery) => {
  if (query) {
    const { path } = query
    if (!path) return '/'
    if (typeof path === 'string') return `/${encodeURIComponent(path)}`
    return `/${path.map(p => encodeURIComponent(p)).join('/')}`
  }
  return '/'
}

const FileListItem: FC<{ fileContent: OdFolderObject['value'][number] }> = ({ fileContent: c }) => {
  const emojiIcon = emojiRegex().exec(c.name)
  const renderEmoji = emojiIcon && !emojiIcon.index

  return (
    <div className="grid items-center grid-cols-10 px-3 py-2.5 space-x-2 cursor-pointer">
      <div className="md:col-span-6 flex items-center col-span-10 space-x-2 truncate">
        {/* <div>{c.file ? c.file.mimeType : 'folder'}</div> */}
        <div className="flex-shrink-0 w-5 text-center">
          {renderEmoji ? (
            <span>{emojiIcon ? emojiIcon[0] : '📁'}</span>
          ) : (
            <FontAwesomeIcon icon={c.file ? getFileIcon(c.name, { video: Boolean(c.video) }) : ['far', 'folder']} />
          )}
        </div>
        <div className="truncate">
          {renderEmoji ? c.name.replace(emojiIcon ? emojiIcon[0] : '', '').trim() : c.name}
        </div>
      </div>
      <div className="md:block dark:text-gray-500 flex-shrink-0 hidden col-span-3 font-mono text-sm text-gray-700">
        {formatModifiedDateTime(c.lastModifiedDateTime)}
      </div>
      <div className="md:block dark:text-gray-500 flex-shrink-0 hidden col-span-1 font-mono text-sm text-gray-700 truncate">
        {humanFileSize(c.size)}
      </div>
    </div>
  )
}

const Checkbox: FC<{
  checked: 0 | 1 | 2
  onChange: () => void
  title: string
  indeterminate?: boolean
}> = ({ checked, onChange, title, indeterminate }) => {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.checked = Boolean(checked)
      if (indeterminate) {
        ref.current.indeterminate = checked == 1
      }
    }
  }, [ref, checked, indeterminate])

  const handleClick: MouseEventHandler = e => {
    if (ref.current) {
      if (e.target === ref.current) {
        e.stopPropagation()
      } else {
        ref.current.click()
      }
    }
  }

  return (
    <span
      title={title}
      className="hover:bg-gray-300 dark:hover:bg-gray-600 p-1.5 inline-flex items-center rounded cursor-pointer"
      onClick={handleClick}
    >
      <input
        className="form-check-input cursor-pointer"
        type="checkbox"
        value={checked ? '1' : ''}
        ref={ref}
        aria-label={title}
        onChange={onChange}
      />
    </span>
  )
}

const Downloading: FC<{ title: string }> = ({ title }) => {
  return (
    <span title={title} className="p-2 rounded" role="status">
      <LoadingIcon
        // Use fontawesome far theme via class `svg-inline--fa` to get style `vertical-align` only
        // for consistent icon alignment, as class `align-*` cannot satisfy it
        className="animate-spin w-4 h-4 inline-block svg-inline--fa"
      />
    </span>
  )
}

const FileListing: FC<{ query?: ParsedUrlQuery }> = ({ query }) => {
  const [imageViewerVisible, setImageViewerVisibility] = useState(false)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({})
  const [totalSelected, setTotalSelected] = useState<0 | 1 | 2>(0)
  const [totalGenerating, setTotalGenerating] = useState<boolean>(false)
  const [folderGenerating, setFolderGenerating] = useState<{ [key: string]: boolean }>({})

  const router = useRouter()
  const clipboard = useClipboard()

  const path = queryToPath(query)

  const { data, error, size, setSize } = useProtectedSWRInfinite(path)

  if (error) {
    console.log(error)

    // If error includes 403 which means the user has not completed initial setup, redirect to OAuth page
    if (error.status === 403) {
      router.push('/onedrive-vercel-index-oauth/step-1')
      return <div></div>
    }

    return (
      <PreviewContainer>
        {error.status === 401 ? <Auth redirect={path} /> : <FourOhFour errorMsg={JSON.stringify(error.message)} />}
      </PreviewContainer>
    )
  }
  if (!data) {
    return (
      <PreviewContainer>
        <Loading loadingText="Loading ..." />
      </PreviewContainer>
    )
  }

  const fileIsImage = (fileName: string) => {
    const fileExtension = getExtension(fileName)
    if (getPreviewType(fileExtension) === preview.image) {
      return true
    }
    return false
  }

  const responses: any[] = data ? [].concat(...data) : []

  const isLoadingInitialData = !data && !error
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd = isEmpty || (data && typeof data[data.length - 1]?.next === 'undefined')
  const onlyOnePage = data && typeof data[0].next === 'undefined'

  if ('folder' in responses[0]) {
    // Image preview rendering preparations
    const imagesInFolder: ImageDecorator[] = []
    const imageIndexDict: { [key: string]: number } = {}
    let imageIndex = 0

    // README rendering preparations
    let renderReadme = false
    let readmeFile = {}

    // Expand list of API returns into flattened file data
    const children = [].concat(...responses.map(r => r.folder.value)) as OdFolderObject['value']

    children.forEach(c => {
      if (fileIsImage(c.name)) {
        imagesInFolder.push({
          src: c['@microsoft.graph.downloadUrl'],
          alt: c.name,
          downloadUrl: c['@microsoft.graph.downloadUrl'],
        })
        imageIndexDict[c.id] = imageIndex
        imageIndex += 1
      }

      if (c.name.toLowerCase() === 'readme.md') {
        renderReadme = true
        readmeFile = c
      }
    })

    // Filtered file list helper
    const getFiles = () => children.filter(c => !c.folder && c.name !== '.password')

    // File selection
    const genTotalSelected = (selected: { [key: string]: boolean }) => {
      const selectInfo = getFiles().map(c => Boolean(selected[c.id]))
      const [hasT, hasF] = [selectInfo.some(i => i), selectInfo.some(i => !i)]
      return hasT && hasF ? 1 : !hasF ? 2 : 0
    }

    const toggleItemSelected = (id: string) => {
      let val: SetStateAction<{ [key: string]: boolean }>
      if (selected[id]) {
        val = { ...selected }
        delete val[id]
      } else {
        val = { ...selected, [id]: true }
      }
      setSelected(val)
      setTotalSelected(genTotalSelected(val))
    }

    const toggleTotalSelected = () => {
      if (genTotalSelected(selected) == 2) {
        setSelected({})
        setTotalSelected(0)
      } else {
        setSelected(Object.fromEntries(getFiles().map(c => [c.id, true])))
        setTotalSelected(2)
      }
    }

    // Selected file download
    const handleSelectedDownload = () => {
      const folderName = path.substring(path.lastIndexOf('/') + 1)
      const folder = folderName ? decodeURIComponent(folderName) : undefined
      const files = getFiles()
        .filter(c => selected[c.id])
        .map(c => ({ name: c.name, url: c['@microsoft.graph.downloadUrl'] }))

      if (files.length == 1) {
        const el = document.createElement('a')
        el.style.display = 'none'
        document.body.appendChild(el)
        el.href = files[0].url
        el.click()
        el.remove()
      } else if (files.length > 1) {
        setTotalGenerating(true)

        const toastId = toast.loading(DownloadingToast(router))
        downloadMultipleFiles({ toastId, router, files, folder })
          .then(() => {
            setTotalGenerating(false)
            toast.success('Finished downloading selected files.', { id: toastId })
          })
          .catch(() => {
            setTotalGenerating(false)
            toast.error('Failed to download selected files.', { id: toastId })
          })
      }
    }

    // Folder recursive download
    const handleFolderDownload = (path: string, id: string, name?: string) => () => {
      const files = (async function* () {
        for await (const { meta: c, path: p, isFolder, error } of traverseFolder(path)) {
          if (error) {
            toast.error(`Failed to download folder ${p}: ${error.status} ${error.message} Skipped it to continue.`)
            continue
          }
          yield {
            name: c?.name,
            url: c ? c['@microsoft.graph.downloadUrl'] : undefined,
            path: p,
            isFolder,
          }
        }
      })()

      setFolderGenerating({ ...folderGenerating, [id]: true })
      const toastId = toast.loading(DownloadingToast(router))

      downloadTreelikeMultipleFiles({ toastId, router, files, basePath: path, folder: name })
        .then(() => {
          setFolderGenerating({ ...folderGenerating, [id]: false })
          toast.success('Finished downloading folder.', { id: toastId })
        })
        .catch(() => {
          setFolderGenerating({ ...folderGenerating, [id]: false })
          toast.error('Failed to download folder.', { id: toastId })
        })
    }

    return (
      <>
        <div className="dark:bg-gray-900 dark:text-gray-100 bg-white rounded">
          <div className="dark:border-gray-500/30 grid items-center grid-cols-12 px-3 space-x-2 border-b border-gray-900/10">
            <div className="md:col-span-6 col-span-12 font-bold py-2 text-gray-600 dark:text-gray-300 uppercase tracking-widest text-xs">
              Name
            </div>
            <div className="md:block hidden col-span-3 font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest text-xs">
              Last Modified
            </div>
            <div className="md:block hidden font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest text-xs">
              Size
            </div>
            <div className="md:block hidden font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest text-xs">
              Actions
            </div>
            <div className="md:block hidden font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest text-xs">
              <div className="md:flex dark:text-gray-400 hidden p-1.5 text-gray-700">
                <Checkbox
                  checked={totalSelected}
                  onChange={toggleTotalSelected}
                  indeterminate={true}
                  title={'Select files'}
                />
                {totalGenerating ? (
                  <Downloading title="Downloading selected files, refresh page to cancel" />
                ) : (
                  <button
                    title="Download selected files"
                    className="hover:bg-gray-300 dark:hover:bg-gray-600 p-1.5 rounded cursor-pointer disabled:text-gray-400 disabled:dark:text-gray-600 disabled:hover:bg-white disabled:hover:dark:bg-gray-900 disabled:cursor-not-allowed"
                    disabled={totalSelected === 0}
                    onClick={handleSelectedDownload}
                  >
                    <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} size="lg" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <Toaster />

          {imagesInFolder.length !== 0 && (
            <ReactViewer
              zIndex={99}
              visible={imageViewerVisible}
              activeIndex={activeImageIdx}
              images={imagesInFolder}
              drag={false}
              rotatable={false}
              noClose={true}
              scalable={false}
              zoomSpeed={0.2}
              downloadable={true}
              downloadInNewWindow={true}
              onMaskClick={() => {
                setImageViewerVisibility(false)
              }}
              customToolbar={toolbars => {
                toolbars[0].render = <FontAwesomeIcon icon="plus" />
                toolbars[1].render = <FontAwesomeIcon icon="minus" />
                toolbars[2].render = <FontAwesomeIcon icon="arrow-left" />
                toolbars[3].render = <FontAwesomeIcon icon="undo" />
                toolbars[4].render = <FontAwesomeIcon icon="arrow-right" />
                toolbars[9].render = <FontAwesomeIcon icon="download" />
                return toolbars.concat([
                  {
                    key: 'copy',
                    render: <FontAwesomeIcon icon={['fas', 'copy']} />,
                    onClick: i => {
                      clipboard.copy(i.alt ? `${getBaseUrl()}/api?path=${path + '/' + i.alt}&raw=true` : '')
                      toast('Copied image permanent link to clipboard.', { icon: '👌' })
                    },
                  },
                ])
              }}
            />
          )}

          {children.map(c => (
            <div className="hover:bg-gray-100 dark:hover:bg-gray-850 grid grid-cols-12" key={c.id}>
              <div
                className="col-span-10"
                onClick={e => {
                  e.preventDefault()

                  if (!c.folder && fileIsImage(c.name)) {
                    setActiveImageIdx(imageIndexDict[c.id])
                    setImageViewerVisibility(true)
                  } else {
                    router.push(`${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`)
                  }
                }}
              >
                <FileListItem fileContent={c} />
              </div>
              {c.folder ? (
                <div className="md:flex dark:text-gray-400 hidden p-1.5 text-gray-700">
                  <span
                    title="Copy folder permalink"
                    className="hover:bg-gray-300 dark:hover:bg-gray-600 px-1.5 py-1 rounded cursor-pointer"
                    onClick={() => {
                      clipboard.copy(`${getBaseUrl()}${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`)
                      toast('Copied folder permalink.', { icon: '👌' })
                    }}
                  >
                    <FontAwesomeIcon icon={['far', 'copy']} />
                  </span>
                  {folderGenerating[c.id] ? (
                    <Downloading title="Downloading folder, refresh page to cancel" />
                  ) : (
                    <span
                      title="Download folder"
                      className="hover:bg-gray-300 dark:hover:bg-gray-600 px-1.5 py-1 rounded cursor-pointer"
                      onClick={() => {
                        const p = `${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`
                        handleFolderDownload(p, c.id, c.name)()
                      }}
                    >
                      <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
                    </span>
                  )}
                </div>
              ) : (
                <div className="md:flex dark:text-gray-400 hidden p-1.5 text-gray-700">
                  <span
                    title="Copy raw file permalink"
                    className="hover:bg-gray-300 dark:hover:bg-gray-600 px-1.5 py-1 rounded cursor-pointer"
                    onClick={() => {
                      clipboard.copy(
                        `${getBaseUrl()}/api?path=${path === '/' ? '' : path}/${encodeURIComponent(c.name)}&raw=true`
                      )
                      toast.success('Copied raw file permalink.')
                    }}
                  >
                    <FontAwesomeIcon icon={['far', 'copy']} />
                  </span>
                  <a
                    title="Download file"
                    className="hover:bg-gray-300 dark:hover:bg-gray-600 px-1.5 py-1 rounded cursor-pointer"
                    href={c['@microsoft.graph.downloadUrl']}
                  >
                    <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
                  </a>
                </div>
              )}
              <div className="md:flex dark:text-gray-400 hidden p-1.5 text-gray-700">
                {!c.folder && !(c.name === '.password') && (
                  <Checkbox
                    checked={selected[c.id] ? 2 : 0}
                    onChange={() => toggleItemSelected(c.id)}
                    title="Select file"
                  />
                )}
              </div>
            </div>
          ))}

          {!onlyOnePage && (
            <div>
              <div className="dark:border-gray-700 p-3 font-mono text-sm text-center text-gray-400 border-b border-gray-200">
                - showing {size} page{size > 1 ? 's' : ''} of {isLoadingMore ? '...' : children.length} files -
              </div>
              <button
                className={`flex items-center justify-center w-full p-3 space-x-2 disabled:cursor-not-allowed ${
                  isLoadingMore || isReachingEnd ? 'opacity-60' : 'hover:bg-gray-100 dark:hover:bg-gray-850'
                }`}
                onClick={() => setSize(size + 1)}
                disabled={isLoadingMore || isReachingEnd}
              >
                {isLoadingMore ? (
                  <>
                    <span>Loading ...</span>{' '}
                    <svg
                      className="animate-spin w-5 h-5 mr-3 -ml-1"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </>
                ) : isReachingEnd ? (
                  <span>No more files</span>
                ) : (
                  <>
                    <span>Load more</span>
                    <FontAwesomeIcon icon="chevron-circle-down" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        {renderReadme && (
          <div className="mt-4">
            <MarkdownPreview file={readmeFile} path={path} standalone={false} />
          </div>
        )}
      </>
    )
  }

  if ('file' in responses[0] && responses.length === 1) {
    const file = responses[0].file as OdFileObject
    const downloadUrl = file['@microsoft.graph.downloadUrl']
    const fileName = file.name
    const fileExtension = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()

    const previewType = getPreviewType(fileExtension, { video: Boolean(file.video) })
    if (previewType) {
      switch (previewType) {
        case preview.image:
          return (
            <>
              <PreviewContainer>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="mx-auto" src={downloadUrl} alt={fileName} />
              </PreviewContainer>
              <DownloadBtnContainer>
                <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
              </DownloadBtnContainer>
            </>
          )

        case preview.text:
          return <TextPreview file={file} />

        case preview.code:
          return <CodePreview file={file} />

        case preview.markdown:
          return <MarkdownPreview file={file} path={path} />

        case preview.video:
          return <VideoPreview file={file} />

        case preview.audio:
          return <AudioPreview file={file} />

        case preview.pdf:
          return <PDFPreview file={file} />

        case preview.office:
          return <OfficePreview file={file} />

        case preview.epub:
          return <EPUBPreview file={file} />

        case preview.url:
          return <URLPreview file={file} />

        default:
          return <DefaultPreview file={file} />
      }
    } else {
      return <DefaultPreview file={file} />
    }
  }

  return (
    <PreviewContainer>
      <FourOhFour errorMsg={`Cannot preview ${path}`} />
    </PreviewContainer>
  )
}
export default FileListing
