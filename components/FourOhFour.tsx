import Image from 'next/image'

const FourOhFour: React.FC<{ errorMsg: string }> = ({ errorMsg }) => {
  return (
    <div className="my-12">
      <div className="w-1/3 mx-auto">
        <Image src="/images/fabulous-rip-2.png" alt="404" width={912} height={912} priority />
      </div>
      <div className="mt-6 text-gray-500 max-w-xl mx-auto">
        <div className="text-xl font-bold mb-8">
          Oops, that&apos;s a <span className="underline decoration-wavy decoration-red-500">four-oh-four</span>.
        </div>
        <div className="font-mono border border-gray-400/20 rounded p-2 mb-4 text-xs bg-gray-50 dark:bg-gray-800">
          {errorMsg}
        </div>
        <div className="text-sm">
          Press{' '}
          <kbd className="border-opacity-20 font-mono text-xs p-1 bg-gray-100 dark:bg-gray-800 border rounded">F12</kbd>{' '}
          and open devtools for more details, or seek help at{' '}
          <a
            className="text-blue-600 hover:text-blue-700 hover:underline"
            href="https://github.com/spencerwooo/onedrive-vercel-index/discussions"
            target="_blank"
            rel="noopener noreferrer"
          >
            onedrive-vercel-index discussions
          </a>
          .
        </div>
      </div>
    </div>
  )
}

export default FourOhFour
