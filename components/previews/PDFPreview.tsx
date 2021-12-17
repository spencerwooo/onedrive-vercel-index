import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Loading from '../Loading'
import DownloadBtn from '../DownloadBtn'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loadingText, setLoadingText] = useState('Loading PDF ...')

  const [pdfContainerWidth, setPdfContainerWidth] = useState(400)
  const pdfContainter = useRef<HTMLDivElement>(null)

  const onDocumentLoadSuccess = (pdf: any) => {
    setTotalPages(pdf.numPages)
  }

  useEffect(() => {
    setPdfContainerWidth(pdfContainter.current ? pdfContainter.current.offsetWidth : 400)
  }, [])

  return (
    <>
      <div
        className="dark:bg-gray-900 md:p-3 no-scrollbar flex flex-col w-full overflow-scroll bg-white rounded"
        style={{ maxHeight: '90vh' }}
      >
        <div className="no-scrollbar flex-1 w-full overflow-scroll" ref={pdfContainter} style={{ maxHeight: '80vh' }}>
          <Document
            className="dark:bg-gray-800 bg-gray-100"
            file={file['@microsoft.graph.downloadUrl']}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Loading loadingText={loadingText} />}
            onLoadProgress={({ loaded, total }) => {
              setLoadingText(`Loading PDF ${Math.round((loaded / total) * 100)}%`)
            }}
            options={{
              cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
              cMapPacked: true,
            }}
          >
            <Page
              pageNumber={pageNumber}
              width={pdfContainerWidth > 400 ? pdfContainerWidth * 0.8 : pdfContainerWidth}
            />
          </Document>
        </div>

        <div className="md:mb-0 dark:text-white flex flex-wrap items-center justify-center w-full my-4 space-x-2">
          <button
            className="focus:ring focus:ring-red-300 focus:outline-none hover:bg-red-600 disabled:opacity-50 px-4 py-2 text-white transition-all duration-75 bg-red-500 rounded cursor-pointer"
            onClick={() => {
              pageNumber > 1 && setPageNumber(pageNumber - 1)
            }}
            disabled={!(pageNumber > 1)}
          >
            <FontAwesomeIcon icon="arrow-left" />
          </button>
          <div className="px-4 py-2">
            Page{' '}
            <input
              value={pageNumber}
              className="bg-red-50 dark:bg-gray-600 focus:ring focus:ring-red-300 dark:focus:ring-red-700 focus:outline-none w-10 p-1 mr-1 text-center rounded"
              style={{
                maxWidth: 50,
              }}
              onChange={e => {
                const v = parseInt(e.target.value)
                if (v <= totalPages && v >= 0) {
                  setPageNumber(v)
                }
              }}
            ></input>
            /<span className="ml-1 text-center">{totalPages}</span>
          </div>
          <button
            className="focus:ring focus:ring-red-300 focus:outline-none hover:bg-red-600 disabled:opacity-50 px-4 py-2 text-white transition-all duration-75 bg-red-500 rounded cursor-pointer"
            onClick={() => {
              pageNumber < totalPages && setPageNumber(pageNumber + 1)
            }}
            disabled={!(pageNumber < totalPages)}
          >
            <FontAwesomeIcon icon="arrow-right" />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <DownloadBtn downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </>
  )
}

export default PDFPreview
