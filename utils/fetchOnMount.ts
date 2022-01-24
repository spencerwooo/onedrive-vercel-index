import axios from 'axios'
import { useEffect, useState } from 'react'

// Custom hook to fetch raw file content on mount
export default function useAxiosGet(fetchUrl: string): { content: string; error: string; validating: boolean } {
  const [content, setContent] = useState('')
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios
      .get(fetchUrl)
      .then(res => setContent(res.data))
      .catch(e => setError(e.message))
      .finally(() => {
        setValidating(false)
      })
  }, [fetchUrl])
  return { content, error, validating }
}
