// This should be only used on the server side, where the tokens are stored with KV store using
// a file system based storage. The tokens are stored in the file system as JSON at /tmp path.

import Keyv from 'keyv'

// Persistent key-value store is provided by Redis, hosted on Upstash
// https://vercel.com/integrations/upstash
console.log(process.env.REDIS_URL)

const kv = new Keyv(process.env.REDIS_URL)
kv.on('error', err => console.log('Connection Error', err))

export async function getOdAuthTokens(): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const accessToken = await kv.get('access_token')
  const refreshToken = await kv.get('refresh_token')

  return {
    accessToken,
    refreshToken,
  }
}

export async function storeOdAuthTokens({
  accessToken,
  accessTokenExpiry,
  refreshToken,
}: {
  accessToken: string
  accessTokenExpiry: number
  refreshToken: string
}): Promise<void> {
  await kv.set('access_token', accessToken, accessTokenExpiry)
  await kv.set('refresh_token', refreshToken)
}
