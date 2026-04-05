import { createClient } from '@supabase/supabase-js'
import { checkAndUpdateUsage, incrementUsage } from '../../lib/usage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

var PROMPT = 'You are an expert conversion rate optimization specialist. Analyze this landing page. Give HONEST scores 0-100. Respond ONLY with valid JSON: {"scores":{"overall":72,"headline":68,"cta":75,"trust":65,"clarity":78},"summary":"Assessment here","firstimpression":[{"severity":"error","text":"Issue"}],"cta_analysis":[{"severity":"pass","text":"Strength"}],"trust_signals":[{"severity":"warning","text":"Missing element"}],"copy_analysis":[{"severity":"error","text":"Problem"}],"improvements":[{"priority":"high","text":"Fix this"}],"above_fold":{"rating":75,"headline_score":70,"subheadline_score":65,"visual_score":80,"notes":"Notes"},"colors":[{"hex":"#1a1a2e","role":"Background"}],"quick_wins":[{"label":"Headline","score":70}]}'

async function takeScreenshot(url) {
  try {
    var wpUrl = 'https://s.wordpress.com/mshots/v1/' + encodeURIComponent(url) + '?w=1280&h=960'
    var res = await fetch(wpUrl)
    if (res.ok) {
      var buffer = await res.arrayBuffer()
      var base64 = Buffer.from(buffer).toString('base64')
      if (base64.length > 50000) {
        return { base64: base64, mediaType: 'image/png' }
      }
    }
  } catch (e) {
    console.error('Screenshot failed:', e.message)
  }
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  var token = req.headers.authorization
  if (token) {
    token = token.replace('Bearer ', '')
  }
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  }

  var authResult = await supabase.auth.getUser(token)
  var user = authResult.data && authResult.data.user
  var authError = authResult.error

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid session. Please log in again.' })
  }

  var usage = await checkAndUpdateUsage(user.id)

  if (!usage.allowed) {
    return res.status(403).json({
      error: 'limit_reached',
      message: 'You have used all 3 free analyses this month. Upgrade to Pro for unlimited!',
      upgrade: true
    })
  }

  var type = req.body.type
  var imageBase64 = req.body.imageBase64
  var mediaType = req.body.mediaType
  var url = req.body.url

  try {
    var userContent = []

    if (type === 'image' && imageBase64) {
      var dataUrl = 'data:' + (mediaType || 'image/png') + ';base64,' + imageBase64
      userContent = [
        { type: 'image_url', image_url: { url: dataUrl } },
        { type: 'text', text: PROMPT }
      ]
    } else if (type === 'url' && url) {
      var screenshot = await takeScreenshot(url)

      if (screenshot) {
        var screenshotUrl = 'data:' + screenshot.mediaType + ';base64,' + screenshot.base64
        userContent = [
          { type: 'image_url', image_url: { url: screenshotUrl } },
          { type: 'text', text: 'Landing page URL: ' + url + ' ' + PROMPT }
        ]
      } else {
        userContent = [
          { type: 'text', text: 'Analyze this landing page: ' + url + ' ' + PROMPT }
        ]
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

    if (!groqRes.ok) {
      var errMsg = groqData.error ? groqData.error.message : 'Groq error'
      throw new Error(errMsg)
    }

    var text = ''
    if (groqData.choices && groqData.choices[0] && groqData.choices[0].message) {
      text = groqData.choices[0].message.content
    }

    var parsed = null
    try {
      var jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1])
      } else {
        parsed = JSON.parse(text.trim())
      }
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
