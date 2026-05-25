import { renderPage } from 'vike/server'

export default async function handler(request) {
  const url = new URL(request.url)
  const pageContext = await renderPage({ urlOriginal: url.pathname + url.search })

  if (!pageContext.httpResponse) {
    return new Response('Not Found', { status: 404 })
  }

  const { body, statusCode, headers } = pageContext.httpResponse
  const responseHeaders = new Headers()
  headers.forEach(([name, value]) => responseHeaders.set(name, value))
  return new Response(body, { status: statusCode, headers: responseHeaders })
}
