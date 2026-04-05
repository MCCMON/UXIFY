import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Need this for admin access
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

const FREE_LIMIT = 3 // Free users get 3 analyses per month

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
    {"hex": "#3d5af<span class="ml-2" /><span class="inline-block w-3 h-3 rounded-full bg-neutral-a12 align-middle mb-[0.1rem]" />
