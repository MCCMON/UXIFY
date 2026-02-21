import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
  "scores": {
    "overall": 82,
    "accessibility": 74,
    "design": 88,
    "ux": 79
  },
  "summary": "A 2-3 sentence overall assessment of the UI design quality, strengths, and areas for improvement.",
  "accessibility": [
    {"severity": "error", "text": "Description of accessibility issue"},
    {"severity": "warning", "text": "Description of warning"},
    {"severity": "pass", "text": "Something done well"}
  ],
  "ux": [
    {"severity": "warning", "text": "UX recommendation or issue"},
    {"severity": "pass", "text": "Good UX pattern observed"}
  ],
  "design": [
    {"severity": "info", "text": "Design observation or tip"},
    {"severity": "pass", "text": "Design strength"}
  ],
  "typography": {
    "rating": 75,
    "hierarchy": 80,
    "readability": 70,
    "consistency": 78,
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

Be specific and actionable. Scores are 0-100. Severity values: "error", "warning", "pass", "info".`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Auth check - verify user is logged in via Supabase
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid session. Please log in again.' })
  }

  const { type, imageBase64, mediaType, url } = req.body

  try {
    let messages

    if (type === 'image' && imageBase64) {
      messages = [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/png', data: imageBase64 } },
          { type: 'text', text: PROMPT }
        ]
      }]
    } else if (type === 'url' && url) {
      // Fetch screenshot server-side (avoids CORS issues)
      const screenshotUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1280&h=960`
      let screenshotBase64 = null
      let screenshotMediaType = 'image/png'

      try {
        const fetch = (await import('node-fetch')).default
        const imgRes = await fetch(screenshotUrl, { timeout: 15000 })
        if (imgRes.ok) {
          const buffer = await imgRes.buffer()
          screenshotMediaType = imgRes.headers.get('content-type') || 'image/png'
          screenshotBase64 = buffer.toString('base64')
        }
      } catch (e) {
        console.log('Screenshot fetch failed, falling back to text:', e.message)
      }

      if (screenshotBase64) {
        messages = [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: screenshotMediaType, data: screenshotBase64 } },
            { type: 'text', text: `This is a screenshot of: ${url}\n\n${PROMPT}` }
          ]
        }]
      } else {
        messages = [{
          role: 'user',
          content: `Analyze the UI/UX design of this website: ${url}.\n\n${PROMPT}`
        }]
      }
    } else {
      return res.status(400).json({ error: 'Invalid request. Provide image or url.' })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages
    })

    const text = response.content.map(c => c.text || '').join('')

    // Parse JSON from response
    let parsed = null
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text.trim())
    } catch {
      return res.status(500).json({ error: 'Could not parse AI response', raw: text.slice(0, 300) })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Analysis error:', err)
    return res.status(500).json({ error: err.message || 'Analysis failed' })
  }
}
