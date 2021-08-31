import { useEffect, FunctionComponent, CSSProperties } from 'react'
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

const MarkdownPreview: FunctionComponent<{ file: any; path: string; standalone?: boolean }> = ({
  file,
  path,
  standalone = true,
}) => {
  const { data, error } = useStaleSWR(file['@microsoft.graph.downloadUrl'])

  // The parent folder of the markdown file, which is also the relative image folder
  const parentPath = path.substring(0, path.lastIndexOf('/'))
  // Check if the image is relative path instead of a absolute url
  const isUrlAbsolute = url => url.indexOf('://') > 0 || url.indexOf('//') === 0
  // Custom renderer to render images with relative path
  const relativeImagePathRenderer = {
    img: ({ alt, src, title, style }: { alt?: string; src?: string; title?: string; style?: CSSProperties }) => {
      if (isUrlAbsolute(src as string)) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={alt} src={src} title={title} style={style} />
        )
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={alt} src={`/api?path=${parentPath}/${src}&raw=true`} title={title} style={style} />
      )
    },
  }

  useEffect(() => {
    Prism.highlightAll()
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
        {/* Using rehypeRaw to render HTML inside Markdown is potentially dangerous, use under safe environments. (#18) */}
        <ReactMarkdown
          remarkPlugins={[gfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeRaw as any]}
          components={relativeImagePathRenderer}
        >
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
