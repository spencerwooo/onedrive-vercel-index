import apiConfig from '@cfg/api.config'
import { ResponseCompat, getAccessToken, handleResponseError, setCaching } from '@/utils/api/common'
import { NextRequest } from 'next/server'
import { Redis } from '@/utils/odAuthTokenStore'

export default async function handler(kv: Redis, req: NextRequest) {
  // Get access token from storage
  const accessToken = await getAccessToken(kv)

  // Get item details (specifically, its path) by its unique ID in OneDrive
  const id = req.nextUrl.searchParams.get('id') ?? ''

  const headers = setCaching(new Headers())

  if (typeof id !== 'string') return ResponseCompat.json({ error: 'Invalid driveItem ID.' }, { status: 400, headers })
  const itemApi = new URL(`${apiConfig.driveApi}/items/${id}`)
  itemApi.searchParams.set('select', 'id,name,parentReference')

  try {
    const data = await fetch(itemApi, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => (res.ok ? res.json() : Promise.reject(res)))
    return ResponseCompat.json(data, { status: 200, headers })
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return ResponseCompat.json(data, { status, headers })
  }
}
