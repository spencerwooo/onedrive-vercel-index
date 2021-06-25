import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { ParsedUrlQuery } from 'querystring'
import { FunctionComponent, useState } from 'react'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'

import useSWR from 'swr'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import Loading from './Loading'

import { getExtension, getFileIcon, hasKey } from '../utils/getFileIcon'
import { extensions, preview } from '../utils/getPreviewType'
import { VideoPreview } from './previews/VideoPreview'
import { AudioPreview } from './previews/AudioPreview'
import FourOhFour from './FourOhFour'
import TextPreview from './previews/TextPreview'

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
    if (typeof path === 'string') return `/${path}`
    return `/${path.join('/')}`
  }
  return '/'
}

const fetcher = (url: string) => axios.get(url).then(res => res.data)

const FileListItem: FunctionComponent<{
  fileContent: { id: string; name: string; size: number; file: Object; lastModifiedDateTime: string }
}> = ({ fileContent: c }) => {
  return (
    <div className="p-3 grid grid-cols-10 items-center space-x-2 cursor-pointer hover:bg-gray-100">
      <div className="flex space-x-2 items-center col-span-10 md:col-span-7 truncate">
        {/* <div>{c.file ? c.file.mimeType : 'folder'}</div> */}
        <div className="w-5 text-center">
          <FontAwesomeIcon icon={c.file ? getFileIcon(c.name) : ['far', 'folder']} />
        </div>
        <div className="truncate">{c.name}</div>
      </div>
      <div className="hidden md:block font-mono text-sm col-span-2 text-gray-700">
        {new Date(c.lastModifiedDateTime).toLocaleString(undefined, {
          dateStyle: 'short',
          timeStyle: 'short',
        })}
      </div>
      <div className="hidden md:block font-mono text-sm text-gray-700">{humanFileSize(c.size)}</div>
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
    const imagesInFolder: ImageDecorator[] = []
    const imageIndexDict: { [key: string]: number } = {}
    let imageIndex = 0
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
    })

    return (
      <div className="bg-white shadow rounded">
        <div className="p-3 grid grid-cols-10 items-center space-x-2 border-b border-gray-200">
          <div className="col-span-10 md:col-span-7 font-bold">Name</div>
          <div className="hidden md:block font-bold col-span-2">Last Modified</div>
          <div className="hidden md:block font-bold">Size</div>
        </div>

        {imagesInFolder.length !== 0 && (
          <ReactViewer
            visible={imageViewerVisible}
            activeIndex={activeImageIdx}
            images={imagesInFolder}
            drag={false}
            rotatable={false}
            noClose={true}
            downloadable={true}
            downloadInNewWindow={true}
            onMaskClick={() => {
              setImageViewerVisibility(false)
            }}
          />
        )}

        {children.map((c: any) => (
          <div
            key={c.id}
            onClick={e => {
              if (!c.folder && fileIsImage(c.name)) {
                setActiveImageIdx(imageIndexDict[c.id])
                setImageViewerVisibility(true)
              } else {
                e.preventDefault()
                router.push(`${path === '/' ? '' : path}/${c.name}`)
              }
            }}
          >
            <FileListItem fileContent={c} />
          </div>
        ))}
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
            <div className="bg-white shadow rounded">
              <div className="p-3 text-center">
                <div>{downloadUrl}</div>
              </div>
            </div>
          )

        case preview.text:
          return <TextPreview file={resp} />

        case preview.code:
          return <div>code</div>

        case preview.markdown:
          return <div>markdown</div>

        case preview.video:
          return <VideoPreview file={resp} />

        case preview.audio:
          return <AudioPreview file={resp} />

        case preview.pdf:
          return <PDFPreview file={resp} />

        default:
          return <div className="bg-white shadow rounded">{fileName}</div>
      }
    }
  }

  return (
    <div className="shadow bg-white rounded p-3">
      <FourOhFour errorMsg={`Cannot preview ${resp.name}.`} />
    </div>
  )
}

export default FileListing
