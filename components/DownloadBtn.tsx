import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FunctionComponent } from 'react'

const DownloadBtn: FunctionComponent<{ downloadUrl: string }> = ({ downloadUrl }) => {
  return (
    <div>
      <a
        className="mx-auto w-36 flex space-x-4 items-center justify-center bg-blue-500 rounded py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-600"
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon="file-download" />
        <span>Download</span>
      </a>
    </div>
  )
}

export default DownloadBtn
