import { FunctionComponent, useEffect, useRef, useState } from 'react'
import Preview from 'preview-office-docs'

import DownloadBtn from '../DownloadBtn'

const OfficePreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const docContainer = useRef<HTMLDivElement>(null)
  const [docContainerWidth, setDocContainerWidth] = useState(600)

  useEffect(() => {
    setDocContainerWidth(docContainer.current ? docContainer.current.offsetWidth : 600)
  }, [])

  return (
    <>
      <div className="overflow-scroll shadow" ref={docContainer} style={{ maxHeight: '90vh' }}>
        <Preview url={encodeURIComponent(file.url)} width={docContainerWidth.toString()} height="800" />
      </div>
      <div className="mt-4">
        <DownloadBtn downloadUrl={file.url} />
      </div>
    </>
  )
}

export default OfficePreview
