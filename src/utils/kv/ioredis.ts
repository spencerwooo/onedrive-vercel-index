import Client from 'ioredis'
import { Redis } from '../odAuthTokenStore'

const redis = new Client(process.env.REDIS_URL || '')

export const kv: Redis = {
  get: async (key: string) => {
    return await redis.get(key)
  },
  set: async (key: string, value: string, expiry?: number) => {
    if (expiry === undefined) {
      await redis.set(key, value)
    } else {
      await redis.set(key, value, 'EX', expiry)
    }
  },
}
