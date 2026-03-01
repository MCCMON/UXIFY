import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' })

  // Check if already signed up
  const { data: existing } = await supabase
    .from('early_access')
    .select('email')
    .eq('email', email)
    .single()

  if (existing) return res.status(200).json({ success: true, message: 'already_exists' })

  // Save email
  const { error } = await supabase
    .from('early_access')
    .insert([{ email, created_at: new Date().toISOString() }])

  if (error) {
    console.error('Supabase error:', error)
    return res.status(500).json({ error: 'Failed to save email' })
  }

  return res.status(200).json({ success: true, message: 'saved' })
}
