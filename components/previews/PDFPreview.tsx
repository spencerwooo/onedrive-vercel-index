import { FunctionComponent, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Loading from '../Loading'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loadingText, setLoadingText] = useState('Loading PDF ...')

  const onDocumentLoadSuccess = (pdf: any) => {
    setTotalPages(pdf.numPages)
  }

  return (
    <div className="bg-white rounded shadow md:p-3 w-full overflow-scroll" style={{ maxHeight: '90vh' }}>
      <div className="w-full mx-auto border-2 md:shadow overflow-scroll" style={{ maxHeight: '60vh' }}>
        <Document
          file={file['@microsoft.graph.downloadUrl']}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Loading loadingText={loadingText} />}
          onLoadProgress={({ loaded, total }) => {
            setLoadingText(`Loading PDF ${Math.round((loaded / total) * 100)}%`)
          }}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
      <div className="flex space-x-2 my-4 md:mb-0 w-full items-center justify-center">
        <button
          className="px-3 py-1 bg-red-500 text-white rounded cursor-pointer focus:ring-2 focus:ring-red-500 focus:outline-none hover:bg-red-600 transition-all duration-75 disabled:opacity-50"
          onClick={() => {
            pageNumber > 1 && setPageNumber(pageNumber - 1)
          }}
          disabled={!(pageNumber > 1)}
        >
          <FontAwesomeIcon icon="arrow-left" />
        </button>
        <div className="px-3 py-1">
          Page{' '}
          <input
            value={pageNumber}
            className="w-10 mr-1 text-center p-1 bg-red-50 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
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
          className="px-3 py-1 bg-red-500 text-white rounded cursor-pointer focus:ring-2 focus:ring-red-500 focus:outline-none hover:bg-red-600 transition-all duration-75 disabled:opacity-50"
          onClick={() => {
            pageNumber < totalPages && setPageNumber(pageNumber + 1)
          }}
          disabled={!(pageNumber < totalPages)}
        >
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      </div>
    </div>
  )
}

export default PDFPreview
