import '../styles/globals.css'
import '../styles/prism-github.css'
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
  faCopy
} from '@fortawesome/free-regular-svg-icons'
import { faMusic, faArrowLeft, faArrowRight, faFileDownload } from '@fortawesome/free-solid-svg-icons'
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
  faMusic,
  faArrowLeft,
  faArrowRight,
  faFileDownload,
  faCopy
)

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
