import Link from 'next/link'

import { ParsedUrlQuery } from 'querystring'
import { FunctionComponent } from 'react'

const Breadcrumb: FunctionComponent<{ query?: ParsedUrlQuery }> = ({ query }) => {
  if (query) {
    const { path } = query
    if (Array.isArray(path)) {
      return (
        <div className="py-2 text-sm text-gray-600 flex">
          <div className="p-1 hover:text-black transition-all duration-75">
            <Link href="/">🚩 Home</Link>
          </div>
          {path.map((q: string, i: number) => (
            <div key={i} className="flex items-center">
              <div>/</div>
              <div className="p-1 hover:text-black transition-all duration-75">
                <Link href={`/${path.slice(0, i + 1).join('/')}`}>{q}</Link>
              </div>
            </div>
          ))}
        </div>
      )
    }
  }

  return (
    <div className="py-2 text-sm text-gray-600 hover:text-black transition-all duration-75">
      <div className="p-1">
        <Link href="/">🚩 Home</Link>
      </div>
    </div>
  )
}

export default Breadcrumb
