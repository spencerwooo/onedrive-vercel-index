import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer } from './Containers'

const PDFEmbedPreview: React.FC<{ file: any }> = ({ file }) => {
  // const url = `/api/proxy?url=${encodeURIComponent(file['@microsoft.graph.downloadUrl'])}&inline=true`
  const url = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
    file['@microsoft.graph.downloadUrl']
  )}`

  return (
    <div>
      <div className="w-full overflow-hidden rounded" style={{ height: '90vh' }}>
        <iframe src={url} frameBorder="0" width="100%" height="100%"></iframe>
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </DownloadBtnContainer>
    </div>
  )
}

export default PDFEmbedPreview
