import { NextApiRequest, NextApiResponse } from 'next'
import '@/utils/api/fetch-polyfill'
import handle from '../raw-v1'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return handle(req, res)
}
