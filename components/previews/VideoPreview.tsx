import { FunctionComponent } from 'react'
import ReactPlayer from 'react-player'

import DownloadBtn from '../DownloadBtn'

export const VideoPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  return (
    <>
      <div className="bg-white rounded shadow p-3">
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <ReactPlayer
            className="absolute top-0 left-0 w-full h-full"
            url={file['@microsoft.graph.downloadUrl']}
            controls
            width="100%"
            height="100%"
            config={{ file: { forceVideo: true } }}
          />
        </div>
      </div>
      <div className="mt-4">
        <DownloadBtn downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </div>
    </>
  )
}
