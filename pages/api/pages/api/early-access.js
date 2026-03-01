import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side inserts - bypasses all RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' })

  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from('early_access')
      .select('email')
      .eq('email', email)
      .single()

    if (existing) return res.status(200).json({ success: true, message: 'already_exists' })

    // Insert email
    const { error } = await supabase
      .from('early_access')
      .insert([{ email, created_at: new Date().toISOString() }])

    if (error) throw error

    return res.status(200).json({ success: true, message: 'saved' })
  } catch (err) {
    console.error('Early access error:', err)
    return res.status(500).json({ error: err.message })
  }
}
