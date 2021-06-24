import { FunctionComponent } from 'react'
import ReactPlayer from 'react-player'

export const AudioPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  return (
    <div className="bg-white rounded shadow p-3 w-full">
      <div className="text-center mb-6">{file.name}</div>
      <ReactPlayer
        url={file['@microsoft.graph.downloadUrl']}
        controls
        width="100%"
        height="48px"
        config={{ file: { forceAudio: true } }}
      />
    </div>
  )
}
