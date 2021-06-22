import axios from 'axios'
import useSWR from 'swr'
import { FunctionComponent } from 'react'
import Link from 'next/link'

const humanFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  const i = Math.floor(Math.log(size) / Math.log(1024))
  const num = size / Math.pow(1024, i)
  const round = Math.round(num)
  const formatted = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round
  return `${formatted} ${'KMGTPEZY'[i - 1]}B`
}

const encodePath = (path: string) => {
  const encodedPath = path === '/' ? '' : path
  if (encodedPath === '/' || encodedPath === '') {
    return ''
  }
  return encodedPath
}

const fetcher = (url: string) => axios.get(url).then(res => res.data)

const FileListing: FunctionComponent<{ path: string }> = ({ path }) => {
  const { data, error } = useSWR(`/api?path=${path}`, fetcher)
  if (error) return <div>Failed to load</div>
  if (!data)
    return (
      <div className="flex items-center justify-center bg-white shadow rounded py-32 space-x-1">
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <div>Loading</div>
      </div>
    )

  const {
    files: { children },
  } = data
  return (
    <div className="bg-white shadow rounded">
      <div className="p-3 grid grid-cols-9 items-center space-x-2">
        <div className="col-span-6 font-bold">Name</div>
        <div className="font-bold col-span-2">Created</div>
        <div className="font-bold">Size</div>
      </div>
      {children.map((c: any) => (
        <Link href={`${encodePath(path)}/${c.name}`} key={c.id} passHref>
          <div className="p-3 grid grid-cols-9 items-center space-x-2 cursor-pointer hover:bg-gray-100">
            <div className="col-span-6 truncate">{c.name}</div>
            <div className="font-mono text-sm col-span-2">
              {new Date(c.createdDateTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
            </div>
            <div className="font-mono text-sm">{humanFileSize(c.size)}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default FileListing
