import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    clientId: process.env.CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    userPrincipalName: process.env.USER_PRINCIPAL_NAME || '',
    baseDirectory: process.env.BASE_DIRECTORY || '/'
  })
}
