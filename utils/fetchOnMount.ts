import axios from 'axios'
import { useEffect, useState } from 'react'

// Custom hook to fetch raw file content on mount
export default function useFileContent(odRawUrl: string): { content: string; error: null; validating: boolean } {
  const [content, setContent] = useState('')
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios
      .get(odRawUrl)
      .then(res => setContent(res.data))
      .catch(e => setError(e.message))
      .finally(() => {
        setValidating(false)
      })
  }, [odRawUrl])
  return { content, error, validating }
}
