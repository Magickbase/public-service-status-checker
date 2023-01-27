import type { NextApiResponse } from 'next'
import { isString } from './type_guard'

const endpointErrMessage = `Endpoint of CKB Node is not set`

const RESILLIENT_TIME = 300_000 // 5 min

const baseOption = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
}

export const CKBFetchOption = {
  tipHeader: {
    ...baseOption,
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'get_tip_header',
    }),
  },
}

const extractHeaderInfo = (header: Record<'hash' | 'number' | 'timestamp', string>) => ({
  hash: header.hash,
  number: +header.number,
  timestamp: +header.timestamp,
})

export const handleCKBNodeCheck = async (endpoint: string, res: NextApiResponse) => {
  if (isString(endpoint)) {
    try {
      /**
       * get the tip/latest block header from ckb node
       */
      const header = await fetch(endpoint, CKBFetchOption.tipHeader)
        .then((r) => r.json())
        .then((r) => extractHeaderInfo(r.result))

      const systemTime = Date.now()
      const status = { header, systemTime }

      /**
       * throw an error if new block header is not found in specific time duration
       */
      if (systemTime - header.timestamp > RESILLIENT_TIME) {
        throw new Error(`Timeout: ${JSON.stringify(status)}`)
      }

      res.status(200).json(status)
    } catch (e) {
      let message = e instanceof Error ? e.message : JSON.stringify(e)
      res.status(500).json({ message: message })
    }
  } else {
    res.status(500).json({ message: endpointErrMessage })
  }
}
