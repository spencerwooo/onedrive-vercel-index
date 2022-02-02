import { useEffect, FC } from 'react'
import Prism from 'prismjs'

import { getExtension } from '../../utils/getFileIcon'
import useAxiosGet from '../../utils/fetchOnMount'
import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'

const CodePreview: FC<{ file: any }> = ({ file }) => {
  const { response: content, error, validating } = useAxiosGet(file['@microsoft.graph.downloadUrl'])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll()
    }
  }, [validating])

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
        <pre className={`language-${getExtension(file.name)}`}>
          <code className="font-mono">{content}</code>
        </pre>
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </DownloadBtnContainer>
    </div>
  )
}

export default CodePreview
