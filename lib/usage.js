import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const FREE_LIMIT = 3

export async function checkAndUpdateUsage(userId) {
  try {
    var result = await supabase
      .from('profiles')
      .select('plan, analysis_count, lifetime_access')
      .eq('id', userId)
      .single()

    var profile = result.data

    if (!profile) {
      await supabase.from('profiles').insert({ id: userId, plan: 'free', analysis_count: 0 })
      return { allowed: true, remaining: FREE_LIMIT, plan: 'free' }
    }

    if (profile.plan === 'pro' || profile.lifetime_access === true) {
      return { allowed: true, remaining: 999, plan: 'pro' }
    }

    var count = profile.analysis_count || 0

    if (count >= FREE_LIMIT) {
      return { allowed: false, remaining: 0, plan: 'free' }
    }

    return { allowed: true, remaining: FREE_LIMIT - count, plan: 'free' }
  } catch (err) {
    console.error('checkUsage error:', err)
    return { allowed: true, remaining: FREE_LIMIT, plan: 'free' }
  }
}

export async function incrementUsage(userId) {
  try {
    var result = await supabase
      .from('profiles')
      .select('analysis_count')
      .eq('id', userId)
      .single()

    var currentCount = result.data ? result.data.analysis_count || 0 : 0
    var newCount = currentCount + 1

    await supabase
      .from('profiles')
      .update({ analysis_count: newCount })
      .eq('id', userId)
  } catch (err) {
    console.error('incrementUsage error:', err)
  }
}
