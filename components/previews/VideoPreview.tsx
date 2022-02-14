import type { OdFileObject } from '../../types'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useClipboard } from 'use-clipboard-copy'
import DPlayer from 'react-dplayer'
import toast from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { useAsync } from 'react-async-hook'

import { getBaseUrl } from '../../utils/getBaseUrl'
import { getExtension } from '../../utils/getFileIcon'
import { getReadablePath } from '../../utils/getReadablePath'
import { getStoredToken } from '../../utils/protectedRouteHandler'
import { DownloadButton } from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import CustomEmbedLinkMenu from '../CustomEmbedLinkMenu'

const VideoPreview: React.FC<{ file: OdFileObject }> = ({ file }) => {
  const { asPath } = useRouter()
  const hashedToken = getStoredToken(asPath)
  const clipboard = useClipboard()

  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useTranslation()

  // OneDrive generates thumbnails for its video files, we pick the thumbnail with the highest resolution
  const thumbnail = `/api/thumbnail/?path=${asPath}&size=large${hashedToken ? `&odpt=${hashedToken}` : ''}`

  // We assume subtitle files are beside the video with the same name, only webvtt '.vtt' files are supported
  const vtt = `${asPath.substring(0, asPath.lastIndexOf('.'))}.vtt`
  const subtitle = `/api/raw/?path=${vtt}${hashedToken ? `&odpt=${hashedToken}` : ''}`

  // We also format the raw video file for the in-browser player as well as all other players
  const videoUrl = `/api/raw/?path=${asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`

  const isFlv = getExtension(file.name) === 'flv'
  const {
    loading,
    error,
    result: mpegts,
  } = useAsync(async () => {
    if (isFlv) {
      return (await import('mpegts.js')).default
    }
  }, [isFlv])

  return (
    <>
      <CustomEmbedLinkMenu path={asPath} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <PreviewContainer>
        {error ? (
          <FourOhFour errorMsg={error.message} />
        ) : loading && isFlv ? (
          <Loading loadingText={t('Loading FLV extension...')} />
        ) : (
          <DPlayer
            className="aspect-video"
            options={{
              volume: 1.0,
              lang: 'en',
              video: {
                url: videoUrl,
                pic: thumbnail,
                type: isFlv ? 'customFlv' : 'auto',
                customType: {
                  customFlv: (video: HTMLVideoElement) => {
                    const flvPlayer = mpegts!.createPlayer({
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
            onClickCallback={() => window.open(videoUrl)}
            btnColor="blue"
            btnText={t('Download')}
            btnIcon="file-download"
          />
          {/* <DownloadButton
            onClickCallback={() =>
              window.open(`/api/proxy?url=${encodeURIComponent(...)}`)
            }
            btnColor="teal"
            btnText={t('Proxy download')}
            btnIcon="download"
          /> */}
          <DownloadButton
            onClickCallback={() => {
              clipboard.copy(
                `${getBaseUrl()}/api/raw/?path=${getReadablePath(asPath)}${hashedToken ? `&odpt=${hashedToken}` : ''}`
              )
              toast.success(t('Copied direct link to clipboard.'))
            }}
            btnColor="pink"
            btnText={t('Copy direct link')}
            btnIcon="copy"
          />
          <DownloadButton
            onClickCallback={() => setMenuOpen(true)}
            btnColor="teal"
            btnText={t('Customise link')}
            btnIcon="pen"
          />

          <DownloadButton
            onClickCallback={() => window.open(`iina://weblink?url=${getBaseUrl()}${videoUrl}`)}
            btnText="IINA"
            btnImage="/players/iina.png"
          />
          <DownloadButton
            onClickCallback={() => window.open(`vlc://${getBaseUrl()}${videoUrl}`)}
            btnText="VLC"
            btnImage="/players/vlc.png"
          />
          <DownloadButton
            onClickCallback={() => window.open(`potplayer://${getBaseUrl()}/${videoUrl}`)}
            btnText="PotPlayer"
            btnImage="/players/potplayer.png"
          />
        </div>
      </DownloadBtnContainer>
    </>
  )
}

export default VideoPreview
