# QuickSmart 智能記帳

AI-powered expense tracking application built with Next.js 14, Supabase, and Claude AI.

## 🎯 Features

- **AI Natural Language Parsing** (US-001): Input expenses in natural language, AI automatically categorizes
- **Fallback Mechanism** (US-002): Rule-based parsing when AI is unavailable
- **Category Learning** (US-003): AI learns from user corrections
- **Subscription Management** (US-010): Track recurring subscriptions with auto-billing
- **Billing Reminders** (US-011): Automated reminders 3 days, 1 day, and day-of billing
- **Monthly Analytics** (US-014): Comprehensive spending insights
- **Multi-device Sync** (US-030): Real-time sync across devices

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: Zustand + React Query
- **UI Components**: Custom components with Framer Motion
- **Testing**: Vitest + Playwright

### Backend
- **Database**: Supabase (PostgreSQL 15)
- **Authentication**: Supabase Auth (Google OAuth + Email)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Edge Functions**: Supabase Edge Functions (Deno)

### AI
- **Model**: GPT-4o-mini (OpenAI)
- **Use Cases**: Natural language parsing, expense categorization

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Supabase account
- OpenAI API key
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd "C:\Users\User\Desktop\新增資料夾\智能記帳"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Your `.env.local` is already configured with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dckthwceyfngzpmyuybp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=your_openai_api_key_here
```

**⚠️ 重要：必須設置 OpenAI API Key**

在 `.env.local` 文件中將 `OPENAI_API_KEY` 替換為您的實際 API Key：

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxx
```

如何獲取 API Key:
1. 訪問 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登錄或註冊帳戶
3. 點擊 "Create new secret key"
4. 複製生成的 API Key
5. 貼到 `.env.local` 文件中

### 4. Database Setup

#### Option A: Using Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `dckthwceyfngzpmyuybp`
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `supabase/migrations/20250124000001_initial_schema.sql`
5. Click **Run** to execute the migration

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref dckthwceyfngzpmyuybp

# Run migrations
supabase db push
```

### 5. Verify Database Setup

After running the migration, verify that the following tables were created:

- `user_profiles`
- `expenses`
- `subscriptions`
- `ai_learning_samples`
- `notifications`
- `analytics_cache`

Check in: **Supabase Dashboard → Table Editor**

### 6. Enable Authentication

1. Go to **Authentication → Providers** in Supabase Dashboard
2. Enable **Email** provider
3. (Optional) Enable **Google** OAuth:
   - Add Google OAuth credentials
   - Configure redirect URLs: `http://localhost:3000/auth/callback`

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
智能記帳/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── expenses/         # Expense APIs
│   │   │   ├── subscriptions/    # Subscription APIs
│   │   │   └── analytics/        # Analytics APIs
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   ├── components/               # Shared components
│   │   └── providers.tsx         # React Query provider
│   ├── features/                 # Feature modules
│   │   ├── expenses/
│   │   │   └── components/
│   │   ├── subscriptions/
│   │   └── analytics/
│   ├── lib/                      # Utilities
│   │   ├── supabase/             # Supabase clients
│   │   └── ai/                   # AI services
│   ├── types/                    # TypeScript types
│   └── styles/                   # Global styles
├── supabase/
│   ├── migrations/               # Database migrations
│   └── functions/                # Edge functions
├── archite/                      # Architecture docs
├── docs/                         # Product docs
├── UI/                           # UI/UX specs
└── package.json
```

## 🔑 Key API Endpoints

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses/parse` | Parse natural language input |
| GET | `/api/expenses` | List expenses (paginated) |
| POST | `/api/expenses` | Create new expense |
| GET | `/api/expenses/[id]` | Get expense by ID |
| PATCH | `/api/expenses/[id]` | Update expense |
| DELETE | `/api/expenses/[id]` | Delete expense (soft) |

### Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions` | List subscriptions |
| POST | `/api/subscriptions` | Create subscription |
| PATCH | `/api/subscriptions/[id]` | Update subscription |
| DELETE | `/api/subscriptions/[id]` | Cancel subscription |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/monthly` | Get monthly statistics |

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔒 Security

- **Row Level Security (RLS)**: All database tables have RLS policies
- **Authentication**: Supabase Auth with secure session management
- **API Protection**: All API routes verify authentication
- **Environment Variables**: Sensitive keys stored in `.env.local` (gitignored)

## 🌐 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CLAUDE_API_KEY`
4. Deploy

### Edge Functions (Supabase)

```bash
# Deploy subscription billing check function
supabase functions deploy subscription-billing-check
```

## 📊 Database Schema

### Core Tables

**expenses**
- Stores all expense/income records
- Includes AI confidence and fallback status
- Soft delete support with `deleted_at`

**subscriptions**
- Recurring subscription tracking
- Automated billing reminders
- Status: ACTIVE, PAUSED, CANCELLED

**ai_learning_samples**
- User corrections for AI improvement
- Personal learning context per user

**user_profiles**
- Extended user information
- Notification preferences
- Telegram integration

## 🤖 AI Configuration

The AI parser uses GPT-4o-mini with:
- **Model**: gpt-4o-mini
- **Temperature**: 0.3 (deterministic)
- **Max Tokens**: 500
- **Response Format**: JSON object
- **Context**: User's last 10 corrections
- **Fallback**: Rule-based parser for offline mode

## 📚 Documentation

- [Backend Architecture](./archite/backend-archite-doc.md)
- [Frontend Architecture](./archite/frontend-archite-doc.md)
- [Product Requirements](./docs/PRD_SDD.md)
- [User Stories](./docs/user_story.md)
- [UI Specifications](./UI/README.md)

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check Supabase connection
supabase status

# Restart local Supabase
supabase stop
supabase start
```

### AI Parsing Not Working

1. Verify `OPENAI_API_KEY` is set correctly
2. Check API key permissions at [OpenAI Platform](https://platform.openai.com/api-keys)
3. Ensure you have sufficient credits in your OpenAI account
4. Fallback parser will activate automatically if AI fails

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Team

- **Product**: QuickSmart Team
- **Architecture**: Backend & Frontend Teams
- **UI/UX**: Design Team
- **AI Integration**: AI Team

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/quicksmart/issues)
- **Email**: support@quicksmart.app
- **Documentation**: [Project Wiki](./docs/)

---

**Version**: 1.0.0
**Last Updated**: 2025-01-24
**Status**: Development Ready ✅
