import Image from 'next/image'
import { FunctionComponent } from 'react'

const FourOhFour: FunctionComponent<{ errorMsg: string }> = ({ errorMsg }) => {
  return (
    <div className="my-12">
      <div className="md:w-1/4 w-1/3 mx-auto">
        <Image src={'/images/empty.png'} alt="404" width={912} height={912} />
      </div>
      <div className="mt-6 text-gray-500 max-w-xl mx-auto">
        <div className="text-xl font-bold mb-8">
          Oops, that&apos;s a <span className="underline decoration-wavy decoration-red-500">four-oh-four</span>.
        </div>
        <div className="font-mono border border-gray-400/20 rounded p-2 mb-4 text-xs bg-gray-50 dark:bg-gray-800">
          {errorMsg}
        </div>
        <div className="text-sm">
          The page you looking for either unavailable or not found. Please check your URL. </br>
          If the problem still exists, please contact me at my discord server. <a className="text-blue-600 hover:text-blue-700 hover:underline" href="https://work.mbaharip.me">Go back to main page</a>.
        </div>
      </div>
    </div>
  )
}

export default FourOhFour
