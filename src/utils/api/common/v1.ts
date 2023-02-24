import { NodeRequestToWeb, ReqHandler } from '@/utils/api/common'
import { kv } from '@/utils/kv/ioredis'
import type { NextApiRequest, NextApiResponse } from 'next'
import '@/utils/api/fetch-polyfill'
import { cors } from '@/utils/cors.node'

export function getHandler(handle: ReqHandler) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    const response = await handle(kv, NodeRequestToWeb(req))
    response.toNode(res)
    if (response.cors) {
      await cors(req, res)
    }
  }
}
