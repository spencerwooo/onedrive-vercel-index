import { FunctionComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/router'

import config from '../config/site.json'

const DownloadBtn: FunctionComponent<{ downloadUrl: string }> = ({ downloadUrl }) => {
  const { asPath } = useRouter()

  return (
    <div className="flex flex-wrap space-x-2 justify-center">
      <Toaster />
      <a
        className="flex-shrink-0 w-36 flex space-x-4 items-center justify-center bg-blue-500 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-600 mb-2"
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon="file-download" />
        <span>Download</span>
      </a>
      <button
        className="flex-shrink-0 w-48 flex space-x-4 items-center justify-center bg-yellow-500 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-yellow-300 hover:bg-yellow-600 mb-2"
        onClick={() => {
          navigator.clipboard.writeText(`${config.baseUrl}/api?path=${asPath}&raw=true`)
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
