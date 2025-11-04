# Mekaniku - Workshop Management Platform

Platform manajemen bengkel dengan **Hono API** + **Next.js Dashboard**

## 🚀 Quick Start

```powershell
# 1. Install
pnpm install

# 2. Setup environment
Copy-Item .env.example .env
# Edit .env dengan database & Firebase credentials Anda

# 3. Setup database
pnpm migrate
pnpm seed

# 4. Run
pnpm dev
```

**Access:**
- API: http://localhost:3001
- Dashboard: http://localhost:3000

## 🐳 Docker

```powershell
pnpm docker:up      # Start semua services
pnpm docker:down    # Stop services
```

## 🔑 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@mekaniku.com | password123 | Admin |
| budi@workshop.com | password123 | Workshop |
| customer1@example.com | password123 | Customer |

## 📦 Commands

```powershell
pnpm dev           # Run API + Web
pnpm migrate       # Database migrations
pnpm seed          # Seed sample data
pnpm studio        # Prisma Studio
pnpm test          # Run tests
```

## ⚙️ Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/mekaniku"
JWT_SECRET="your-secret-min-32-chars"
REFRESH_SECRET="your-refresh-secret-min-32-chars"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-email@project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DB_URL="https://your-project.firebaseio.com"
```

## 🛠️ Tech Stack

- **Backend**: Hono, Prisma, PostgreSQL, Firebase
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Auth**: JWT + Refresh Tokens
- **DevOps**: Docker, pnpm workspace

## 📚 Fitur

- Multi-tenant workshop management
- Booking flow (Consultation → Booking → Payment → Review)
- Real-time chat (Firebase RTDB)
- SSE notifications
- Role-based access (Admin, Workshop, Customer)
- Geolocation workshop search

## 📖 Dokumentasi

- API Endpoints: [api/CURLS.md](api/CURLS.md)
- Setup Guide: [api/SETUP.md](api/SETUP.md)
- Dashboard: [web/DASHBOARD_README.md](web/DASHBOARD_README.md)

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 14+
- pnpm 8+
- Firebase project

---

**MIT License** | Built with ❤️ using Hono & Next.js
