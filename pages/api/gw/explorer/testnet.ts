import type { NextApiRequest, NextApiResponse } from 'next'
import { isString, handleGWExplorerCheck } from '../../../../utils'

const endpoint = process.env.GW_EXPLORER_TESTNET_URL

if (!isString(endpoint)) {
  throw new Error(`Endpoint of GW Explorer Testnet is not set`)
}

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  handleGWExplorerCheck(endpoint, res)
}
