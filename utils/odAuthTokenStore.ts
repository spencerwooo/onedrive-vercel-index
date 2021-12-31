// This should be only used on the server side, where the tokens are stored with KV store using
// a file system based storage. The tokens are stored in the file system as JSON at /tmp path.
import os from 'os'

import Keyv from 'keyv'
import { KeyvFile } from 'keyv-file'

console.log(`${os.tmpdir()}/od-auth-token.json`)

const kv = new Keyv({
  store: new KeyvFile({
    filename: `${os.tmpdir()}/od-auth-token.json`,
  }),
})

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

export async function getOdAuthTokens(): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const accessToken = await kv.get('access_token')
  const refreshToken = await kv.get('refresh_token')

  return {
    accessToken,
    refreshToken,
  }
}
