import type { IncomingMessage, ServerResponse } from 'http'

const SUPABASE_URL = 'https://lltuofjbxvhsrmndwolm.supabase.co'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'API key not configured' }))
    return
  }

  // Read request body
  const body = await new Promise<string>((resolve) => {
    let data = ''
    req.on('data', (chunk: Buffer) => { data += chunk.toString() })
    req.on('end', () => resolve(data))
  })

  let parsed: { vertical: string; goal: string; searchIntent: string; url: string }
  try {
    parsed = JSON.parse(body)
  } catch {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'Invalid JSON' }))
    return
  }

  const { vertical, goal, searchIntent, url } = parsed
  if (!vertical || !goal || !url) {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'Missing required fields' }))
    return
  }

  const prompt = `You are an expert in AI search optimisation. A user has submitted their website for an audit focused specifically on AI search crawlability and discoverability — how well their site performs when AI assistants like ChatGPT, Perplexity, Claude, and Gemini are answering questions about their services.

Business type: ${vertical}
Their goal: ${goal}
What they want clients to find when searching: ${searchIntent || 'not specified'}
Their website URL: ${url}

Analyse the website content provided and produce a structured AI search readiness audit. Focus ONLY on AI search readiness.

Grade each of the following 5 sections from A to F:

1. Question-Answer Coverage — Does the site directly answer the questions a prospect would ask an AI assistant? Are services, pricing, location, and differentiators stated as clear, extractable facts?

2. Content Specificity — Is the language concrete and specific enough for AI to extract and cite? Or is it vague, jargon-heavy, or written in a way that AI would skip over?

3. Structured Data & Schema — Is there schema markup present? LocalBusiness, FAQPage, Service schema? NOTE: The JSON-LD schema data extracted from the page is included below — analyse it directly.

4. FAQ & Direct Answer Blocks — Does the site contain explicit FAQ sections or Q&A content that AI can lift verbatim?

5. Trust & Authority Signals — Does the site include credentials, qualifications, client results, reviews, or regulatory body memberships that AI uses to assess trustworthiness?

Return ONLY a JSON object, no markdown, no preamble:
{
  "overall_grade": "B+",
  "overall_summary": "Short one-line verdict (max 8 words)",
  "executive_summary": "2-3 sentence plain English summary. Write for a business owner, not a developer.",
  "sections": [
    {
      "name": "Section name",
      "grade": "B",
      "analysis": "2-3 sentences of specific analysis referencing actual content or absence of content on the site.",
      "findings": [
        { "type": "pass", "text": "Specific thing that is working" },
        { "type": "issue", "text": "Specific problem found" },
        { "type": "warning", "text": "Something that needs attention" }
      ]
    }
  ]
}

Finding types: pass = working well, issue = clear problem, warning = needs attention. 2-4 findings per section. Be specific.`

  try {
    // Step 1: Crawl the site via Supabase Edge Function (multi-page, extracts JSON-LD)
    let siteContent = ''
    let schemaBlocks: string[] = []

    try {
      const crawlRes = await fetch(`${SUPABASE_URL}/functions/v1/crawl-site`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const crawlData = await crawlRes.json()
      if (crawlData.error) {
        console.error('Crawl error:', crawlData.error)
      }
      siteContent = crawlData.content || ''
      schemaBlocks = crawlData.schema || []
    } catch (err) {
      console.error('Crawl step error:', err)
    }

    // Content validation — need enough text to produce a meaningful audit
    if (siteContent.length < 500) {
      res.statusCode = 422
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        error: "We couldn't read enough of your site to audit it accurately. This can happen if the site blocks automated requests, is behind a login, or relies heavily on JavaScript to render content. Try a different page URL or check that the site is publicly accessible."
      }))
      return
    }

    // Build content payload with schema
    let contentForAudit = `Page text content:\n${siteContent}`
    if (schemaBlocks.length > 0) {
      contentForAudit += `\n\nJSON-LD Schema found on site (${schemaBlocks.length} block${schemaBlocks.length > 1 ? 's' : ''}):\n${schemaBlocks.join('\n\n')}`
    } else {
      contentForAudit += '\n\nJSON-LD Schema: None found on the site.'
    }

    // Step 2: Run the audit
    const auditRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: `${prompt}\n\n${contentForAudit}` }],
      }),
    })

    if (!auditRes.ok) {
      const errText = await auditRes.text()
      throw new Error(`Claude API returned ${auditRes.status}: ${errText}`)
    }

    const auditData = await auditRes.json()
    const raw = auditData.content
      ?.filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('') || ''

    if (!raw) {
      throw new Error(`No text in Claude response. Stop reason: ${auditData.stop_reason}. Content types: ${auditData.content?.map((b: { type: string }) => b.type).join(', ')}`)
    }

    const clean = raw.replace(/```json|```/g, '').trim()
    const report = JSON.parse(clean)

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(report))
  } catch (err) {
    console.error('Audit error:', err)
    res.statusCode = 500
    res.end(JSON.stringify({ error: `Audit failed: ${err instanceof Error ? err.message : String(err)}` }))
  }
}
