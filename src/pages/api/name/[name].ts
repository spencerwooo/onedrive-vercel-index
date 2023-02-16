import { NextRequest } from 'next/server'
import rawFileHandler from '../raw'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  return await rawFileHandler(req)
}
