import axios from 'axios'
import { useEffect, useState } from 'react'

// Custom hook to axios get a URL or API endpoint on mount
export default function useAxiosGet(fetchUrl: string): { response: any; error: string; validating: boolean } {
  const [response, setResponse] = useState('')
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios
      // Using 'blob' as response type to get the response as a raw file blob, which is later parsed as a string.
      // Axios defaults response parsing to JSON, which causes issues when parsing JSON files.
      .get(fetchUrl, { responseType: 'blob' })
      .then(async res => setResponse(await res.data.text()))
      .catch(e => setError(e.message))
      .finally(() => {
        setValidating(false)
      })
  }, [fetchUrl])
  return { response, error, validating }
}
