import siteConfig from '../config/site.json'

const Navbar = () => {
  return (
    <div className="text-left bg-white p-2">
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="font-bold text-lg">{siteConfig.title}</h1>
      </div>
    </div>
  )
}

export default Navbar
