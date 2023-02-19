export const config = {
  runtime: 'edge',
}

import { getHandler } from '@/utils/api/common/v2'
import handle from '@/utils/api/thumbnail'
export default getHandler(handle)
