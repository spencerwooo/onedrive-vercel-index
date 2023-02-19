import { cors } from '@/utils/cors.web'
import { kv } from '@/utils/kv/edge'
import { NextRequest } from 'next/server'
import { ReqHandler } from '.'

export function getHandler(handle: ReqHandler) {
  return async function handler(req: NextRequest) {
    const response = await handle(kv, req)
    if (response.cors) {
      return await cors(req, response.toWeb())
    }
    return response.toWeb()
  }
}
