import type { OdFileObject } from '../../types'
import { FC, useState } from 'react'

import ReactAudioPlayer from 'react-audio-player'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import { LoadingIcon } from '../Loading'

enum PlayerState {
  Loading,
  Ready,
  Playing,
  Paused,
}

const AudioPreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const [playerStatus, setPlayerStatus] = useState(PlayerState.Loading)

  return (
    <>
      <PreviewContainer>
        <div className="md:flex-row md:space-x-4 flex flex-col space-y-4">
          <div className="dark:bg-gray-700 aspect-square flex items-center justify-center w-full md:w-40 transition-all duration-75 bg-gray-100 rounded">
            {playerStatus === PlayerState.Loading ? (
              <LoadingIcon className="animate-spin w-5 h-5 inline-block" />
            ) : (
              <FontAwesomeIcon
                className={`h-5 w-5 ${playerStatus === PlayerState.Playing ? 'animate-spin' : ''}`}
                icon="music"
                size="2x"
              />
            )}
          </div>
          <div className="flex flex-col w-full space-y-2">
            <div>{file.name}</div>
            <div className="pb-4 text-sm text-gray-500">
              Last modified:{' '}
              {new Date(file.lastModifiedDateTime).toLocaleString(undefined, {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </div>

            <ReactAudioPlayer
              className="w-full h-11"
              src={file['@microsoft.graph.downloadUrl']}
              controls
              onCanPlay={() => setPlayerStatus(PlayerState.Ready)}
              onPlay={() => setPlayerStatus(PlayerState.Playing)}
              onPause={() => setPlayerStatus(PlayerState.Paused)}
              onError={() => setPlayerStatus(PlayerState.Paused)}
              onEnded={() => setPlayerStatus(PlayerState.Paused)}
            />
          </div>
        </div>
      </PreviewContainer>

      <DownloadBtnContainer>
        <DownloadButtonGroup downloadUrl={file['@microsoft.graph.downloadUrl']} />
      </DownloadBtnContainer>
    </>
  )
}

export default AudioPreview
