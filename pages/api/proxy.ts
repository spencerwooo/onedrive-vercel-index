import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import apiConfig from '../../config/api.json'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 'inline' is used for previewing PDF files inside the browser directly
  const { url, inline = false } = req.query

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Bad request, URL is not valid.' })
    return
  }

  // Only handle urls that start with OneDrive's own direct link (or SharePoint's):
  // https://public.*.files.1drv.com/y4m0G_0GPeS8AXGrux-lVV79eU1F38VbWxtCSi-8-aUkBLeZH1H6...
  const hostname = new URL(url).hostname
  if (hostname.match(new RegExp(apiConfig.directLinkRegex)) === null) {
    res
      .status(400)
      .json({ error: `URL forbidden, only OneDrive direct links that match ${apiConfig.directLinkRegex} are allowed.` })
    return
  }

  const { headers, data: stream } = await axios.get(url as string, {
    responseType: 'stream',
  })

  // Check if requested file is PDF based on content-type
  if (headers['content-type'] === 'application/pdf' && inline) {
    // Get filename from content-disposition header
    const filename = headers['content-disposition'].split(/filename[*]?=/)[1]
    // Remove original content-disposition header
    delete headers['content-disposition']
    // Add new inline content-disposition header along with filename
    headers['content-disposition'] = `inline; filename*=UTF-8''${filename}`
  }

  // Send data stream as response
  res.writeHead(200, headers)
  stream.pipe(res)
}
