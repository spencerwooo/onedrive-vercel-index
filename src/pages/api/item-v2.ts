export const config = {
  runtime: 'edge',
}

import { getHandler } from '@/utils/api/common/v2'
import handle from '@/utils/api/item'
export default getHandler(handle)
