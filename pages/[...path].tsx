import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'

import siteConfig from '../config/site.json'
import Navbar from '../components/Navbar'
import FileListing from '../components/FileListing'
import Footer from '../components/Footer'

export default function Folders() {
  const { asPath } = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>{siteConfig.title}</title>
      </Head>

      <main className="flex flex-col w-full flex-1 bg-gray-50">
        <Navbar />
        <div className="mx-auto w-full max-w-4xl">
          <div className="py-3 text-sm text-gray-600">
            <Link href="/">🚩 Home </Link>
            {decodeURIComponent(asPath)}
          </div>
          <FileListing path={asPath} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
