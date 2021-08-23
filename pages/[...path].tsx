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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>{siteConfig.title}</title>
      </Head>

      <main className="flex flex-col w-full flex-1 bg-gray-50 dark:bg-gray-800">
        <Navbar />
        <div className="mx-auto w-full max-w-4xl p-4">
          <Breadcrumb query={query} />
          <FileListing query={query} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
