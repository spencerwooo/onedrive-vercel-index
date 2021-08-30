import Image from 'next/image'
import { FunctionComponent } from 'react'

const FourOhFour: FunctionComponent<{ errorMsg: string }> = ({ errorMsg }) => {
  return (
    <div className="text-center my-20">
      <div className="mx-auto w-1/2 md:w-1/3">
        <Image src={'/images/empty.png'} alt="404" width={912} height={912} />
      </div>
      <div className="text-gray-500 mt-5">
        Error: {errorMsg}.{' '}
        <kbd className="border bg-gray-200 font-mono text-sm px-2 py-1 rounded border-opacity-20">F12</kbd> for more
        details.
      </div>
    </div>
  )
}

export default FourOhFour
