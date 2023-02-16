import { Redis as Client } from '@upstash/redis'
import { Redis } from '../odAuthTokenStore'

const redis = new Client({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Persistent key-value store is provided by Redis, hosted on Upstash
// https://vercel.com/integrations/upstash
export const kv: Redis = {
  get: async (key: string) => {
    return await redis.get(key)
  },
  set: async (key: string, value: string, expiry?: number) => {
    if (expiry === undefined) {
      await redis.set(key, value)
    } else {
      await redis.set(key, value, { ex: expiry })
    }
  },
}
