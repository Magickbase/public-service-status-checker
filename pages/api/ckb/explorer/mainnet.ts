// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { isString, handleCKBExplorerCheck } from '../../../../utils'

const endpoint = process.env.CKB_EXPLORER_MAINNET_URL

if (!isString(endpoint)) {
  throw new Error(`Endpoint of CKB Mainnet Node is not set`)
}

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  handleCKBExplorerCheck(endpoint, res)
}
