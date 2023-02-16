import apiConfig from '@cfg/api.config'
import { getAccessToken, handleResponseError, setCaching } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/utils/kv/edge'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  // Get access token from storage
  const accessToken = await getAccessToken(kv)

  // Get item details (specifically, its path) by its unique ID in OneDrive
  const id = req.nextUrl.searchParams.get('id') ?? ''

  const headers = setCaching(new Headers())

  if (typeof id !== 'string') return NextResponse.json({ error: 'Invalid driveItem ID.' }, { status: 400, headers })
  const itemApi = new URL(`${apiConfig.driveApi}/items/${id}`)
  itemApi.searchParams.set('select', 'id,name,parentReference')

  try {
    const data = await fetch(itemApi, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => (res.ok ? res.json() : Promise.reject(res)))
    return NextResponse.json(data, { status: 200, headers })
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return NextResponse.json(data, { status, headers })
  }
}
