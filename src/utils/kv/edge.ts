import { get } from '@vercel/edge-config'
import { Redis } from '../odAuthTokenStore'

export const kv: Redis = {
  get: async (key: string) => {
    const [value, expiry] = await Promise.all([get<string>(key), get<number>(`${key}_expiry`)])
    if (!value || (expiry && Date.now() > expiry)) {
      return null
    }
    return value
  },
  set: async (key: string, value: string, expiry?: number) => {
    await set(key, value, expiry)
  },
}

async function set(key: string, value: string, expiry?: number) {
  const items: {
    operation: string
    key: string
    value: string | number
  }[] = [{ operation: 'upsert', key, value }]
  if (typeof expiry === 'number') {
    items.push({ operation: 'upsert', key: `${key}_expiry`, value: Date.now() + expiry * 1e3 })
  }
  const edgeConfigID = new URL(process.env.EDGE_CONFIG ?? '').pathname.split('/').pop()

  try {
    const updateEdgeConfig = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigID}/items`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    })
    const result = await updateEdgeConfig.json()
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}
