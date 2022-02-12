const Loading: React.FC<{ loadingText: string }> = ({ loadingText }) => {
  return (
    <div className="flex items-center justify-center space-x-1 rounded py-32 dark:text-white">
      <LoadingIcon className="mr-3 -ml-1 h-5 w-5 animate-spin" />
      <div>{loadingText}</div>
    </div>
  )
}

// As there is no CSS-in-JS styling system, pass class list to override styles
export const LoadingIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export default Loading
