import { OdFileObject } from '../../types'
import { FC, useState } from 'react'

import ReactPlayer from 'react-player'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'

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
              <div>
                <svg
                  className="animate-spin w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
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
            <ReactPlayer
              url={file['@microsoft.graph.downloadUrl']}
              controls
              width="100%"
              height="48px"
              config={{ file: { forceAudio: true } }}
              onReady={() => {
                setPlayerStatus(PlayerState.Ready)
              }}
              onPlay={() => {
                setPlayerStatus(PlayerState.Playing)
              }}
              onPause={() => {
                setPlayerStatus(PlayerState.Paused)
              }}
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
