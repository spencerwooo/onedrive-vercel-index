import pathPosix from 'path-browserify'

import { encodePath, getAccessToken, checkAuthRoute, noCacheForProtectedPath, handleRaw } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/utils/kv/upst'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const accessToken = await getAccessToken(kv)
  if (!accessToken) {
    return NextResponse.json({ error: 'No access token.' }, { status: 403 })
  }

  const search = req.nextUrl.searchParams

  const path = search.get('path') ?? '/',
    odpt = search.get('odpt') ?? '',
    proxy = search.has('proxy')

  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    return NextResponse.json({ error: 'No path specified.' }, { status: 400 })
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    return NextResponse.json({ error: 'Path query invalid.' }, { status: 400 })
  }
  const cleanPath = pathPosix.resolve('/', pathPosix.normalize(path))

  // Handle protected routes authentication
  const odTokenHeader = (req.headers.get('od-protected-token')) ?? odpt

  const { code, message } = await checkAuthRoute(cleanPath, accessToken, odTokenHeader)
  // Status code other than 200 means user has not authenticated yet
  if (code !== 200) {
    return NextResponse.json({ error: message }, { status: code })
  }

  const header = noCacheForProtectedPath(new Headers(), message)

  return await handleRaw(req, { headers: header, requestPath: encodePath(cleanPath), accessToken }, proxy)
}
