import { FunctionComponent } from 'react'
import ReactPlayer from 'react-player'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast'

import { getBaseUrl } from '../../utils/tools'

export const VideoPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const { asPath } = useRouter()

  return (
    <>
      <div className="bg-white rounded shadow p-3">
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

      <div className="flex flex-wrap space-x-2 justify-center mt-4">
        <Toaster />
        <a
          className="flex-shrink-0 w-36 flex space-x-4 items-center justify-center bg-blue-500 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-600 mb-2"
          href={file['@microsoft.graph.downloadUrl']}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon="file-download" />
          <span>Download</span>
        </a>

        <button
          className="flex-shrink-0 w-48 flex space-x-4 items-center justify-center bg-yellow-500 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-yellow-300 hover:bg-yellow-600 mb-2"
          onClick={() => {
            navigator.clipboard.writeText(`${getBaseUrl()}/api?path=${asPath}&raw=true`)
            toast.success('Copied direct link to clipboard.')
          }}
        >
          <FontAwesomeIcon icon="copy" />
          <span>Copy direct link</span>
        </button>

        <a
          className="flex space-x-2 items-center justify-center bg-gray-700 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 hover:bg-gray-600 mb-2"
          href={`iina://weblink?url=${file['@microsoft.graph.downloadUrl']}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/players/iina.png" alt="iina" width="28" height="28" />
          <span>IINA</span>
        </a>
        <a
          className="flex space-x-2 items-center justify-center bg-yellow-600 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 hover:bg-yellow-500 mb-2"
          href={`vlc://${file['@microsoft.graph.downloadUrl']}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/players/vlc.png" alt="vlc" width="28" height="28" />
          <span>VLC</span>
        </a>
        <a
          className="flex space-x-2 items-center justify-center bg-yellow-400 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 hover:bg-yellow-300 mb-2"
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
