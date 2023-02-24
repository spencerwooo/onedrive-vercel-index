import siteConfig from '@cfg/site.config'

export async function getOdAuthTokens(kv: Redis): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const [accessToken, refreshToken] = await Promise.all([
    kv.get(`${siteConfig.kvPrefix}access_token`),
    kv.get(`${siteConfig.kvPrefix}refresh_token`),
  ])
  return {
    accessToken,
    refreshToken,
  }
}

export async function storeOdAuthTokens(
  kv: Redis,
  {
    accessToken,
    accessTokenExpiry,
    refreshToken,
  }: {
    accessToken: string
    accessTokenExpiry: number
    refreshToken: string
  }
): Promise<void> {
  await Promise.all([
    kv.set(`${siteConfig.kvPrefix}access_token`, accessToken, accessTokenExpiry),
    kv.set(`${siteConfig.kvPrefix}refresh_token`, refreshToken),
  ])
}

export interface Redis {
  get(key: string): Promise<string | null>
  set(key: string, value: string, expiry?: number): Promise<any>
}
