import { FunctionComponent } from 'react'

import DownloadButtonGroup from '../DownloadBtnGtoup'

const PDFEmbedPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  // const url = `/api/proxy?url=${encodeURIComponent(file['@microsoft.graph.downloadUrl'])}&inline=true`
  const url = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
    file['@microsoft.graph.downloadUrl']
  )}`

  return (
    <div>
      <div className="w-full rounded overflow-hidden" style={{ height: '90vh' }}>
        <iframe src={url} frameBorder="0" width="100%" height="100%"></iframe>
      </div>
      <div className="border-t-gray-200 dark:border-t-gray-700 border-t p-2 sticky bottom-0 left-0 right-0 z-10 bg-white bg-opacity-80 backdrop-blur-md dark:bg-gray-900">
        <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </div>
  )
}

export default PDFEmbedPreview
