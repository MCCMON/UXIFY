import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

const FREE_LIMIT = 3

const PROMPT = `You are an expert CRO specialist. Analyze this landing page. Give HONEST scores 0-100. Respond ONLY with valid JSON: {"scores":{"overall":72,"headline":68,"cta":75,"trust":65,"clarity":78},"summary":"Assessment here","firstimpression":[{"severity":"error","text":"Issue"}],"cta_analysis":[{"severity":"pass","text":"Strength"}],"trust_signals":[{"severity":"warning","text":"Missing element"}],"copy_analysis":[{"severity":"error","text":"Problem"}],"improvements":[{"priority":"high","text":"Fix this"}],"above_fold":{"rating":75,"headline_score":70,"subheadline_score":65,"visual_score":80,"notes":"Notes"},"colors":[{"hex":"#1a1a2e","role":"Background"}],"quick_wins":[{"label":"Headline","score":70}]}`

async function takeScreenshot(url) {
  try {
    const wpUrl = 'https://s.wordpress.com/mshots/v1/' + encodeURIComponent(url) + '?w=1280&h=960'
    const res = await fetch(wpUrl)
    if (res.ok) {
      const buffer = await res.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      if (base64.length > 50000) return { base64, mediaType: 'image/png' }
    }
  } catch (e) { console.error('Screenshot failed:', e.message) }
  return null
}

function getNextResetDate() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
}

async function checkUsage(userId) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('plan, analysis_count, analysis_reset_date, lifetime_access')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    await supabaseAdmin.from('profiles').insert({
      id: userId,
      plan: 'free',
      analysis_count: 0,
      analysis_reset_date: getNextResetDate()
    })
    return { allowed: true, remaining: FREE_LIMIT, plan: 'free' }
  }

  if (profile.plan === 'pro' || profile.lifetime_access) {
    return { allowed: true, remaining: 'unlimited', plan: 'pro' }
  }

  const now = new Date()
  const resetDate = new Date(profile.analysis_reset_date)

  if (now >= resetDate) {
    await supabaseAdmin
      .from('profiles')
      .update({ analysis_count: 0, analysis_reset_date: getNextResetDate() })
      .eq('id', userId)
    return { allowed: true, remaining: FREE_LIMIT, plan: 'free' }
  }

  const remaining = FREE_LIMIT - profile.analysis_count
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, plan: 'free', resetDate: profile.analysis_reset_date }
  }
  return { allowed: true, remaining, plan: 'free' }
}

async function incrementUsage(userId) {
  await supabaseAdmin.rpc('increment_analysis_count', { user_id: userId })
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized. Please log in.' })

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid session. Please log in again.' })

  const usage = await checkUsage(user.id)

  if (!usage.allowed) {
    return res.status(403).json({
      error: 'limit_reached',
      message: 'You have used all 3 free analyses this month.',
      resetDate: usage.resetDate,
      upgrade: true
    })
  }

  const { type, imageBase64, mediaType, url } = req.body

  try {
    let userContent = []

    if (type === 'image' && imageBase64) {
      userContent = [
        { type: 'image_url', image_url: { url: 'data:' + (mediaType || 'image/png') + ';base64,' + imageBase64 } },
        { type: 'text', text: PROMPT }
      ]
    } else if (type === 'url' && url) {
      const screenshot = await takeScreenshot(url)

      if (screenshot) {
        userContent = [
          { type: 'image_url', image_url: { url: 'data:' + screenshot.mediaType + ';base64,' + screenshot.base64 } },
          { type: 'text', text: 'Landing page URL: ' + url + '\n\n' + PROMPT }
        ]
      } else {
        userContent = [{ type: 'text', text: 'Analyze this landing page: ' + url + '\n\n' + PROMPT }]
      }
    } else {
      return res.status(400).json({ error: 'Invalid request.' })
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

    const groqData = await groqRes.json()
    if (!groqRes.ok) throw new Error(groqData.error?.message || 'Groq error')

    const text = groqData.choices?.[0]?.message?.content || ''

    let parsed = null
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text.trim())
    } catch {
      return res.status(500).json({ error: 'Could not parse AI<span class="ml-2" /><span class="inline-block w-3 h-3 rounded-full bg-neutral-a12 align-middle mb-[0.1rem]" />
