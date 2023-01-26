export function PreviewContainer({ children }): JSX.Element {
  return <div className="rounded bg-white p-3 shadow-sm dark:bg-gray-900 dark:text-white">{children}</div>
}

export function DownloadBtnContainer({ children }): JSX.Element {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 rounded border-t border-gray-900/10 bg-white bg-opacity-80 p-2 shadow-sm backdrop-blur-md dark:border-gray-500/30 dark:bg-gray-900">
      {children}
    </div>
  )
}
