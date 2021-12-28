import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 'inline' is used for previewing PDF files inside the browser directly
  const { url, inline = false } = req.query

  const decodedUrl = decodeURIComponent(url as string)
  const { headers, data: stream } = await axios.get(decodedUrl, {
    responseType: 'stream',
  })

  // Check if requested file is PDF based on content-type
  if (headers['content-type'] === 'application/pdf' && inline) {
    console.log(headers['content-disposition'])

    // Get filename from content-disposition header
    const filename = headers['content-disposition'].split('filename*=')[1]
    // Remove original content-disposition header
    delete headers['content-disposition']
    // Add new inline content-disposition header along with filename
    headers['content-disposition'] = `inline; filename*=UTF-8''${filename}`
    console.log(headers['content-disposition'])
  }

  // Send data stream as response
  res.writeHead(200, headers)
  stream.pipe(res)
}
