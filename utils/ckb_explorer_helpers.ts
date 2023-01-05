import type { NextApiResponse } from 'next'
import { isString } from './type_guard'

const endpointErrMessage = `Endpoint of CKB Explorer Node is not set`

const RESILLIENT_TIME = 900_000 // 15 min

export const handleCKBExplorerCheck = async (endpoint: string, res: NextApiResponse) => {
  if (isString(endpoint)) {
    try {
      const blockListRes = await fetch(endpoint + '/api/v1/blocks', {
        headers: {
          'content-type': 'application/vnd.api+json',
          accept: 'application/vnd.api+json',
        },
      }).then((r) => r.json())

      const block = blockListRes.data[0]?.attributes

      if (!block) {
        throw new Error('Failed to fetch block')
      }

      const systemTime = Date.now()
      const status = { block, systemTime }

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
