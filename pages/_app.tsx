import '../styles/globals.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFileImage,
  faFilePdf,
  faFileWord,
  faFilePowerpoint,
  faFileExcel,
  faFileAudio,
  faFileVideo,
  faFileArchive,
  faFileCode,
  faFileAlt,
  faFile,
  faFolder,
} from '@fortawesome/free-regular-svg-icons'
import { faMusic } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faMarkdown } from '@fortawesome/free-brands-svg-icons'

import type { AppProps } from 'next/app'

library.add(
  faFileImage,
  faFilePdf,
  faFileWord,
  faFilePowerpoint,
  faFileExcel,
  faFileAudio,
  faFileVideo,
  faFileArchive,
  faFileCode,
  faFileAlt,
  faFile,
  faFolder,
  faGithub,
  faMarkdown,
  faMusic
)

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
