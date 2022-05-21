import Redis from 'ioredis'

// Persistent key-value store is provided by Redis, hosted on Upstash
// https://vercel.com/integrations/upstash
const kv = new Redis(process.env.REDIS_URL)

export async function getOdAuthTokens(): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const accessToken = await kv.get('access_token_ilyfairy')
  const refreshToken = await kv.get('refresh_token_ilyfairy')

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
  await kv.set('access_token_ilyfairy', accessToken, 'ex', accessTokenExpiry)
  await kv.set('refresh_token_ilyfairy', refreshToken)
}
