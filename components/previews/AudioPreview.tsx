import { FunctionComponent } from 'react'
import ReactPlayer from 'react-player'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const AudioPreview: FunctionComponent<{ file: any }> = ({ file }) => {
  return (
    <div className="bg-white rounded shadow p-3 w-full">
      <div className="flex space-x-4">
        <div className="flex items-center justify-center p-10 bg-gray-100 rounded">
          <FontAwesomeIcon className="" icon="music" size="lg" />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <div>{file.name}</div>
          <div className="text-gray-500 text-sm">
            Last modified:{' '}
            {new Date(file.lastModifiedDateTime).toLocaleString(undefined, {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </div>
          <ReactPlayer
            url={file['@microsoft.graph.downloadUrl']}
            controls
            width="100%"
            height="48px"
            config={{ file: { forceAudio: true } }}
          />
        </div>
      </div>
    </div>
  )
}
