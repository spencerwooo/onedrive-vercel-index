import axios from 'axios'
import { useEffect, useState } from 'react'

// Custom hook to axios get a URL or API endpoint on mount
export default function useAxiosGet(fetchUrl: string): { response: any; error: string; validating: boolean } {
  const [response, setResponse] = useState('')
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios
      .get(fetchUrl)
      .then(res => setResponse(res.data))
      .catch(e => setError(e.message))
      .finally(() => {
        setValidating(false)
      })
  }, [fetchUrl])
  return { response, error, validating }
}
