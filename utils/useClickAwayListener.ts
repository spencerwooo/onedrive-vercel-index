import { MutableRefObject } from 'react'

function useClickAwayListener<T extends Element>(ref: MutableRefObject<T | null>, handle: () => void) {
  if (typeof document === 'undefined') {
    return
  }

  const handleClickAway = (e: MouseEvent | TouchEvent) => {
    if (ref.current && !ref.current.contains(e.target as Element)) {
      handle()
    }
  }

  document.addEventListener('mousedown', handleClickAway)
  document.addEventListener('touchstart', handleClickAway)
  return () => {
    document.removeEventListener('mousedown', handleClickAway)
    document.removeEventListener('touchstart', handleClickAway)
  }
}

export default useClickAwayListener
