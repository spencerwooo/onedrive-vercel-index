import type { OdFileObject } from '../../types'

import { FC, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import axios from 'axios'
import toast from 'react-hot-toast'
import Plyr from 'plyr-react'
import subsrt from 'subsrt'
import { useAsync } from 'react-async-hook'
import { useClipboard } from 'use-clipboard-copy'

import { getBaseUrl } from '../../utils/getBaseUrl'
import { getExtension } from '../../utils/getFileIcon'
import { getStoredToken } from '../../utils/protectedRouteHandler'

import { DownloadButton } from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import CustomEmbedLinkMenu from '../CustomEmbedLinkMenu'

import 'plyr-react/dist/plyr.css'
import CustomMediaTrackMenu from '../CustomMediaTrackMenu'

const VideoPlayer: FC<{
  videoName: string
  videoUrl: string
  width?: number
  height?: number
  thumbnail: string
  tracks: Plyr.Track[]
  isFlv: boolean
  mpegts: any
}> = ({ videoName, videoUrl, width, height, thumbnail, tracks, isFlv, mpegts }) => {
  const { t } = useTranslation()
  // Store pairs of original link and transcoded blob link
  const [trackSrcMap, setTrackSrcMap] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    if (isFlv) {
      const loadFlv = () => {
        // Really hacky way to get the exposed video element from Plyr
        const video = document.getElementById('plyr')
        const flv = mpegts.createPlayer({ url: videoUrl, type: 'flv' })
        flv.attachMediaElement(video)
        flv.load()
      }
      loadFlv()
    }
  }, [videoUrl, isFlv, mpegts])

  const asyncTracks = useAsync(async () => {
    const loadingToast = toast.loading(t('Loading subtitles...'))
    // Remove duplicated items
    const noDuplTargetTracks = tracks.filter(
      (value1, index, self) =>
        index === self.findIndex(value2 => Object.keys(value2).every(key => value2[key] == value1[key]))
    )
    // Get src of transcoded subtitles
    const jobs: Promise<any>[] = noDuplTargetTracks
      .filter(sub => !trackSrcMap.has(sub.src) && sub.src != '')
      .map(sub => {
        return new Promise((resolve, reject) => {
          axios
            .get(sub.src, { responseType: 'blob', timeout: 5000 })
            .then(resp => {
              resp.data
                .text()
                .then(vttsub => {
                  if (subsrt.detect(vttsub) != 'vtt') {
                    vttsub = subsrt.convert(vttsub, { format: 'vtt' })
                  }
                  trackSrcMap.set(sub.src, URL.createObjectURL(new Blob([vttsub])))
                  resolve('success')
                })
                .catch(() => {
                  trackSrcMap.set(sub.src, '')
                  resolve('error')
                })
            })
            .catch(e => {
              if (e.code != 'ECONNABORTED') trackSrcMap.set(sub.src, '')
              resolve('error')
            })
        })
      })
    await Promise.all(jobs)
    // Build new subtitle tracks
    const realTracks: Plyr.Track[] = []
    noDuplTargetTracks.forEach(el => {
      const vttSrc = trackSrcMap.get(el.src)
      if (vttSrc != undefined && vttSrc != '') {
        realTracks.push({
          ...el,
          src: vttSrc,
        })
      }
    })
    setTrackSrcMap(trackSrcMap)
    toast.dismiss(loadingToast)
    return realTracks
  }, [tracks])

  // Common plyr configs, including the video source and plyr options
  const plyrSource: Plyr.SourceInfo = {
    type: 'video',
    title: videoName,
    poster: thumbnail,
    tracks: asyncTracks.result ?? [],
    sources: isFlv ? [] : [{ src: videoUrl }],
  }
  const plyrOptions: Plyr.Options = {
    ratio: `${width ?? 16}:${height ?? 9}`,
    captions: { update: true },
  }
  return (
    // Add translate="no" to avoid "Uncaught DOMException: Failed to execute 'removeChild' on 'Node'" error.
    // https://github.com/facebook/react/issues/11538
    <div translate="no">
      <Plyr id="plyr" source={plyrSource} options={plyrOptions} />
    </div>
  )
}

const VideoPreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { asPath } = useRouter()
  const hashedToken = getStoredToken(asPath)
  const clipboard = useClipboard()

  const [linkMenuOpen, setLinkMenuOpen] = useState(false)
  const [trackMenuOpen, setTrackMenuOpen] = useState(false)
  const [targetTracks, setTargetTracks] = useState<Plyr.Track[]>(() => {
    return Array.from(['.vtt', '.ass', '.srt']).map(suffix => {
      return {
        kind: 'captions',
        label: `${file.name.substring(0, file.name.lastIndexOf('.'))}${suffix}`,
        src: `/api/raw/?path=${asPath.substring(0, asPath.lastIndexOf('.'))}${suffix}${
          hashedToken ? `&odpt=${hashedToken}` : ''
        }`,
        srcLang: undefined,
        default: false,
      }
    })
  })

  const { t } = useTranslation()

  // OneDrive generates thumbnails for its video files, we pick the thumbnail with the highest resolution
  const thumbnail = `/api/thumbnail/?path=${asPath}&size=large${hashedToken ? `&odpt=${hashedToken}` : ''}`

  // We also format the raw video file for the in-browser player as well as all other players
  const videoUrl = `/api/raw/?path=${asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`

  const isFlv = getExtension(file.name) === 'flv'
  const asyncFlvExtension = useAsync(async () => {
    if (isFlv) {
      return (await import('mpegts.js')).default
    }
  }, [isFlv])

  return (
    <>
      <CustomEmbedLinkMenu path={asPath} menuOpen={linkMenuOpen} setMenuOpen={setLinkMenuOpen} />
      <CustomMediaTrackMenu
        path={asPath}
        tracks={targetTracks}
        setTracks={setTargetTracks}
        menuOpen={trackMenuOpen}
        setMenuOpen={setTrackMenuOpen}
      />
      <PreviewContainer>
        {asyncFlvExtension.error ? (
          <FourOhFour errorMsg={asyncFlvExtension.error.message} />
        ) : asyncFlvExtension.loading && isFlv ? (
          <Loading loadingText={t('Loading FLV extension...')} />
        ) : (
          <VideoPlayer
            videoName={file.name}
            videoUrl={videoUrl}
            width={file.video?.width}
            height={file.video?.height}
            thumbnail={thumbnail}
            tracks={targetTracks}
            isFlv={isFlv}
            mpegts={asyncFlvExtension.result}
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
          <DownloadButton
            onClickCallback={() => {
              clipboard.copy(`${getBaseUrl()}/api/raw/?path=${asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`)
              toast.success(t('Copied direct link to clipboard.'))
            }}
            btnColor="pink"
            btnText={t('Copy direct link')}
            btnIcon="copy"
          />
          <DownloadButton
            onClickCallback={() => setLinkMenuOpen(true)}
            btnColor="teal"
            btnText={t('Customise link')}
            btnIcon="pen"
          />
          <DownloadButton
            onClickCallback={() => setTrackMenuOpen(true)}
            btnColor="blue"
            btnText={t('Customise player track')}
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
            onClickCallback={() => window.open(`potplayer://${getBaseUrl()}${videoUrl}`)}
            btnText="PotPlayer"
            btnImage="/players/potplayer.png"
          />
          <DownloadButton
            onClickCallback={() => window.open(`nplayer-http://${window?.location.hostname ?? ""}${videoUrl}`)}
            btnText="nPlayer"
            btnImage="/players/nplayer.png"
          />
        </div>
      </DownloadBtnContainer>
    </>
  )
}

export default VideoPreview
