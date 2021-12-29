import { FunctionComponent, useEffect, useRef, useState } from 'react'
import Preview from 'preview-office-docs'

import DownloadButtonGroup from '../DownloadBtnGtoup'

const OfficePreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const docContainer = useRef<HTMLDivElement>(null)
  const [docContainerWidth, setDocContainerWidth] = useState(600)

  useEffect(() => {
    setDocContainerWidth(docContainer.current ? docContainer.current.offsetWidth : 600)
  }, [])

  return (
    <>
      <div className="overflow-scroll" ref={docContainer} style={{ maxHeight: '90vh' }}>
        <Preview url={encodeURIComponent(file['@microsoft.graph.downloadUrl'])} width={docContainerWidth.toString()} height="800" />
      </div>
      <div className="mt-4">
        <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </>
  )
}

export default OfficePreview
