import { renderPage } from 'vike/server'
import type { IncomingMessage, ServerResponse } from 'http'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const pageContext = await renderPage({ urlOriginal: req.url ?? '/' })

  if (!pageContext.httpResponse) {
    res.statusCode = 404
    res.end('Not Found')
    return
  }

  const { body, statusCode, headers } = pageContext.httpResponse
  res.statusCode = statusCode
  headers.forEach(([name, value]) => res.setHeader(name, value))
  res.end(body)
}
