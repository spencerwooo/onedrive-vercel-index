import type { OdThumbnail } from '@/types'

import pathPosix from 'path-browserify'

import apiConfig from '@cfg/api.config'
import {
  getAccessToken,
  checkAuthRoute,
  encodePath,
  setCaching,
  noCacheForProtectedPath,
  handleResponseError,
  ResponseCompat,
} from '@/utils/api/common'
import { NextRequest } from 'next/server'
import { Redis } from '@/utils/odAuthTokenStore'

export default async function handler(kv: Redis, req: NextRequest) {
  const accessToken = await getAccessToken(kv)
  if (!accessToken) {
    return ResponseCompat.json({ error: 'No access token.' }, { status: 403 })
  }

  // Get item thumbnails by its path since we will later check if it is protected
  const search = req.nextUrl.searchParams,
    path = search.get('path') ?? '',
    size = search.get('size') ?? 'medium',
    odpt = search.get('odpt') ?? ''

  const headers = new Headers()

  // Set edge function caching for faster load times, if route is not protected, check docs:
  // https://vercel.com/docs/concepts/functions/edge-caching
  if (odpt === '') setCaching(headers)

  // Check whether the size is valid - must be one of 'large', 'medium', or 'small'
  if (size !== 'large' && size !== 'medium' && size !== 'small') {
    return ResponseCompat.json({ error: 'Invalid size' }, { status: 400, headers })
  }
  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    return ResponseCompat.json({ error: 'No path specified.' }, { status: 400, headers })
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    return ResponseCompat.json({ error: 'Path query invalid.' }, { status: 400, headers })
  }
  const cleanPath = pathPosix.resolve('/', pathPosix.normalize(path))

  const { code, message } = await checkAuthRoute(cleanPath, accessToken, odpt as string)
  // Status code other than 200 means user has not authenticated yet
  if (code !== 200) {
    return ResponseCompat.json({ error: message }, { status: code, headers })
  }
  noCacheForProtectedPath(headers, message)

  const requestPath = encodePath(cleanPath)
  // Handle response from OneDrive API
  const requestUrl = `${apiConfig.driveApi}/root${requestPath}`
  // Whether path is root, which requires some special treatment
  const isRoot = requestPath === ''

  try {
    const data = await fetch(`${requestUrl}${isRoot ? '' : ':'}/thumbnails`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => (res.ok ? res.json() : Promise.reject(res)))

    const thumbnailUrl = data.value && data.value.length > 0 ? (data.value[0] as OdThumbnail)[size].url : null
    if (!thumbnailUrl) {
      return ResponseCompat.json({ error: "The item doesn't have a valid thumbnail." }, { status: 400, headers })
    }
    return ResponseCompat.redirect(thumbnailUrl, { headers })
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return ResponseCompat.json(data, { status, headers })
  }
}
