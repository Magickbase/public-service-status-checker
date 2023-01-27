// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { isString } from '../../../utils'

const endpoint = process.env.CKB_FAUCET_URL

if (!isString(endpoint)) {
  throw new Error(`Endpoint of CKB Faucet is not set`)
}

const RESILLIENT_TIME = 600_000 // 10 min

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  if (isString(endpoint)) {
    try {
      /**
       * get the first entry of claims on https://faucet.nervos.org/
       */
      const claim = await fetch(`${endpoint}/claim_events`)
        .then((r) => r.json())
        .then((r) => r.claimEvents.data[0]?.attributes)

      const systemTime = Date.now()
      const status = { claim, systemTime }

      /**
       * throw an error if the first entry suspends for more than specific time
       */
      if (claim?.status === 'pending' && systemTime - claim.timestamp * 1000 > RESILLIENT_TIME) {
        throw new Error(`Timeout: ${JSON.stringify(status)}`)
      }

      res.status(200).json(status)
    } catch (e) {
      let message = e instanceof Error ? e.message : JSON.stringify(e)
      res.status(500).json({ message: message })
    }
  } else {
    res.status(500).json({ message: `Endpoint of CKB Faucet is not set` })
  }
}
