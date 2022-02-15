import type { NextApiRequest, NextApiResponse } from 'next'
import { default as indexHandler } from '..'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  indexHandler(req, res)
}
