# Student Assistant - System Architecture

## Overview
A comprehensive student assistant platform with Telegram bot integration, AI-powered file management, and modern web interface.

## System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TELEGRAM BOT                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐ │
│  │  User sends     │───▶│  Gemini AI      │───▶│  Extract metadata       │ │
│  │  file           │    │  (file name)    │    │  (subject, semester)    │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────┘ │
│           │                                               │                 │
│           ▼                                               ▼                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SUPABASE STORAGE + DATABASE                      │   │
│  │  ┌──────────────┐        ┌──────────────────────────────────────┐  │   │
│  │  │  File stored │        │  Metadata saved (title, subject, etc)│  │   │
│  │  │  in bucket   │        │  to 'files' table                   │  │   │
│  │  └──────────────┘        └──────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS FRONTEND                                │
│                                                                             │
│  ┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│  │   Chat Page     │     │  File Manager    │     │   File Search    │   │
│  │                 │     │                  │     │                  │   │
│  │  /api/chat ─────┼────▶│  /api/files ─────┼────▶│  /api/search     │   │
│  │  (Gemini AI)    │     │  (Supabase)      │     │  (AI + DB)       │   │
│  └─────────────────┘     └──────────────────┘     └──────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Integration

### 1. Telegram Bot → Supabase
**File:** `@/src/infrastructure/telegram/file-bot.ts`

| Feature | Implementation |
|---------|---------------|
| File Upload | Downloads from Telegram → Supabase Storage |
| AI Extraction | Gemini Flash 1.5 analyzes file name |
| Metadata Save | Stores in Supabase database via FileUseCases |

**Commands:**
- `/upload` - Start upload with AI extraction
- `/search <query>` - Natural language file search
- `/files` - Link to web app

### 2. Next.js API Routes
**Files:** `@/src/app/api/*/route.ts`

| Route | Purpose | Connects To |
|-------|---------|-------------|
| `/api/chat` | AI chat endpoint | Gemini Flash 1.5 |
| `/api/search` | File search (NL + filters) | Supabase + Query Parser |
| `/api/upload` | File metadata upload | Supabase |
| `/api/files` | CRUD operations | Supabase |
| `/api/telegram/webhook` | Bot webhook handler | Telegram API |

### 3. Frontend Components
**Files:** `@/src/components/features/*`

| Component | API Used | Purpose |
|-----------|----------|---------|
| `ChatInterface` | `/api/chat` | AI student assistant chat |
| `FileManager` | `/api/files` | Display and filter files |
| `FileSearch` | `/api/search` | Natural language search |

### 4. AI Integration
**File:** `@/src/lib/services/gemini*.ts`

| Service | Usage |
|---------|-------|
| `generateAIResponse()` | Chat responses in `/api/chat` |
| `extractFileMetadata()` | File name analysis in Telegram bot |
| `parseNaturalLanguageQuery()` | Search query parsing |

## Data Flow Examples

### File Upload Flow
```
User (Telegram)
    │
    ▼
Telegram Bot receives file
    │
    ▼
Download file from Telegram
    │
    ▼
Upload to Supabase Storage
    │
    ▼
Gemini AI extracts metadata from file name
    │
    ▼
Save metadata to Supabase Database
    │
    ▼
Return confirmation to user
```

### Chat Flow
```
User (Web)
    │
    ▼
ChatInterface sends message
    │
    ▼
POST /api/chat
    │
    ▼
Gemini Flash 1.5 generates response
    │
    ▼
Return AI response to frontend
    │
    ▼
Display in chat interface
```

### File Search Flow
```
User (Web) types "database sheets semester 2"
    │
    ▼
GET /api/search?q=...
    │
    ▼
Query Parser extracts filters
    │
    ▼
Supabase search with filters
    │
    ▼
Return results to FileManager
    │
    ▼
Display file cards
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=

# Gemini AI
GEMINI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Schema

```sql
table files {
  id: uuid (primary key)
  title: string
  subject: string (optional)
  semester: number (optional)
  type: string (optional)
  file_url: string
  created_at: timestamp
}

table students {
  id: uuid
  telegram_id: string
  email: string
  full_name: string
  student_id: string
}

table assignments {
  id: uuid
  student_id: uuid (foreign key)
  title: string
  description: string
  due_date: timestamp
  status: enum
  priority: enum
}
```

## API Usage Examples

### Chat
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain photosynthesis"}'
```

### Upload (from Telegram bot)
```typescript
const metadata = await extractFileMetadata("DB_Semester2_CheatSheet.pdf");
// Returns: { subject: "database", semester: 2, type: "sheet" }

await fileUseCases.uploadFileMetadata({
  title: "DB_Semester2_CheatSheet.pdf",
  ...metadata,
  fileUrl: "https://storage.../file.pdf"
});
```

### Search
```bash
# Natural language
curl "http://localhost:3000/api/search?q=database%20sheets%20semester%202"

# Structured filters
curl "http://localhost:3000/api/search?subject=database&semester=2"
```

## Clean Architecture Layers

```
Presentation Layer (UI Components)
    │
    ▼
API Routes (Next.js handlers)
    │
    ▼
Use Cases (Business Logic)
    │
    ▼
Repositories (Data Access)
    │
    ▼
Infrastructure (Supabase, Gemini, Telegram)
```

All components are now fully integrated and operational!
