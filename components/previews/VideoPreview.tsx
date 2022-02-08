import type { OdFileObject } from '../../types'
import { useRouter } from 'next/router'
import { useClipboard } from 'use-clipboard-copy'
import DPlayer from 'react-dplayer'
import toast from 'react-hot-toast'
import { useAsync } from 'react-async-hook'

import { getBaseUrl } from '../../utils/getBaseUrl'
import { getExtension } from '../../utils/getFileIcon'
import { getReadablePath } from '../../utils/getReadablePath'
import { DownloadButton } from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import FourOhFour from '../FourOhFour'
import Loading from '../Loading'

const VideoPreview: React.FC<{ file: OdFileObject }> = ({ file }) => {
  const { asPath } = useRouter()
  const clipboard = useClipboard()

  // OneDrive generates thumbnails for its video files, we pick the thumbnail with the highest resolution
  const thumbnail = file.thumbnails && file.thumbnails.length > 0 ? file.thumbnails[0].large.url : ''

  // We assume subtitle files are beside the video with the same name, only webvtt '.vtt' files are supported
  const subtitle = `/api?path=${asPath.replace(getExtension(file.name), 'vtt')}&raw=true`

  const isFlv = getExtension(file.name) === 'flv'
  const {
    loading,
    error,
    result: flvjs,
  } = useAsync(async () => {
    if (isFlv) {
      return (await import('flv.js')).default
    }
  }, [isFlv])

  return (
    <>
      <PreviewContainer>
        {error ? (
          <FourOhFour errorMsg={error.message} />
        ) : loading && isFlv ? (
          <Loading loadingText="Loading FLV extension..." />
        ) : (
          <DPlayer
            className="aspect-video"
            options={{
              volume: 1.0,
              lang: 'en',
              video: {
                url: file['@microsoft.graph.downloadUrl'],
                pic: thumbnail,
                type: isFlv ? 'customFlv' : 'auto',
                customType: {
                  customFlv: (video: HTMLVideoElement) => {
                    const flvPlayer = flvjs!.createPlayer({
                      type: 'flv',
                      url: video.src,
                    })
                    flvPlayer.attachMediaElement(video)
                    flvPlayer.load()
                  },
                },
              },
              subtitle: { url: subtitle },
            }}
          />
        )}
      </PreviewContainer>

      <DownloadBtnContainer>
        <div className="flex flex-wrap justify-center gap-2">
          <DownloadButton
            onClickCallback={() => window.open(file['@microsoft.graph.downloadUrl'])}
            btnColor="blue"
            btnText="Download"
            btnIcon="file-download"
          />
          {/* <DownloadButton
            onClickCallback={() =>
              window.open(`/api/proxy?url=${encodeURIComponent(file['@microsoft.graph.downloadUrl'])}`)
            }
            btnColor="teal"
            btnText="Proxy download"
            btnIcon="download"
          /> */}
          <DownloadButton
            onClickCallback={() => {
              clipboard.copy(`${getBaseUrl()}/api?path=${getReadablePath(asPath)}&raw=true`)
              toast.success('Copied direct link to clipboard.')
            }}
            btnColor="pink"
            btnText="Copy direct link"
            btnIcon="copy"
          />

          <DownloadButton
            onClickCallback={() => window.open(`iina://weblink?url=${file['@microsoft.graph.downloadUrl']}`)}
            btnText="IINA"
            btnImage="/players/iina.png"
          />
          <DownloadButton
            onClickCallback={() => window.open(`vlc://${file['@microsoft.graph.downloadUrl']}`)}
            btnText="VLC"
            btnImage="/players/vlc.png"
          />
          <DownloadButton
            onClickCallback={() => window.open(`potplayer://${file['@microsoft.graph.downloadUrl']}`)}
            btnText="PotPlayer"
            btnImage="/players/potplayer.png"
          />
        </div>
      </DownloadBtnContainer>
    </>
  )
}

export default VideoPreview
