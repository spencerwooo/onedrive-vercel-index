import { FunctionComponent } from 'react'

import DownloadButtonGroup from '../DownloadBtnGtoup'

const PDFEmbedPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  // const url = `/api/proxy?url=${encodeURIComponent(file['@microsoft.graph.downloadUrl'])}&inline=true`
  const url = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
    file['@microsoft.graph.downloadUrl']
  )}`

  return (
    <>
      <div className="w-full rounded overflow-hidden" style={{ height: '80vh' }}>
        <iframe src={url} frameBorder="0" width="100%" height="100%"></iframe>
      </div>
      <div className="mt-4">
        <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </>
  )
}

export default PDFEmbedPreview
