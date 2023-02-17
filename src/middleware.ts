import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { get } from '@vercel/edge-config'

const pattern = /^\/api\/\w+(?=\/|$)/

export async function middleware(request: NextRequest) {
  const original = request.nextUrl

  let { pathname } = original
  if (pathname === '/api/') {
    pathname = '/api/index/'
  }

  const edgeRuntimeEnabled =  process.env.EDGE_CONFIG && (await get<boolean>('edge_runtime'))
  if (!edgeRuntimeEnabled) {
    pathname = pathname.replace(pattern, m => `${m}-v1`)
  } else {
    pathname = pathname.replace(pattern, m => `${m}-v2`)
  }
  const rewritten = new URL(pathname, original)
  original.searchParams.forEach((value, key) => {
    rewritten.searchParams.append(key, value)
  })
  return NextResponse.rewrite(rewritten)
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
}
