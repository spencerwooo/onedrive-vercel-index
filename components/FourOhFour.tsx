import Script from 'next/script'

const FourOhFour: React.FC<{ errorMsg: string }> = ({ errorMsg }) => {
  return (
    <div class="container">
    <Script src="https://third-party-script.js"></Script>
    <div>Home Page</div>
  </div>
  )
}

export default FourOhFour
