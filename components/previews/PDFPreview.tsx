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
        className="flex flex-col bg-white dark:bg-gray-900 rounded shadow md:p-3 w-full overflow-scroll no-scrollbar"
        style={{ maxHeight: '90vh' }}
      >
        <div className="w-full flex-1 overflow-scroll no-scrollbar" ref={pdfContainter} style={{ maxHeight: '80vh' }}>
          <Document
            className="bg-gray-100 dark:bg-gray-800"
            file={file['@microsoft.graph.downloadUrl']}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Loading loadingText={loadingText} />}
            onLoadProgress={({ loaded, total }) => {
              setLoadingText(`Loading PDF ${Math.round((loaded / total) * 100)}%`)
            }}
          >
            <Page
              pageNumber={pageNumber}
              width={pdfContainerWidth > 400 ? pdfContainerWidth * 0.8 : pdfContainerWidth}
            />
          </Document>
        </div>

        <div className="flex flex-wrap space-x-2 my-4 md:mb-0 w-full items-center justify-center dark:text-white">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer focus:ring focus:ring-red-300 focus:outline-none hover:bg-red-600 transition-all duration-75 disabled:opacity-50"
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
              className="w-10 mr-1 text-center p-1 bg-red-50 dark:bg-gray-600 rounded focus:ring focus:ring-red-300 dark:focus:ring-red-700 focus:outline-none"
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
            className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer focus:ring focus:ring-red-300 focus:outline-none hover:bg-red-600 transition-all duration-75 disabled:opacity-50"
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
