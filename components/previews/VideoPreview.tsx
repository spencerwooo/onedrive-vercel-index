import { FunctionComponent } from 'react'
import ReactPlayer from 'react-player'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useClipboard } from 'use-clipboard-copy'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast'

import { getBaseUrl } from '../../utils/getBaseUrl'

const VideoPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const { asPath } = useRouter()
  const clipboard = useClipboard()

  return (
    <>
      <div className="dark:bg-gray-900 p-3 bg-white rounded">
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <ReactPlayer
            className="absolute top-0 left-0 w-full h-full"
            url={file['@microsoft.graph.downloadUrl']}
            controls
            width="100%"
            height="100%"
            config={{ file: { forceVideo: true } }}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center mt-4 space-x-2">
        <Toaster />
        <a
          className="w-36 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-400 flex items-center justify-center flex-shrink-0 px-4 py-2 mb-2 space-x-4 text-white bg-blue-500 rounded"
          href={file['@microsoft.graph.downloadUrl']}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon="file-download" />
          <span>Download</span>
        </a>

        <button
          className="focus:outline-none focus:ring focus:ring-yellow-300 hover:bg-yellow-400 flex items-center justify-center flex-shrink-0 w-48 px-4 py-2 mb-2 space-x-4 text-white bg-yellow-500 rounded"
          onClick={() => {
            clipboard.copy(`${getBaseUrl()}/api?path=${asPath}&raw=true`)
            toast.success('Copied direct link to clipboard.')
          }}
        >
          <FontAwesomeIcon icon="copy" />
          <span>Copy direct link</span>
        </button>

        <a
          className="focus:outline-none focus:ring focus:ring-gray-300 hover:bg-gray-600 flex items-center justify-center px-4 py-2 mb-2 space-x-2 text-white bg-gray-700 rounded"
          href={`iina://weblink?url=${file['@microsoft.graph.downloadUrl']}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/players/iina.png" alt="iina" width="28" height="28" />
          <span>IINA</span>
        </a>
        <a
          className="focus:outline-none focus:ring focus:ring-yellow-300 hover:bg-yellow-500 flex items-center justify-center px-4 py-2 mb-2 space-x-2 text-white bg-yellow-600 rounded"
          href={`vlc://${file['@microsoft.graph.downloadUrl']}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/players/vlc.png" alt="vlc" width="28" height="28" />
          <span>VLC</span>
        </a>
        <a
          className="focus:outline-none focus:ring focus:ring-yellow-100 hover:bg-yellow-400 flex items-center justify-center px-4 py-2 mb-2 space-x-2 text-white bg-yellow-400 rounded"
          href={`potplayer://${file['@microsoft.graph.downloadUrl']}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/players/potplayer.png" alt="potplayer" width="28" height="28" />
          <span>PotPlayer</span>
        </a>
      </div>
    </>
  )
}

export default VideoPreview
