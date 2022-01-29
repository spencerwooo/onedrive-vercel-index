import { OdFileObject } from '../../types'
import { FC } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { getFileIcon } from '../../utils/getFileIcon'
import { formatModifiedDateTime, humanFileSize } from '../../utils/fileDetails'

import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'

const DefaultPreview: FC<{ file: OdFileObject }> = ({ file }) => {
  return (
    <div>
      <PreviewContainer>
        <div className="md:flex px-5 py-4 md:space-x-8 items-center">
          <div className="text-center border rounded-lg px-10 py-20 border-gray-900/10 dark:border-gray-500/30">
            <FontAwesomeIcon icon={getFileIcon(file.name, { video: Boolean(file.video) })} />
            <div className="font-medium text-sm mt-6 md:w-20 overflow-hidden truncate">{file.name}</div>
          </div>

          <div className="md:flex-1 flex flex-col py-4 space-y-2">
            <div>
              <div className="font-medium text-xs opacity-80 uppercase py-2">Last modified</div>
              <div>{formatModifiedDateTime(file.lastModifiedDateTime)}</div>
            </div>

            <div>
              <div className="font-medium text-xs opacity-80 uppercase py-2">File size</div>
              <div>{humanFileSize(file.size)}</div>
            </div>

            <div>
              <div className="font-medium text-xs opacity-80 uppercase py-2">MIME type</div>
              <div>{file.file.mimeType}</div>
            </div>

            <div>
              <div className="font-medium text-xs opacity-80 uppercase py-2">Hashes</div>
              <table className="w-full overflow-scroll block md:table whitespace-nowrap text-sm">
                <tbody>
                  <tr className="bg-white border-y dark:bg-gray-900 dark:border-gray-700">
                    <td className="bg-gray-50 dark:bg-gray-800 py-1 px-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                      Quick XOR
                    </td>
                    <td className="py-1 px-3 text-gray-500 whitespace-nowrap dark:text-gray-400 font-mono">
                      {file.file.hashes.quickXorHash}
                    </td>
                  </tr>
                  <tr className="bg-white border-y dark:bg-gray-900 dark:border-gray-700">
                    <td className="bg-gray-50 dark:bg-gray-800 py-1 px-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                      SHA1
                    </td>
                    <td className="py-1 px-3 text-gray-500 whitespace-nowrap dark:text-gray-400 font-mono">
                      {file.file.hashes.sha1Hash}
                    </td>
                  </tr>
                  <tr className="bg-white border-y dark:bg-gray-900 dark:border-gray-700">
                    <td className="bg-gray-50 dark:bg-gray-800 py-1 px-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400">
                      SHA256
                    </td>
                    <td className="py-1 px-3 text-gray-500 whitespace-nowrap dark:text-gray-400 font-mono">
                      {file.file.hashes.sha256Hash}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </DownloadBtnContainer>
    </div>
  )
}

export default DefaultPreview
