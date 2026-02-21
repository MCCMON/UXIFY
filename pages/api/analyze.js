import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

const PROMPT = `You are an expert UI/UX designer and accessibility analyst. Analyze this UI design thoroughly.

Respond ONLY with valid JSON in this exact structure:
\`\`\`json
{
  "scores": { "overall": 82, "accessibility": 74, "design": 88, "ux": 79 },
  "summary": "A 2-3 sentence overall assessment.",
  "accessibility": [
    {"severity": "error", "text": "Issue description"},
    {"severity": "warning", "text": "Warning description"},
    {"severity": "pass", "text": "Something done well"}
  ],
  "ux": [
    {"severity": "warning", "text": "UX issue"},
    {"severity": "pass", "text": "Good UX pattern"}
  ],
  "design": [
    {"severity": "info", "text": "Design observation"},
    {"severity": "pass", "text": "Design strength"}
  ],
  "typography": {
    "rating": 75, "hierarchy": 80, "readability": 70, "consistency": 78,
    "notes": "Brief typography assessment"
  },
  "colors": [
    {"hex": "#1a1a2e", "role": "Background"},
    {"hex": "#3d5af1", "role": "Primary"},
    {"hex": "#f0f0f0", "role": "Text"},
    {"hex": "#22d3ee", "role": "Accent"},
    {"hex": "#e879f9", "role": "Secondary"}
  ],
  "recommendations": [
    {"label": "Visual Hierarchy", "score": 80},
    {"label": "Color Contrast", "score": 65},
    {"label": "Spacing & Layout", "score": 85},
    {"label": "Interactive Elements", "score": 72},
    {"label": "Mobile Responsiveness", "score": 68}
  ]
}
\`\`\`
Scores are 0-100. Severity: "error", "warning", "pass", "info". Be specific and detailed.`

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
          { type: 'text', text: `Screenshot of: ${url}\n\n${PROMPT}` }
        ]
      } else {
        userContent = [{ type: 'text', text: `Analyze UI of: ${url}\n\n${PROMPT}` }]
      }
    } else {
      return res.status(400).json({ error: 'Invalid request.' })
    }

    // Groq API - FREE, fast, vision support
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
