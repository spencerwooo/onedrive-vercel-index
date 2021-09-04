import Head from 'next/head'
import { useRouter } from 'next/router'

import siteConfig from '../config/site.json'
import Navbar from '../components/Navbar'
import FileListing from '../components/FileListing'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'

export default function Folders() {
  const { query } = useRouter()

  return (
    <div className="dark:bg-gray-900 flex flex-col items-center justify-center min-h-screen bg-white">
      <Head>
        <title>{siteConfig.title}</title>
      </Head>

      <main className="bg-gray-50 dark:bg-gray-800 flex flex-col flex-1 w-full">
        <Navbar />
        <div className="w-full max-w-4xl p-4 mx-auto">
          <Breadcrumb query={query} />
          <FileListing query={query} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
