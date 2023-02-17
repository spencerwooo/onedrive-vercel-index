import { NodeRequestToWeb } from '@/utils/api/common'
import handle from '@/utils/api/thumbnail'
import { kv } from '@/utils/kv/ioredis'
import { NextApiRequest, NextApiResponse } from 'next'
import '@/utils/api/fetch-polyfill'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await handle(kv, NodeRequestToWeb(req))
  response.toNode(res)
}
