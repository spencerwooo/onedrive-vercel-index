import type { OdFileObject } from '../../types'
import { FC, useEffect, useRef, useState } from 'react'

import Preview from 'preview-office-docs'

import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer } from './Containers'

const OfficePreview: FC<{ file: OdFileObject }> = ({ file }) => {
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
      <DownloadBtnContainer>
        <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </DownloadBtnContainer>
    </div>
  )
}

export default OfficePreview
