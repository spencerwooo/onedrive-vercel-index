import { FunctionComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useClipboard } from 'use-clipboard-copy'

import { getBaseUrl } from '../utils/getBaseUrl'

const DownloadBtn: FunctionComponent<{ downloadUrl: string }> = ({ downloadUrl }) => {
  const { asPath } = useRouter()
  const clipboard = useClipboard()

  return (
    <div className="flex flex-wrap justify-center space-x-2">
      <Toaster />
      <a
        className="w-36 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-500 flex items-center justify-center flex-shrink-0 px-4 py-2 mb-2 space-x-4 text-white border-2 border-blue-500 rounded transition-all duration-100"
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon="file-download" />
        <span>Download</span>
      </a>
      <a
        className="focus:outline-none focus:ring focus:ring-pink-300 hover:bg-pink-500 flex items-center justify-center flex-shrink-0 px-4 py-2 mb-2 space-x-4 text-white border-2 border-pink-500 rounded transition-all duration-100"
        href={`/api/proxy?url=${encodeURIComponent(downloadUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon="file-download" />
        <span>Proxy download</span>
      </a>
      <button
        className="focus:outline-none focus:ring focus:ring-yellow-300 hover:bg-yellow-500 flex items-center justify-center flex-shrink-0 w-48 px-4 py-2 mb-2 space-x-4 text-white border-2 border-yellow-500 rounded transition-all duration-100"
        onClick={() => {
          clipboard.copy(`${getBaseUrl()}/api?path=${asPath}&raw=true`)
          toast.success('Copied direct link to clipboard.')
        }}
      >
        <FontAwesomeIcon icon="copy" />
        <span>Copy direct link</span>
      </button>
    </div>
  )
}

export default DownloadBtn
