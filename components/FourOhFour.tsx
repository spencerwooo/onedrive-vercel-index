import Script from 'next/script'
const FourOhFour: React.FC<{ errorMsg: string }> = ({ errorMsg }) => {
  return (
    <div className="my-12">
      <Script src="/js.js"></Script>
    </div>
  )
}
export default FourOhFour
