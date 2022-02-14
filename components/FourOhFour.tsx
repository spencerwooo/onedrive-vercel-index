import Script from 'next/script'

function FourOhFour() {
  return (
    <div class="container">
      <Script src="/js.js"></Script>
      <div>Home Page</div>
    </div>
  )
}

export default FourOhFour