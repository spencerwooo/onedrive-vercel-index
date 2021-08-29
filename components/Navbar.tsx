import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'

import siteConfig from '../config/site.json'

const Navbar = () => {
  return (
    <div className="text-left p-1 bg-white dark:bg-gray-900 sticky top-0 bg-opacity-80 backdrop-blur-md shadow-sm z-[100]">
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <h1 className="font-bold text-xl p-2 rounded dark:text-white hover:opacity-80">
          <Link href="/">{siteConfig.title}</Link>
        </h1>
        <a
          href="https://github.com/spencerwooo/onedrive-vercel-index"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded dark:text-white hover:opacity-80"
        >
          <FontAwesomeIcon icon={['fab', 'github']} size="lg" />
        </a>
      </div>
    </div>
  )
}

export default Navbar
