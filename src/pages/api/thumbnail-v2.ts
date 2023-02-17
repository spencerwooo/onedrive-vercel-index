import handle from '@/utils/api/thumbnail'
import { kv } from '@/utils/kv/edge'
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  return (await handle(kv, req)).toWeb()
}
