import Redis from 'ioredis'
import siteConfig from '../config/site.config'
import searchLua from '../redis/search.lua'

const kv = new Redis(process.env.REDIS_URL)
kv.defineCommand('searchIndex', {
  numberOfKeys: 1,
  lua: searchLua,
})

/**
 * Search in the index stored in Redis
 * @param q Query string
 * @returns OneDrive item IDs
 */
export default async function searchIndex(q: string): Promise<string[]> {
  return await kv.searchIndex('index', q, siteConfig.maxItems ?? 0)
}
