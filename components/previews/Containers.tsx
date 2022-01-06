export function PreviewContainer({ children }): JSX.Element {
  return <div className="dark:bg-gray-900 p-3 bg-white rounded border border-gray-900/10">{children}</div>
}

export function DownloadBtnContainer({ children }): JSX.Element {
  return (
    <div className="mt-4 border rounded border-gray-900/10 p-2 sticky bottom-0 left-0 right-0 z-10 bg-white bg-opacity-80 backdrop-blur-md dark:bg-gray-900">
      {children}
    </div>
  )
}
