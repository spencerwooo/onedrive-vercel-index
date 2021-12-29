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
    <div>
      <div className="overflow-scroll" ref={docContainer} style={{ maxHeight: '90vh' }}>
        <Preview
          url={encodeURIComponent(file['@microsoft.graph.downloadUrl'])}
          width={docContainerWidth.toString()}
          height="600"
        />
      </div>
      <div className="border-t-gray-200 dark:border-t-gray-700 border-t p-2 sticky bottom-0 left-0 right-0 z-10 bg-white bg-opacity-80 backdrop-blur-md dark:bg-gray-900">
        <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </div>
  )
}

export default OfficePreview
