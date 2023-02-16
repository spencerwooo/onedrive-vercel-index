import { get } from '@vercel/edge-config'
import { Redis } from '../odAuthTokenStore'

// Persistent key-value store is provided by Redis, hosted on Upstash
// https://vercel.com/integrations/upstash
export const kv: Redis = {
  get: async (key: string) => {
    return (await get(key)) ?? null
  },
  set: async (key: string, value: string, expiry?: number) => {
    if (expiry !== undefined) {
      throw new Error('Not implemented')
    }
    await set(key, value)
  },
}

async function set(key: string, value: string) {
  try {
    const updateEdgeConfig = await fetch(`https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.EDGE_CONFIG_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key,
            value,
          },
        ],
      }),
    })
    const result = await updateEdgeConfig.json()
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}
