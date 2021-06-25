import { useEffect, FunctionComponent } from 'react'
import axios from 'axios'
import useSWR from 'swr'
import Prism from 'prismjs'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import 'katex/dist/katex.min.css'
import 'github-markdown-css/github-markdown.css'

import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadBtn from '../DownloadBtn'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

const MarkdownPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const { data, error } = useSWR(file['@microsoft.graph.downloadUrl'], fetcher)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll()
    }
  }, [data])

  if (error) {
    return (
      <div className="shadow bg-white rounded p-3">
        <FourOhFour errorMsg={error.message} />
      </div>
    )
  }
  if (!data) {
    return (
      <div className="shadow bg-white rounded p-3">
        <Loading loadingText="Loading file content..." />
      </div>
    )
  }

  return (
    <>
      <div className="markdown-body shadow bg-white rounded p-3">
        <ReactMarkdown remarkPlugins={[gfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
          {data}
        </ReactMarkdown>
      </div>
      <div className="mt-4">
        <DownloadBtn downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </>
  )
}

export default MarkdownPreview
