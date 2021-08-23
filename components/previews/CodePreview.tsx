import { useEffect, FunctionComponent } from 'react'
import useSWR from 'swr'
import axios from 'axios'
import Prism from 'prismjs'

import { getExtension } from '../../utils/getFileIcon'
import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadBtn from '../DownloadBtn'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

const CodePreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const { data, error } = useSWR(file['@microsoft.graph.downloadUrl'], fetcher)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll()
    }
  }, [data])

  if (error) {
    return (
      <div className="shadow bg-white dark:bg-gray-900 rounded p-3">
        <FourOhFour errorMsg={error.message} />
      </div>
    )
  }
  if (!data) {
    return (
      <div className="shadow bg-white dark:bg-gray-900 rounded p-3">
        <Loading loadingText="Loading file content..." />
      </div>
    )
  }

  return (
    <>
      <div className="markdown-body shadow bg-gray-900 rounded p-3">
        <pre className={`language-${getExtension(file.name)}`}>
          <code>{data}</code>
        </pre>
      </div>
      <div className="mt-4">
        <DownloadBtn downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </>
  )
}

export default CodePreview
