import { NodeRequestToWeb } from '@/utils/api/common'
import handle from '@/utils/api/item'
import { kv } from '@/utils/kv/ioredis'
import { NextApiRequest, NextApiResponse } from 'next'
import '@/utils/api/fetch-polyfill'
import { cors } from '@/utils/cors.node'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await handle(kv, NodeRequestToWeb(req))
  response.toNode(res)
  if (response.cors) {
    await cors(req, res)
  }
}
