// This should be only used on the server side, where the tokens are stored with KV store using
// a file system based storage. The tokens are stored in the file system as JSON at /tmp path.
import os from 'os'

import Keyv from 'keyv'
import { KeyvFile } from 'keyv-file'

// console.log(`${os.tmpdir()}/od-auth-token.json`)

export default class TokenStore {
  kv: Keyv

  constructor() {
    this.kv = new Keyv()
    // this.kv = new Keyv({
    //   store: new KeyvFile({
    //     filename: `${os.tmpdir()}/od-auth-token.json`,
    //   }),
    // })
    console.log('TokenStore constructor')
  }

  async getOdAuthTokens(): Promise<{ accessToken: unknown; refreshToken: unknown }> {
    const accessToken = await this.kv.get('access_token')
    const refreshToken = await this.kv.get('refresh_token')

    return {
      accessToken,
      refreshToken,
    }
  }

  async storeOdAuthTokens({
    accessToken,
    accessTokenExpiry,
    refreshToken,
  }: {
    accessToken: string
    accessTokenExpiry: number
    refreshToken: string
  }): Promise<void> {
    await this.kv.set('access_token', accessToken, accessTokenExpiry)
    await this.kv.set('refresh_token', refreshToken)
  }
}
