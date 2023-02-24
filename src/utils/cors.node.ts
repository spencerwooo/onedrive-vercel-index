import Cors from 'cors'
import type { CorsOptions } from 'cors'
import { NextApiRequest, NextApiResponse } from 'next'

export function initCors(options?: CorsOptions) {
  const cors = Cors(options)
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise((resolve, reject) => {
      cors(req, res, result => {
        if (result instanceof Error) reject(result)
        else return resolve(result)
      })
    })
}

const options: CorsOptions = { methods: ['GET', 'HEAD'] }
export const cors = initCors(options)