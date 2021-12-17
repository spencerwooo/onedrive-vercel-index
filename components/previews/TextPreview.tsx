import { FunctionComponent } from 'react'

import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadBtn from '../DownloadBtn'
import { useStaleSWR } from '../../utils/tools'

const TextPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const { data, error } = useStaleSWR(file['@microsoft.graph.downloadUrl'])
  if (error) {
    return (
      <div className="dark:bg-gray-900 p-3 bg-white rounded">
        <FourOhFour errorMsg={error.message} />
      </div>
    )
  }
  if (!data) {
    return (
      <div className="dark:bg-gray-900 p-3 bg-white rounded">
        <Loading loadingText="Loading file content..." />
      </div>
    )
  }

  return (
    <>
      <div className="dark:bg-gray-900 dark:text-gray-100 p-3 bg-white rounded">
        <pre className="md:p-3 p-0 overflow-scroll">{data}</pre>
      </div>
      <div className="mt-4">
        <DownloadBtn downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </>
  )
}

export default TextPreview
