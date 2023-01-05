// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { isString, handleCKBNodeCheck } from '../../../../utils'

const endpoint = process.env.CKB_PUBLIC_MAINNET_NODE_URL

if (!isString(endpoint)) {
  throw new Error(`Endpoint of CKB Mainnet Node is not set`)
}

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  handleCKBNodeCheck(endpoint, res)
}
