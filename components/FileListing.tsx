import { FunctionComponent } from 'react'
import { ParsedUrlQuery } from 'querystring'

const FileListing: FunctionComponent<{ query: ParsedUrlQuery }> = ({ query }) => {
  const { path } = query

  // Multiple levels of path
  if (Array.isArray(path)) {
    return (
      <>
        {path.map((p: any, i: number) => (
          <div key="i">{p}</div>
        ))}
      </>
    )
  }

  // Only one level of path
  if (path) {
    return <div>{path}</div>
  }
  return <div>index page</div>
}

export default FileListing
