import { FunctionComponent } from 'react'

import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { useStaleSWR } from '../../utils/fetchWithSWR'

const TextPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const { data, error } = useStaleSWR({ url: file['@microsoft.graph.downloadUrl'] })
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
    <div>
      <div className="dark:bg-gray-900 dark:text-gray-100 p-3 bg-white rounded">
        <pre className="md:p-3 p-0 overflow-scroll">{data}</pre>
      </div>
      <div className="border-t-gray-200 dark:border-t-gray-700 border-t p-2 sticky bottom-0 left-0 right-0 z-10 bg-white bg-opacity-80 backdrop-blur-md dark:bg-gray-900">
        <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </div>
  )
}

export default TextPreview
