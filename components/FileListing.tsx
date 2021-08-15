import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast'
import emojiRegex from 'emoji-regex'

import { ParsedUrlQuery } from 'querystring'
import { FunctionComponent, useState } from 'react'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import useSWR from 'swr'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import { getExtension, getFileIcon, hasKey } from '../utils/getFileIcon'
import { extensions, preview } from '../utils/getPreviewType'
import { getBaseUrl } from '../utils/tools'
import { VideoPreview } from './previews/VideoPreview'
import { AudioPreview } from './previews/AudioPreview'
import Loading from './Loading'
import FourOhFour from './FourOhFour'
import TextPreview from './previews/TextPreview'
import MarkdownPreview from './previews/MarkdownPreview'
import CodePreview from './previews/CodePreview'
import OfficePreview from './previews/OfficePreview'
import DownloadBtn from './DownloadBtn'

// Disabling SSR for some previews (image gallery view, and PDF view)
const ReactViewer = dynamic(() => import('react-viewer'), { ssr: false })
const PDFPreview = dynamic(() => import('./previews/PDFPreview'), { ssr: false })

/**
 * Convert raw bits file/folder size into a human readable string
 *
 * @param size File or folder size, in raw bits
 * @returns Human readable form of the file or folder size
 */
const humanFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  const i = Math.floor(Math.log(size) / Math.log(1024))
  const num = size / Math.pow(1024, i)
  const round = Math.round(num)
  const formatted = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round
  return `${formatted} ${'KMGTPEZY'[i - 1]}B`
}

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

const fetcher = (url: string) => {
  console.log(url)
  return axios.get(url).then(res => res.data)
}

const FileListItem: FunctionComponent<{
  fileContent: { id: string; name: string; size: number; file: Object; lastModifiedDateTime: string }
}> = ({ fileContent: c }) => {
  const emojiIcon = emojiRegex().exec(c.name)
  const renderEmoji = emojiIcon && !emojiIcon.index

  return (
    <div className="p-3 grid grid-cols-10 items-center space-x-2 cursor-pointer hover:bg-gray-100">
      <div className="flex space-x-2 items-center col-span-10 md:col-span-7 truncate">
        {/* <div>{c.file ? c.file.mimeType : 'folder'}</div> */}
        <div className="w-5 text-center flex-shrink-0">
          {renderEmoji ? (
            <span>{emojiIcon ? emojiIcon[0] : '📁'}</span>
          ) : (
            <FontAwesomeIcon icon={c.file ? getFileIcon(c.name) : ['far', 'folder']} />
          )}
        </div>
        <div className="truncate">
          {renderEmoji ? c.name.replace(emojiIcon ? emojiIcon[0] : '', '').trim() : c.name}
        </div>
      </div>
      <div className="hidden md:block font-mono text-sm col-span-2 text-gray-700 flex-shrink-0">
        {new Date(c.lastModifiedDateTime).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}
      </div>
      <div className="hidden md:block font-mono text-sm text-gray-700 flex-shrink-0">{humanFileSize(c.size)}</div>
    </div>
  )
}

const FileListing: FunctionComponent<{ query?: ParsedUrlQuery }> = ({ query }) => {
  const [imageViewerVisible, setImageViewerVisibility] = useState(false)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  const router = useRouter()

  const path = queryToPath(query)

  const { data, error } = useSWR(`/api?path=${path}`, fetcher, {
    revalidateOnFocus: false,
  })

  if (error) {
    return (
      <div className="shadow bg-white rounded p-3">
        <FourOhFour errorMsg={error.message} />
      </div>
    )
  }
  if (!data) {
    return (
      <div className="shadow bg-white rounded p-3">
        <Loading loadingText="Loading ..." />
      </div>
    )
  }

  const resp = data.data
  const fileIsImage = (fileName: string) => {
    const fileExtension = getExtension(fileName)
    if (hasKey(extensions, fileExtension)) {
      if (extensions[fileExtension] === preview.image) {
        return true
      }
    }
    return false
  }

  if ('folder' in resp) {
    const { children } = resp

    // Image preview rendering preparations
    const imagesInFolder: ImageDecorator[] = []
    const imageIndexDict: { [key: string]: number } = {}
    let imageIndex = 0

    // README rendering preparations
    let renderReadme = false
    let readmeFile = null

    children.forEach((c: any) => {
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

    return (
      <div className="bg-white shadow rounded">
        <div className="p-3 grid grid-cols-10 items-center space-x-2 border-b border-gray-200">
          <div className="col-span-10 md:col-span-7 font-bold">Name</div>
          <div className="hidden md:block font-bold col-span-2">Last Modified</div>
          <div className="hidden md:block font-bold">Size</div>
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
                  render: <FontAwesomeIcon icon="copy" />,
                  onClick: i => {
                    navigator.clipboard.writeText(
                      i.alt ? `${getBaseUrl()}/api?path=${encodeURIComponent(path + '/' + i.alt)}&raw=true` : ''
                    )
                    toast.success('Copied image permanent link to clipboard.')
                  },
                },
              ])
            }}
          />
        )}

        {children.map((c: any) => (
          <div
            key={c.id}
            onClick={e => {
              e.preventDefault()

              if (!c.folder && fileIsImage(c.name)) {
                setActiveImageIdx(imageIndexDict[c.id])
                setImageViewerVisibility(true)
              } else {
                console.log(path)
                router.push(`${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`)
              }
            }}
          >
            <FileListItem fileContent={c} />
          </div>
        ))}

        {renderReadme && (
          <div className="border-t">
            <MarkdownPreview file={readmeFile} standalone={false} />
          </div>
        )}
      </div>
    )
  }

  if ('file' in resp) {
    const downloadUrl = resp['@microsoft.graph.downloadUrl']
    const fileName = resp.name
    const fileExtension = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()

    if (hasKey(extensions, fileExtension)) {
      switch (extensions[fileExtension]) {
        case preview.image:
          return (
            <div className="shadow bg-white rounded p-3 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="mx-auto" src={downloadUrl} alt={fileName} />
            </div>
          )

        case preview.text:
          return <TextPreview file={resp} />

        case preview.code:
          return <CodePreview file={resp} />

        case preview.markdown:
          return <MarkdownPreview file={resp} />

        case preview.video:
          return <VideoPreview file={resp} />

        case preview.audio:
          return <AudioPreview file={resp} />

        case preview.pdf:
          return <PDFPreview file={resp} />

        case preview.office:
          return <OfficePreview file={resp} />

        default:
          return <div className="bg-white shadow rounded">{fileName}</div>
      }
    }

    return (
      <>
        <div className="shadow bg-white rounded p-3">
          <FourOhFour
            errorMsg={`Preview for file ${resp.name} is not available, download directly with the button below.`}
          />
        </div>
        <div className="mt-4">
          <DownloadBtn downloadUrl={downloadUrl} />
        </div>
      </>
    )
  }

  return (
    <div className="shadow bg-white rounded p-3">
      <FourOhFour errorMsg={`Cannot preview ${resp.name}.`} />
    </div>
  )
}

export default FileListing
