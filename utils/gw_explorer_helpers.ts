import type { NextApiResponse } from 'next'
import { isString } from './type_guard'

const endpointErrMessage = `Endpoint of Godwoken Explorer is not set`

const RESILLIENT_TIME = 900_000 // 15 min

export const handleGWExplorerCheck = async (endpoint: string, res: NextApiResponse) => {
  if (isString(endpoint)) {
    try {
      /**
       * get the latest block on https://www.gwscan.com
       */
      const block = await fetch(`${endpoint}/graphql`, {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: '{"query":"\\n  query {\\n    blocks {\\n      number\\n      hash\\n      timestamp\\n      status\\n      transaction_count\\n    }\\n  }\\n"}',
        method: 'POST',
      })
        .then((r) => r.json())
        .then((r) => r.data.blocks[0])

      const systemTime = Date.now()
      const status = { block, systemTime }

      if (!block) {
        throw new Error('Failed to fetch block')
      }

      /**
       * throw an error if no new block is found in specific time duration
       */
      if (systemTime - new Date(block.timestamp).getTime() > RESILLIENT_TIME) {
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
