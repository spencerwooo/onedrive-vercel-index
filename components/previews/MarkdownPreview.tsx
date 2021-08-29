import { useEffect, FunctionComponent } from 'react'
import Prism from 'prismjs'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'

import 'katex/dist/katex.min.css'

import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadBtn from '../DownloadBtn'
import { useStaleSWR } from '../../utils/tools'

const MarkdownPreview: FunctionComponent<{ file: any; standalone?: boolean }> = ({ file, standalone = true }) => {
  const { data, error } = useStaleSWR(file['@microsoft.graph.downloadUrl'])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll()
    }
  }, [data])

  if (error) {
    return (
      <div className={`${standalone ? 'shadow bg-white dark:bg-gray-900 rounded p-3' : ''}`}>
        <FourOhFour errorMsg={error.message} />
      </div>
    )
  }
  if (!data) {
    return (
      <div className={standalone ? 'shadow bg-white dark:bg-gray-900 rounded p-3' : ''}>
        <Loading loadingText="Loading file content..." />
      </div>
    )
  }

  return (
    <>
      <div
        className={
          standalone
            ? 'markdown-body shadow bg-white dark:bg-gray-900 rounded p-3 dark:text-white'
            : 'markdown-body p-3 dark:text-white'
        }
      >
        {/* Using rehypeRaw to render HTML inside Markdown, is potentially dangerous, use under safe environments. (#18) */}
        <ReactMarkdown remarkPlugins={[gfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw as any]}>
          {data}
        </ReactMarkdown>
      </div>
      {standalone && (
        <div className="mt-4">
          <DownloadBtn downloadUrl={file['@microsoft.graph.downloadUrl']} />
        </div>
      )}
    </>
  )
}

export default MarkdownPreview
