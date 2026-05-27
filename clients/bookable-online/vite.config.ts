import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import type { Plugin } from 'vite'

function devApiProxy(): Plugin {
  return {
    name: 'dev-api-proxy',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '')
      const apiKey = env.ANTHROPIC_API_KEY
      console.log('[dev-api-proxy] Key loaded:', apiKey ? `yes (${apiKey.length} chars, starts ${apiKey.substring(0, 10)})` : 'MISSING')

      server.middlewares.use('/api/ai-search-audit', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        if (!apiKey) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not found in .env' }))
        }

        const body = await new Promise<string>((resolve) => {
          let data = ''
          req.on('data', (chunk: Buffer) => { data += chunk.toString() })
          req.on('end', () => resolve(data))
        })

        let parsed: { vertical: string; goal: string; searchIntent?: string; url: string }
        try {
          parsed = JSON.parse(body)
        } catch {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'Invalid JSON body' }))
        }

        const { vertical, goal, searchIntent, url } = parsed

        const prompt = `You are an expert in AI search optimisation. A user has submitted their website for an audit focused specifically on AI search crawlability and discoverability — how well their site performs when AI assistants like ChatGPT, Perplexity, Claude, and Gemini are answering questions about their services.

Business type: ${vertical}
Their goal: ${goal}
What they want clients to find when searching: ${searchIntent || 'not specified'}
Their website URL: ${url}

Analyse the website content provided and produce a structured AI search readiness audit. Focus ONLY on AI search readiness.

Grade each of the following 5 sections from A to F:

1. Question-Answer Coverage
2. Content Specificity
3. Structured Data & Schema
4. FAQ & Direct Answer Blocks
5. Trust & Authority Signals

Return ONLY a JSON object, no markdown, no preamble:
{
  "overall_grade": "B+",
  "overall_summary": "Short one-line verdict (max 8 words)",
  "executive_summary": "2-3 sentence plain English summary.",
  "sections": [
    {
      "name": "Section name",
      "grade": "B",
      "analysis": "2-3 sentences of specific analysis.",
      "findings": [
        { "type": "pass", "text": "Specific thing that is working" },
        { "type": "issue", "text": "Specific problem found" },
        { "type": "warning", "text": "Something that needs attention" }
      ]
    }
  ]
}`

        const headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        }

        const supabaseUrl = env.VITE_SUPABASE_URL || 'https://lltuofjbxvhsrmndwolm.supabase.co'

        try {
          // Step 1: Crawl the site via Supabase Edge Function (dev fallback — production uses Puppeteer)
          let siteContent = ''
          let schemaBlocks: string[] = []
          try {
            const crawlRes = await fetch(`${supabaseUrl}/functions/v1/crawl-site`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url }),
            })
            const crawlData = await crawlRes.json() as { content?: string; schema?: string[]; error?: string }
            if (crawlData.error) console.error('[audit] crawl error:', crawlData.error)
            siteContent = crawlData.content || ''
            schemaBlocks = crawlData.schema || []
          } catch (e) {
            console.error('[audit] crawl step error:', e)
          }

          // Content validation
          if (siteContent.length < 500) {
            res.statusCode = 422
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({
              error: "We couldn't read enough of your site to audit it accurately. This can happen if the site blocks automated requests, is behind a login, or relies heavily on JavaScript to render content. Try a different page URL or check that the site is publicly accessible."
            }))
          }

          // Build content payload with schema
          let contentForAudit = `Page text content:\n${siteContent}`
          if (schemaBlocks.length > 0) {
            contentForAudit += `\n\nJSON-LD Schema found on page (${schemaBlocks.length} block${schemaBlocks.length > 1 ? 's' : ''}):\n${schemaBlocks.join('\n\n')}`
          } else {
            contentForAudit += '\n\nJSON-LD Schema: None found on the page.'
          }

          // Step 2: Run audit
          const s2 = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 4096,
              messages: [{ role: 'user', content: `${prompt}\n\n${contentForAudit}` }],
            }),
          })

          if (!s2.ok) {
            const errText = await s2.text()
            throw new Error(`Claude API ${s2.status}: ${errText}`)
          }

          const d2 = await s2.json() as { content?: { type: string; text: string }[] }
          const raw = (d2.content || [])
            .filter((b: { type: string }) => b.type === 'text')
            .map((b: { text: string }) => b.text)
            .join('')
          if (!raw) throw new Error('No text in Claude response')

          const report = JSON.parse(raw.replace(/```json|```/g, '').trim())
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(report))
        } catch (err) {
          console.error('[audit] error:', err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: `Audit failed: ${err instanceof Error ? err.message : String(err)}` }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    devApiProxy(),
    vike(),
    react(),
  ],
  build: {
    // Don't try to unlink existing dist files — mount filesystem doesn't permit it
    emptyOutDir: false,
  },
})
