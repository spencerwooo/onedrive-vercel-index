// This should be only used on the server side, where the tokens are stored with KV store using
// a file system based storage. The tokens are stored in the file system as JSON at /tmp path.

import Keyv from 'keyv'

export async function getOdAuthTokens(keyv: Keyv): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const accessToken = await keyv.get('access_token')
  const refreshToken = await keyv.get('refresh_token')

  return {
    accessToken,
    refreshToken,
  }
}

export async function storeOdAuthTokens({
  accessToken,
  accessTokenExpiry,
  refreshToken,
  keyv,
}: {
  accessToken: string
  accessTokenExpiry: number
  refreshToken: string
  keyv: Keyv
}): Promise<void> {
  await keyv.set('access_token', accessToken, accessTokenExpiry)
  await keyv.set('refresh_token', refreshToken)
}
