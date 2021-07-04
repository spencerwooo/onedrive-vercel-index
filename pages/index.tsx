import Head from 'next/head'

import Navbar from '../components/Navbar'
import FileListing from '../components/FileListing'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import { getTitle } from '../utils/tools'
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>{getTitle()}</title>
      </Head>

      <main className="flex flex-col w-full flex-1 bg-gray-50">
        <Navbar />
        <div className="mx-auto w-full max-w-4xl p-4">
          <Breadcrumb />
          <FileListing />
        </div>
      </main>

      <Footer />
    </div>
  )
}
