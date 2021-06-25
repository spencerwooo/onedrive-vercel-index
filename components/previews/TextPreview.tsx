import axios from 'axios'
import { FunctionComponent } from 'react'
import useSWR from 'swr'

import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadBtn from '../DownloadBtn'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

const TextPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  const { data, error } = useSWR(file['@microsoft.graph.downloadUrl'], fetcher)
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
      <div className="shadow bg-white rounded p-3">
        <pre className="p-0 md:p-3 overflow-scroll">{data}</pre>
      </div>
      <div className="mt-4">
        <DownloadBtn downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </>
  )
}

export default TextPreview
