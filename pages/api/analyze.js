import { createClient } from '@supabase/supabase-js'
import { checkAndUpdateUsage, incrementUsage } from '../../lib/usage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

const PROMPT = 'You are an expert conversion rate optimization (CRO) specialist and landing page analyst. Analyze this landing page thoroughly and critically. IMPORTANT: Give HONEST, VARIED scores based on what you actually see. A poor landing page should score 20-45. An average landing page should score 45-65. A good landing page should score 65-80. An exceptional landing page should score 80-95. Scores should DIFFER from each other based on actual strengths/weaknesses. Respond ONLY with valid JSON in this exact structure: {"scores":{"overall":72,"headline":68,"cta":75,"trust":65,"clarity":78},"summary":"A 2-3 sentence honest assessment of this landing page conversion potential.","firstimpression":[{"severity":"error","text":"What immediately hurts conversions"},{"severity":"warning","text":"What could be improved"},{"severity":"pass","text":"What is working well"}],"cta_analysis":[{"severity":"error","text":"CTA problem"},{"severity":"pass","text":"CTA strength"}],"trust_signals":[{"severity":"warning","text":"Missing trust element"},{"severity":"pass","text":"Good trust signal found"}],"copy_analysis":[{"severity":"error","text":"Copy problem that hurts conversions"},{"severity":"pass","text":"Copy strength"}],"improvements":[{"priority":"high","text":"Most important change to make right now"},{"priority":"medium","text":"Second most important change"},{"priority":"low","text":"Nice to have improvement"}],"above_fold":{"rating":75,"headline_score":70,"subheadline_score":65,"visual_score":80,"notes":"Brief assessment of what visitors see in the first 5 seconds"},"colors":[{"hex":"#1a1a2e","role":"Background"},{"hex":"#3d5af1","role":"Primary CTA"},{"hex":"#f0f0f0","role":"Text"},{"hex":"#22d3ee","role":"Accent"},{"hex":"#e879f9","role":"Highlight"}],"quick_wins":[{"label":"Headline Clarity","score":70},{"label":"CTA Visibility","score":65},{"label":"Social Proof","score":55},{"label":"Value Proposition","score":75},{"label":"Mobile Experience","score":68}]} Scores are 0-100. Severity: error, warning, pass. Priority: high, medium, low. Be specific and actionable.'

async function takeScreenshot(url) {
  try {
    var wpUrl = 'https://s.wordpress.com/mshots/v1/' + encodeURIComponent(url) + '?w=1280&h=960'
    var res = await fetch(wpUrl)
    if (res.ok) {
      var buffer = await res.arrayBuffer()
      var base64 = Buffer.from(buffer).toString('base64')
      if (base64.length > 50000) return { base64: base64, mediaType: 'image/png' }
    }
  } catch (e) {
    console.error('WordPress mshots failed:', e.message)
  }

  try {
    var bUrl = 'https://chrome.browserless.io/screenshot?token=' + process.env.BROWSERLESS_KEY
    var res2 = await fetch(bUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url,
        options: { fullPage: false, type: 'jpeg', quality: 80 },
        viewport: { width: 1280, height: 960 },
        gotoOptions: { waitUntil: 'networkidle2', timeout: 15000 }
      })
    })
    if (res2.ok) {
      var buffer2 = await res2.arrayBuffer()
      var base642 = Buffer.from(buffer2).toString('base64')
      if (base642.length > 1000) return { base64: base642, mediaType: 'image/jpeg' }
    }
  } catch (e2) {
    console.error('Browserless failed:', e2.message)
  }

  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  var token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null
  if (!token) return res.status(401).json({ error: 'Unauthorized. Please log in.' })

  var authResult = await supabase.auth.getUser(token)
  var user = authResult.data ? authResult.data.user : null
  var authError = authResult.error
  if (authError || !user) return res.status(401).json({ error: 'Invalid session. Please log in again.' })

  var usage = await checkAndUpdateUsage(user.id)
  if (!usage.allowed) {
    return res.status(403).json({ error: 'limit_reached', message: 'You have used all 3 free analyses this month. Upgrade to Pro for unlimited!', upgrade: true })
  }

  var type = req.body.type
  var imageBase64 = req.body.imageBase64
  var mediaType = req.body.mediaType
  var url = req.body.url

  try {
    var userContent = []

    if (type === 'image' && imageBase64) {
      userContent = [
        { type: 'image_url', image_url: { url: 'data:' + (mediaType || 'image/png') + ';base64,' + imageBase64 } },
        { type: 'text', text: PROMPT }
      ]
    } else if (type === 'url' && url) {
      var screenshot = await takeScreenshot(url)

      if (screenshot) {
        userContent = [
          { type: 'image_url', image_url: { url: 'data:' + screenshot.mediaType + ';base64,' + screenshot.base64 } },
          { type: 'text', text: 'Landing page URL: ' + url + ' ' + PROMPT }
        ]
      } else {
        userContent = [{ type: 'text', text: 'Analyze this landing page: ' + url + ' ' + PROMPT }]
      }
    } else {
      return res.status(400).json({ error: 'Invalid request.' })
    }

    var groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 2000,
        temperature: 0.4,
        messages: [{ role: 'user', content: userContent }]
      })
    })

    var groqData = await groqRes.json()
    if (!groqRes.ok) throw new Error(groqData.error ? groqData.error.message : 'Groq error')

    var text = groqData.choices && groqData.choices[0] && groqData.choices[0].message ? groqData.choices[0].message.content : ''

    var parsed = null
    try {
      var jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text.trim())
    } catch (parseErr) {
      return res.status(500).json({ error: 'Could not parse AI response' })
    }

    await incrementUsage(user.id)

    return res.status(200).json(parsed)

  } catch (err) {
    console.error('Analysis error:', err)
    return res.status(500).json({ error: err.message || 'Analysis failed' })
  }
}
