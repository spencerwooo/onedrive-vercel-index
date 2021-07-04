import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { getTitle } from '../utils/tools'
const Navbar = () => {
  return (
    <div className="text-left bg-white p-3 sticky top-0 bg-opacity-80 backdrop-blur-md shadow-sm z-[100]">
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <h1 className="font-bold text-xl">{getTitle()}</h1>
        <a href="https://github.com/spencerwooo/onedrive-vercel-index" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={['fab', 'github']} size="lg" />
        </a>
      </div>
    </div>
  )
}

export default Navbar
