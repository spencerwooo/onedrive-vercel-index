import { FunctionComponent } from 'react'

import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadBtn from '../DownloadBtn'
import { useStaleSWR } from '../../utils/tools'

const TextPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const { data, error } = useStaleSWR(file['@microsoft.graph.downloadUrl'])
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
      <div className="shadow bg-white dark:bg-gray-900 dark:text-gray-100 rounded p-3">
        <pre className="p-0 md:p-3 overflow-scroll">{data}</pre>
      </div>
      <div className="mt-4">
        <DownloadBtn downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </>
  )
}

export default TextPreview
