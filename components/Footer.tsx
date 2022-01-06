import config from '../config/site.json'

const createFooterMarkup = () => {
  return {
    __html: config.footer,
  }
}

const Footer = () => {
  return (
    <div
      className="p-4 text-sm text-gray-400 w-full text-center border-t border-gray-900/10 dark:border-gray-500/30"
      dangerouslySetInnerHTML={createFooterMarkup()}
    ></div>
  )
}

export default Footer
