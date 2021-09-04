import Image from 'next/image'
import { FunctionComponent } from 'react'

const FourOhFour: FunctionComponent<{ errorMsg: string }> = ({ errorMsg }) => {
  return (
    <div className="my-20 text-center">
      <div className="md:w-1/3 w-1/2 mx-auto">
        <Image src={'/images/empty.png'} alt="404" width={912} height={912} />
      </div>
      <div className="mt-5 text-gray-500">
        Error: {errorMsg}.{' '}
        <kbd className="border-opacity-20 px-2 py-1 font-mono text-sm bg-gray-200 border rounded">F12</kbd> for more
        details.
      </div>
    </div>
  )
}

export default FourOhFour
