import Image from 'next/image'
import { FunctionComponent } from 'react'

const FourOhFour: FunctionComponent<{ errorMsg: string }> = ({ errorMsg }) => {
  return (
    <div className="text-center my-20">
      <div className="mx-auto w-1/2 md:w-1/3">
        <Image src={'/404.png'} alt="404" width={825} height={910} />
      </div>
      <div className="text-gray-500 mt-5">Error: {errorMsg}</div>
    </div>
  )
}

export default FourOhFour
