# 🔍 UXIFY — AI UI Analyser SaaS

Analyse any UI design with Claude Vision AI. Customers log in, you control the API key.

---

## 🚀 Deploy in 10 minutes (Free)

### Step 1 — Set up Supabase (auth/database)

1. Go to **[supabase.com](https://supabase.com)** → Create free account
2. Click **"New Project"** → name it `uxify` → set a password → Create
3. Wait ~2 minutes for it to spin up
4. Go to **Settings → API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Go to **Authentication → Settings** → make sure "Enable Email Signups" is ON ✅

---

### Step 2 — Deploy to Vercel

1. Push this folder to a **GitHub repo** (just drag & drop on github.com)
2. Go to **[vercel.com](https://vercel.com)** → Sign up free → **"Add New Project"**
3. Import your GitHub repo
4. Under **"Environment Variables"** add these 3 variables:

```
ANTHROPIC_API_KEY        = sk-ant-your-key-here
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
```

5. Click **Deploy** → Done! 🎉

Your app is live at `https://uxify-yourname.vercel.app`

---

### Step 3 — Get your Anthropic API Key

1. Go to **[console.anthropic.com](https://console.anthropic.com)**
2. Sign up → Go to **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-...`)
4. Paste it as `ANTHROPIC_API_KEY` in your Vercel environment variables

---

## 🔐 How security works

```
Customer browser  →  /api/analyze (Vercel serverless)  →  Anthropic API
                         ↑
                  Your API key lives HERE only
                  Customers NEVER see it
```

- Customers must be **logged in** to use the analyser
- Every request is verified server-side via Supabase JWT
- Your Anthropic key is a **server-only environment variable**

---

## 📁 Project structure

```
uxify/
├── pages/
│   ├── index.js          # Main entry — handles auth routing
│   └── api/
│       └── analyze.js    # 🔐 Secret API proxy (key lives here)
├── components/
│   ├── AuthPage.js       # Login / Signup UI
│   └── AppMain.js        # Main analyser UI
├── lib/
│   └── supabase.js       # Supabase client
├── styles/
│   └── globals.css
├── .env.local.example    # Copy to .env.local for local dev
└── package.json
```

---

## 💻 Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your keys
cp .env.local.example .env.local

# 3. Run locally
npm run dev

# Open http://localhost:3000
```

---

## 💰 Costs

| Service | Cost |
|---------|------|
| Vercel hosting | Free |
| Supabase auth | Free (up to 50,000 users) |
| Anthropic API | ~$0.005 per analysis |
| Screenshot API | Free (WordPress mShots) |

**You only pay Anthropic per analysis — no monthly fees.**

---

Built with ❤️ · UXIFY © 2026
