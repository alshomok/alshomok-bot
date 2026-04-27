# GitHub Secrets Setup Guide

This guide explains how to configure GitHub Secrets for CI/CD workflows.

## Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Supabase service role key (secret) |
| `GEMINI_API_KEY` | `AIzaSy...` | Google Gemini API key |
| `TELEGRAM_BOT_TOKEN` | `123456:ABC-DEF...` | Telegram bot token |
| `TELEGRAM_WEBHOOK_SECRET` | `your-webhook-secret` | Secret for webhook validation |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production app URL |

## Optional Secrets (for Vercel Deployment)

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VERCEL_TOKEN` | `vercel_token` | Vercel API token |
| `VERCEL_ORG_ID` | `org_id` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | `project_id` | Vercel project ID |

## How to Get These Values

### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Project Settings → API
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Google Gemini
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Copy key → `GEMINI_API_KEY`

### Telegram Bot
1. Message [@BotFather](https://t.me/botfather)
2. Send `/newbot` or select existing bot
3. Copy token → `TELEGRAM_BOT_TOKEN`
4. Choose a random string for webhook secret → `TELEGRAM_WEBHOOK_SECRET`

## Adding Secrets

### Method 1: GitHub Web Interface
1. Go to repository Settings
2. Click Secrets and variables → Actions
3. Click "New repository secret"
4. Add name and value
5. Click "Add secret"

### Method 2: GitHub CLI
```bash
gh auth login
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "https://your-project.supabase.co"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "your-anon-key"
# ... repeat for all secrets
```

## Testing

After adding secrets, push to main branch to trigger workflow:

```bash
git add .
git commit -m "Add GitHub Actions workflows"
git push origin main
```

Check Actions tab in GitHub to see workflow results.

## Local Development

For local development, use `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
TELEGRAM_BOT_TOKEN=your-telegram-token
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** `.env.local` is in `.gitignore` and won't be committed.
