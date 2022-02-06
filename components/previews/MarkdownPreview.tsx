import { useEffect, FC, CSSProperties } from 'react'
import Prism from 'prismjs'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'

import 'katex/dist/katex.min.css'

import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import useAxiosGet from '../../utils/fetchOnMount'
import { DownloadBtnContainer, PreviewContainer } from './Containers'

const MarkdownPreview: FC<{
  file: any
  path: string
  standalone?: boolean
}> = ({ file, path, standalone = true }) => {
  const { response: content, error, validating } = useAxiosGet(file['@microsoft.graph.downloadUrl'])

  // The parent folder of the markdown file, which is also the relative image folder
  const parentPath = path.substring(0, path.lastIndexOf('/'))
  // Check if the image is relative path instead of a absolute url
  const isUrlAbsolute = (url: string | string[]) => url.indexOf('://') > 0 || url.indexOf('//') === 0
  // Custom renderer to render images with relative path
  const relativeImagePathRenderer = {
    img: ({
      alt,
      src,
      title,
      width,
      height,
      style,
    }: {
      alt?: string
      src?: string
      title?: string
      width?: string | number
      height?: string | number
      style?: CSSProperties
    }) => {
      if (isUrlAbsolute(src as string)) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={alt} src={src} title={title} width={width} height={height} style={style} />
        )
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={alt}
          src={`/api?path=${parentPath}/${src}&raw=true`}
          title={title}
          width={width}
          height={height}
          style={style}
        />
      )
    },
  }

  useEffect(() => {
    Prism.highlightAll()
  }, [content])

  if (error) {
    return (
      <PreviewContainer>
        <FourOhFour errorMsg={error} />
      </PreviewContainer>
    )
  }
  if (validating) {
    return (
      <PreviewContainer>
        <Loading loadingText="Loading file content..." />
      </PreviewContainer>
    )
  }

  return (
    <div>
      <PreviewContainer>
        <div className="markdown-body">
          {/* Using rehypeRaw to render HTML inside Markdown is potentially dangerous, use under safe environments. (#18) */}
          <ReactMarkdown
            remarkPlugins={[gfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw as any]}
            components={relativeImagePathRenderer}
          >
            {content}
          </ReactMarkdown>
        </div>
      </PreviewContainer>
      {standalone && (
        <DownloadBtnContainer>
          <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
        </DownloadBtnContainer>
      )}
    </div>
  )
}

export default MarkdownPreview
