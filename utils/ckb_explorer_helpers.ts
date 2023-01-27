import type { NextApiResponse } from 'next'
import { isString } from './type_guard'

const endpointErrMessage = `Endpoint of CKB Explorer is not set`

const RESILLIENT_TIME = 900_000 // 15 min

export const handleCKBExplorerCheck = async (endpoint: string, res: NextApiResponse) => {
  if (isString(endpoint)) {
    try {
      /**
       * get the block list on https://explorer.nervos.org/
       */
      const blockListRes = await fetch(endpoint + '/api/v1/blocks', {
        headers: {
          'content-type': 'application/vnd.api+json',
          accept: 'application/vnd.api+json',
        },
      }).then((r) => r.json())

      /**
       * get the latest block in the list
       */
      const block = blockListRes.data[0]?.attributes

      if (!block) {
        throw new Error('Failed to fetch block')
      }

      const systemTime = Date.now()
      const status = { block, systemTime }

      /**
       * throw an error if no new block is found in specific time duration
       */
      if (systemTime - +block.timestamp > RESILLIENT_TIME) {
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
