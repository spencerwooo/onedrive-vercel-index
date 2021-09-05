import '../styles/globals.css'
import '../styles/prism-vsc-dark.css'
import '../styles/markdown-github.css'

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
  faCopy,
  faArrowAltCircleDown,
  faTrashAlt,
  faEnvelope,
} from '@fortawesome/free-regular-svg-icons'
import {
  faPlus,
  faMinus,
  faCopy as faCopySolid,
  faDownload,
  faMusic,
  faArrowLeft,
  faArrowRight,
  faFileDownload,
  faUndo,
  faBook,
  faKey,
  faSignOutAlt,
  faCloud,
  faChevronCircleDown,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub, faMarkdown, faTelegramPlane } from '@fortawesome/free-brands-svg-icons'

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
  faCopy,
  faCopySolid,
  faPlus,
  faMinus,
  faDownload,
  faUndo,
  faBook,
  faArrowAltCircleDown,
  faKey,
  faTrashAlt,
  faSignOutAlt,
  faEnvelope,
  faCloud,
  faTelegramPlane,
  faChevronCircleDown
)

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
