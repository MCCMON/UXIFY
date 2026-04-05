import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const FREE_LIMIT = 3

export async function checkAndUpdateUsage(userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, analysis_count, lifetime_access')
    .eq('id', userId)
    .single()

  if (!profile) {
    await supabase.from('profiles').insert({ id: userId, plan: 'free', analysis_count: 0 })
    return { allowed: true, remaining: FREE_LIMIT, plan: 'free' }
  }

  if (profile.plan === 'pro' || profile.lifetime_access) {
    return { allowed: true, remaining: 999, plan: 'pro' }
  }

  if (profile.analysis_count >= FREE_LIMIT) {
    return { allowed: false, remaining: 0, plan: 'free' }
  }

  return { allowed: true, remaining: FREE_LIMIT - profile.analysis_count, plan: 'free' }
}

export async function incrementUsage(userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('analysis_count')
    .eq('id', userId)
    .single()

  var newCount = (profile ? profile.analysis_count : 0) + 1

  await supabase
    .from('profiles')
    .update({ analysis_count: newCount })
    .eq('id', userId)
}
