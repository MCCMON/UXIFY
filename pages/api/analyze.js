import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

const PROMPT = `You are an expert conversion rate optimization (CRO) specialist and landing page analyst. Analyze this landing page thoroughly and critically.

IMPORTANT: Give HONEST, VARIED scores based on what you actually see.
- A poor landing page should score 20-45
- An average landing page should score 45-65
- A good landing page should score 65-80
- An exceptional landing page should score 80-95
- Scores should DIFFER from each other based on actual strengths/weaknesses

Respond ONLY with valid JSON in this exact structure:
\`\`\`json
{
  "scores": { "overall": 72, "headline": 68, "cta": 75, "trust": 65, "clarity": 78 },
  "summary": "A 2-3 sentence honest assessment of this landing page's conversion potential.",
  "firstimpression": [
    {"severity": "error", "text": "What immediately hurts conversions"},
    {"severity": "warning", "text": "What could be improved"},
    {"severity": "pass", "text": "What is working well"}
  ],
  "cta_analysis": [
    {"severity": "error", "text": "CTA problem"},
    {"severity": "pass", "text": "CTA strength"}
  ],
  "trust_signals": [
    {"severity": "warning", "text": "Missing trust element"},
    {"severity": "pass", "text": "Good trust signal found"}
  ],
  "copy_analysis": [
    {"severity": "error", "text": "Copy problem that hurts conversions"},
    {"severity": "pass", "text": "Copy strength"}
  ],
  "improvements": [
    {"priority": "high", "text": "Most important change to make right now"},
    {"priority": "medium", "text": "Second most important change"},
    {"priority": "low", "text": "Nice to have improvement"}
  ],
  "above_fold": {
    "rating": 75, "headline_score": 70, "subheadline_score": 65, "visual_score": 80,
    "notes": "Brief assessment of what visitors see in the first 5 seconds"
  },
  "colors": [
    {"hex": "#1a1a2e", "role": "Background"},
    {"hex": "#3d5af1", "role": "Primary CTA"},
    {"hex": "#f0f0f0", "role": "Text"},
    {"hex": "#22d3ee", "role": "Accent"},
    {"hex": "#e879f9", "role": "Highlight"}
  ],
  "quick_wins": [
    {"label": "Headline Clarity", "score": 70},
    {"label": "CTA Visibility", "score": 65},
    {"label": "Social Proof", "score": 55},
    {"label": "Value Proposition", "score": 75},
    {"label": "Mobile Experience", "score": 68}
  ]
}
\`\`\`
Scores are 0-100. Severity: "error", "warning", "pass". Priority: "high", "medium", "low". Be specific and actionable.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized. Please log in.' })

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid session. Please log in again.' })

  const { type, imageBase64, mediaType, url } = req.body

  try {
    let userContent = []

    if (type === 'image' && imageBase64) {
      userContent = [
        { type: 'image_url', image_url: { url: `data:${mediaType || 'image/png'};base64,${imageBase64}` } },
        { type: 'text', text: PROMPT }
      ]
    } else if (type === 'url' && url) {
      let screenshotBase64 = null
      try {
        const imgRes = await fetch(`https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1280&h=960`)
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer()
          screenshotBase64 = Buffer.from(buffer).toString('base64')
        }
      } catch (e) {}

      if (screenshotBase64) {
        userContent = [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshotBase64}` } },
          { type: 'text', text: `Landing page URL: ${url}\n\n${PROMPT}` }
        ]
      } else {
        userContent = [{ type: 'text', text: `Analyze landing page: ${url}\n\n${PROMPT}` }]
      }
    } else {
      return res.status(400).json({ error: 'Invalid request.' })
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 2000,
        temperature: 0.4,
        messages: [{ role: 'user', content: userContent }]
      })
    })

    const groqData = await groqRes.json()
    if (!groqRes.ok) throw new Error(groqData.error?.message || `Groq error ${groqRes.status}`)

    const text = groqData.choices?.[0]?.message?.content || ''

    let parsed = null
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text.trim())
    } catch {
      return res.status(500).json({ error: 'Could not parse AI response' })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Analysis error:', err)
    return res.status(500).json({ error: err.message || 'Analysis failed' })
  }
}
