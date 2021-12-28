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
import * as Icons from '@fortawesome/free-brands-svg-icons'

import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'

// import all brand icons with tree-shaking so all icons can be referenced in the app
const iconList = Object.keys(Icons)
  .filter(k => k !== 'fab' && k !== 'prefix')
  .map(icon => Icons[icon])

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
  faChevronCircleDown,
  ...iconList,
)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextNProgress height={1} color="rgb(156, 163, 175, 0.9)" options={{ showSpinner: false }} />
      <Component {...pageProps} />
    </>
  )
}
export default MyApp
