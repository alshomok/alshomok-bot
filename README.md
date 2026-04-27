# Student Assistant Platform

A modern student assistant platform with AI-powered chat, file management, and Telegram bot integration.

## Features

- 🤖 **AI Chat Assistant** - Powered by Google Gemini Flash 1.5
- 📁 **File Management** - Upload, search, and organize study materials
- 🤖 **Telegram Bot** - Upload files via Telegram with AI metadata extraction
- 🔍 **Smart Search** - Natural language file search
- 🎨 **Modern UI** - Dark mode, responsive design
- 🔐 **Clean Architecture** - Domain-driven design with proper separation of concerns

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Storage)
- **AI**: Google Gemini Flash 1.5
- **Bot**: Telegram Bot API (Telegraf)
- **Architecture**: Clean Architecture / Domain-Driven Design

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Telegram Bot Token
- Google Gemini API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ahmedgr047-code/alshomok-bot.git
cd student-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Set up Supabase:
   - Create a new project
   - Run the SQL schema (see `docs/database-schema.sql`)
   - Create a storage bucket named `files`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Yes |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook secret | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL (http://localhost:3000) | Yes |

## Project Structure

```
student-assistant/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── files/          # File manager page
│   │   └── page.tsx        # Chat page (home)
│   ├── components/
│   │   ├── features/       # Feature components
│   │   │   ├── chat/       # Chat interface
│   │   │   └── files/      # File manager
│   │   ├── layouts/        # Layout components
│   │   └── ui/             # UI components
│   ├── domain/             # Domain layer (Clean Architecture)
│   │   ├── entities/       # Business entities
│   │   ├── repositories/   # Repository interfaces
│   │   └── use-cases/      # Business logic
│   ├── infrastructure/      # Infrastructure layer
│   │   ├── supabase/       # Supabase clients
│   │   ├── telegram/       # Telegram bot
│   │   └── database/       # Repository implementations
│   ├── lib/                # Utilities
│   │   ├── config/         # Environment config
│   │   ├── services/       # External services (Gemini)
│   │   └── utils/          # Helper functions
│   └── shared/             # Shared constants and types
├── .env.example            # Environment template
├── package.json
└── README.md
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chat` | POST | AI chat with Gemini |
| `/api/search` | GET/POST | Search files |
| `/api/upload` | POST/PATCH | Upload file metadata |
| `/api/files` | GET/POST | List/create files |
| `/api/files/[id]` | GET/PATCH/DELETE | File operations |
| `/api/telegram/webhook` | POST | Telegram bot webhook |

## Telegram Bot

### Commands

- `/start` - Welcome message
- `/upload` - Upload a file (AI extracts metadata)
- `/search <query>` - Search files
- `/files` - Link to web app
- `/cancel` - Cancel current operation
- `/help` - Show help

### Setup

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Copy the token to `.env.local`
3. Set webhook (production):
```bash
curl -F "url=https://your-app.com/api/telegram/webhook" \
  https://api.telegram.org/bot<TOKEN>/setWebhook
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Google Gemini](https://ai.google.dev/)
- [Telegraf](https://telegraf.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
