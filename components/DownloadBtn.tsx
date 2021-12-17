import { FunctionComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useClipboard } from 'use-clipboard-copy'

import { getBaseUrl } from '../utils/tools'

const DownloadBtn: FunctionComponent<{ downloadUrl: string }> = ({ downloadUrl }) => {
  const { asPath } = useRouter()
  const clipboard = useClipboard()

  return (
    <div className="flex flex-wrap justify-center space-x-2">
      <Toaster />
      <a
        className="w-36 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-400 flex items-center justify-center flex-shrink-0 px-4 py-2 mb-2 space-x-4 text-white bg-blue-500 rounded"
        href={downloadUrl}
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
    </div>
  )
}

export default DownloadBtn
