import config from '../config/site.json'

const createFooterMarkup = () => {
  return {
    __html: config.footer,
  }
}

const Footer = () => {
  return <div className="p-4 text-sm text-gray-400" dangerouslySetInnerHTML={createFooterMarkup()}></div>
}

export default Footer
