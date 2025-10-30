# Mekaniku - Workshop Management Platform# Mekaniku API



> **Monorepo** structure with Hono API backend and Next.js frontendProduction-ready workshop management platform API built with **Hono**, **TypeScript**, **Prisma**, **Firebase RTDB**, and **PostgreSQL**.



## 📁 Project Structure## 🚀 Features



```- ✅ Multi-tenant workshop management

mekaniku-api/- ✅ Role-based access control (CUSTOMER, WORKSHOP, ADMIN)

├── api/                    # Hono TypeScript API- ✅ Complete booking flow with status transitions

│   ├── src/               # API source code- ✅ Real-time chat with Firebase Realtime Database

│   ├── prisma/            # Database schema & migrations- ✅ Server-Sent Events (SSE) for notifications

│   ├── Dockerfile         # API Docker config- ✅ Payment processing (mock gateway)

│   └── package.json       # API dependencies- ✅ Reviews and ratings

├── web/                    # Next.js Frontend- ✅ Service reports generation

│   ├── app/               # Next.js 14 App Router- ✅ Geolocation-based workshop search

│   ├── components/        # React components- ✅ JWT authentication with refresh tokens

│   ├── Dockerfile         # Web Docker config- ✅ Comprehensive audit logging

│   └── package.json       # Web dependencies- ✅ Docker support

├── docker-compose.yml      # Full stack orchestration- ✅ Seeded database with realistic data

├── pnpm-workspace.yaml     # Monorepo configuration

└── package.json            # Root scripts## 📋 Prerequisites

```

- Node.js 20+ (LTS recommended)

---- PostgreSQL 14+

- pnpm (or npm/yarn)

## 🚀 Quick Start- Firebase project with Realtime Database enabled

- Docker & Docker Compose (optional)

### Prerequisites

## 🛠️ Installation

- Node.js 20+

- pnpm 8+### 1. Clone & Install Dependencies

- Docker & Docker Compose (optional, for containerized setup)

```powershell

### Installationgit clone <repository-url>

cd mekaniku-api

```bashpnpm install

# Install all dependencies (API + Web)```

pnpm install

### 2. Environment Setup

# Setup database (requires PostgreSQL running)

pnpm migrateCopy `.env.example` to `.env` and configure:



# Seed database with test data```powershell

pnpm seedCopy-Item .env.example .env

``````



---Update the following variables in `.env`:



## 🛠️ Development```env

# Database

### Run Both Services (Recommended)DATABASE_URL="postgresql://postgres:password@localhost:5432/mekaniku?schema=public"



```bash# JWT Secrets (generate strong secrets in production!)

# Start API (port 3001) and Web (port 3000) in parallelJWT_SECRET="your-super-secret-jwt-key-min-32-chars-change-in-production"

pnpm devREFRESH_SECRET="your-super-secret-refresh-key-min-32-chars-change-in-production"

```

# Firebase (get from Firebase Console -> Project Settings -> Service Accounts)

### Run Services IndividuallyFIREBASE_PROJECT_ID="your-project-id"

FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"

```bashFIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"

# API onlyFIREBASE_DB_URL="https://your-project-id-default-rtdb.asia-southeast1.firebasedatabase.app"

pnpm dev:api```



# Web only### 3. Database Setup

pnpm dev:web

``````powershell

# Generate Prisma Client

### Access Pointspnpm prisma generate



- **API**: http://localhost:3001# Run migrations

- **Web**: http://localhost:3000pnpm migrate

- **API Health**: http://localhost:3001/health

- **API Docs**: See [api/CURLS.md](api/CURLS.md)# Seed database with sample data

pnpm seed

---```



## 🐳 Docker Setup### 4. Run Development Server



### Build & Run with Docker Compose```powershell

pnpm dev

```bash```

# Build and start all services (PostgreSQL + API + Web)

pnpm docker:upAPI will be available at `http://localhost:3001`



# View logs## 🐳 Docker Setup

pnpm docker:logs

### Quick Start with Docker Compose

# Stop all services

pnpm docker:down```powershell

```# Start PostgreSQL and API

pnpm docker:up

### Services in Docker

# Stop services

- **postgres**: PostgreSQL 14 (port 5432)pnpm docker:down

- **api**: Hono API (port 3001)```

- **web**: Next.js Frontend (port 3000)

### Manual Docker Build

---

```powershell

## 📦 Available Scripts# Build image

docker build -t mekaniku-api .

### Root Level

# Run container

```bashdocker run -p 3000:3000 --env-file .env mekaniku-api

pnpm dev              # Run both API and Web in parallel```

pnpm build            # Build both projects

pnpm start            # Start both in production mode## 📚 API Documentation

pnpm lint             # Lint both projects

### Authentication Endpoints

pnpm migrate          # Run database migrations

pnpm seed             # Seed database with test data#### Register

pnpm studio           # Open Prisma Studio```powershell

curl -X POST http://localhost:3000/api/auth/register `

pnpm docker:up        # Start Docker services  -H "Content-Type: application/json" `

pnpm docker:down      # Stop Docker services  -d '{

pnpm docker:build     # Rebuild Docker images    "name": "John Doe",

pnpm docker:logs      # View Docker logs    "email": "john@example.com",

```    "password": "password123",

    "phone": "+6281234567890",

### API Specific    "role": "CUSTOMER"

  }'

```bash```

pnpm dev:api          # Start API dev server

pnpm build:api        # Build API#### Login

pnpm start:api        # Start API in production```powershell

``````
curl -X POST http://localhost:3001/api/auth/login `

  -H "Content-Type: application/json" `

### Web Specific  -d '{

    "email": "customer1@example.com",

```bash    "password": "password123"

pnpm dev:web          # Start Next.js dev server  }'

pnpm build:web        # Build Next.js```

pnpm start:web        # Start Next.js in production

```Response:

```json

---{

  "success": true,

## 🔑 Environment Variables  "data": {

    "user": {

### API (.env in api/)      "id": "clx...",

      "name": "Customer 1",

```env      "email": "customer1@example.com",

PORT=3000      "role": "CUSTOMER"

NODE_ENV=development    },

DATABASE_URL="postgresql://postgres:password@localhost:5432/mekaniku"    "accessToken": "eyJhbGc...",

JWT_SECRET="your-jwt-secret-min-32-chars"    "refreshToken": "eyJhbGc..."

REFRESH_SECRET="your-refresh-secret-min-32-chars"  }

FIREBASE_PROJECT_ID="your-project-id"}

FIREBASE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"```

FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

FIREBASE_DB_URL="https://your-project-default-rtdb.firebaseio.com"#### Get Firebase Token (for chat)

ALLOWED_ORIGINS="http://localhost:3000"```powershell

```curl -X GET http://localhost:3000/api/auth/firebase-token `

  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

### Web (.env.local in web/)```



```env### Workshop Endpoints

NEXT_PUBLIC_API_URL=http://localhost:3000

```#### Search Workshops

```powershell

---# Search by city

curl "http://localhost:3000/api/workshops?city=Jakarta&page=1&limit=10"

## 🗄️ Database Setup

# Search by location (proximity)

### Local PostgreSQLcurl "http://localhost:3000/api/workshops?lat=-6.2088&lng=106.8456&radius=10&page=1&limit=10"

```

```bash

# Option 1: Using Docker#### Get Workshop Details

docker run --name mekaniku-postgres \```powershell

  -e POSTGRES_USER=postgres \curl http://localhost:3000/api/workshops/{workshopId}

  -e POSTGRES_PASSWORD=password \```

  -e POSTGRES_DB=mekaniku \

  -p 5432:5432 \#### Get Workshop Services

  -d postgres:14-alpine```powershell

curl http://localhost:3000/api/workshops/{workshopId}/services

# Option 2: Using docker-compose```

pnpm docker:up postgres

### Consultation Flow

# Run migrations

pnpm migrate#### Create Consultation

```powershell

# Seed test datacurl -X POST http://localhost:3000/api/consultations `

pnpm seed  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" `

```  -H "Content-Type: application/json" `

  -d '{

### Cloud Database (Production)    "workshopId": "clx...",

    "message": "My car engine makes a strange noise. Can you check it?"

Use services like:  }'

- **Neon.tech** (PostgreSQL Serverless - Free tier available)```

- **Supabase** (PostgreSQL + Auth + Storage)

- **Railway.app** (PostgreSQL managed)#### Close Consultation

```powershell

Update `DATABASE_URL` in `api/.env` with cloud connection string.curl -X PATCH http://localhost:3000/api/consultations/{consultationId}/close `

  -H "Authorization: Bearer YOUR_TOKEN"

---```



## 📚 Documentation### Booking Flow



- **API Documentation**: [api/README.md](api/README.md)#### Create Booking

- **API Setup Guide**: [api/SETUP.md](api/SETUP.md)```powershell

- **API Endpoints**: [api/CURLS.md](api/CURLS.md)curl -X POST http://localhost:3000/api/bookings `

- **Troubleshooting**: [api/TROUBLESHOOTING.md](api/TROUBLESHOOTING.md)  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" `

  -H "Content-Type: application/json" `

---  -d '{

    "workshopId": "clx...",

## 🧪 Testing    "vehicleId": "clx...",

    "serviceId": "clx...",

### Test Data    "consultationId": "clx..." (optional),

    "scheduledAt": "2024-12-01T10:00:00Z",

Database seeded with:    "notes": "Please check the engine carefully"

- **1 Admin**: admin@mekaniku.com / password123  }'

- **2 Workshop Owners**: budi@workshop.com, siti@workshop.com / password123```

- **30 Customers**: customer1-30@example.com / password123

- **2 Workshops** with services, mechanics, bookings#### Confirm Booking (Workshop)

```powershell

### Test APIcurl -X POST http://localhost:3000/api/bookings/{bookingId}/confirm `

  -H "Authorization: Bearer YOUR_WORKSHOP_TOKEN"

```bash```

# Login

curl -X POST http://localhost:3000/api/auth/login \#### Start Booking

  -H "Content-Type: application/json" \```powershell

  -d '{"email":"admin@mekaniku.com","password":"password123"}'curl -X POST http://localhost:3000/api/bookings/{bookingId}/start `

  -H "Authorization: Bearer YOUR_WORKSHOP_TOKEN"

# Get workshops```

curl http://localhost:3000/api/workshops

```#### Create Inspection

```powershell

See [api/CURLS.md](api/CURLS.md) for complete API testing examples.curl -X POST http://localhost:3000/api/bookings/{bookingId}/inspection `

  -H "Authorization: Bearer YOUR_WORKSHOP_TOKEN" `

---  -H "Content-Type: application/json" `

  -d '{

## 🏗️ Tech Stack    "findings": {

      "condition": "Good overall",

### Backend (API)      "issues": ["Worn brake pads"],

      "recommendations": ["Replace brake pads"]

- **Runtime**: Node.js 20+    },

- **Framework**: Hono (Ultra-fast web framework)    "photos": ["https://example.com/photo1.jpg"]

- **Database**: PostgreSQL 14+ with Prisma ORM  }'

- **Auth**: JWT with refresh tokens```

- **Real-time**: Firebase Realtime Database (chat)

- **Validation**: Zod schemas#### Create Work Order

- **Testing**: Vitest```powershell

curl -X POST http://localhost:3000/api/bookings/{bookingId}/workorder `

### Frontend (Web)  -H "Authorization: Bearer YOUR_WORKSHOP_TOKEN" `

  -H "Content-Type: application/json" `

- **Framework**: Next.js 14+ (App Router)  -d '{

- **Language**: TypeScript    "tasks": {

- **Styling**: Tailwind CSS      "task1": "Replace brake pads",

- **State Management**: React hooks      "task2": "Check engine oil"

- **API Client**: fetch / axios    },

    "parts": {

### DevOps      "Brake Pads": {"quantity": 4, "price": 200000}

    },

- **Package Manager**: pnpm (monorepo)    "laborHours": 2.5,

- **Containerization**: Docker & Docker Compose    "subtotal": 350000

- **Database Migrations**: Prisma Migrate  }'

- **CI/CD Ready**: GitHub Actions compatible```



---#### Process Payment

```powershell

## 🔐 Securitycurl -X POST http://localhost:3000/api/bookings/{bookingId}/pay `

  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" `

- ✅ JWT authentication with httpOnly cookies  -H "Content-Type: application/json" `

- ✅ Refresh token rotation  -d '{

- ✅ Password hashing with bcrypt    "amount": 350000,

- ✅ Role-based access control (RBAC)    "method": "CREDIT_CARD"

- ✅ Rate limiting  }'

- ✅ CORS configuration```

- ✅ Input validation (Zod)

- ✅ SQL injection prevention (Prisma)#### Complete Booking

```powershell

---curl -X POST http://localhost:3000/api/bookings/{bookingId}/complete `

  -H "Authorization: Bearer YOUR_WORKSHOP_TOKEN"

## 📈 Features```



### Authentication & Authorization#### Create Review

- Multi-role system (CUSTOMER, WORKSHOP, ADMIN)```powershell

- JWT access + refresh tokenscurl -X POST http://localhost:3000/api/bookings/{bookingId}/review `

- Firebase custom tokens for chat  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" `

  -H "Content-Type: application/json" `

### Workshop Management  -d '{

- Workshop CRUD with geolocation    "rating": 5,

- Service catalog management    "comment": "Excellent service! Very professional."

- Mechanic assignment  }'

- Operating hours configuration```



### Booking System#### Generate Report

- Complete booking flow```powershell

- Status transitions (PENDING → CONFIRMED → IN_PROGRESS → COMPLETED)curl -X POST http://localhost:3000/api/bookings/{bookingId}/report `

- Vehicle inspections  -H "Authorization: Bearer YOUR_WORKSHOP_TOKEN" `

- Work order tracking  -H "Content-Type: application/json" `

- Payment processing  -d '{

- Customer reviews    "summary": "Service completed successfully. All issues resolved."

- Service reports  }'

```

### Real-time Features

- Chat system (Firebase RTDB)### Notifications (SSE)

- SSE notifications

- Live booking updates#### Stream Notifications

```powershell

---curl -N -H "Authorization: Bearer YOUR_TOKEN" `

  http://localhost:3000/api/notifications/stream

## 🚢 Deployment```



### Docker Deployment (Recommended)#### Mark as Read

```powershell

```bashcurl -X PATCH http://localhost:3000/api/notifications/{notificationId}/read `

# Build production images  -H "Authorization: Bearer YOUR_TOKEN"

pnpm docker:build```



# Start services### Chat (Firebase RTDB)

pnpm docker:up

Chat is handled directly via Firebase SDK on the client side. The API provides:

# Services will be available at:

# - API: http://localhost:3000- `GET /api/chats/:id` - Get chat metadata

# - Web: http://localhost:3001- `GET /api/chats/:id/messages` - Get messages (alternative to RTDB direct access)

```- `POST /api/chats/:id/messages` - Send system messages (server-initiated)



### Cloud Deployment#### Client-side Firebase Setup Example



Deploy to:```javascript

- **Vercel** (Next.js frontend)import { initializeApp } from 'firebase/app';

- **Railway.app** (API + Database)import { getDatabase, ref, onValue, push } from 'firebase/database';

- **Render.com** (API + Database)import { getAuth, signInWithCustomToken } from 'firebase/auth';

- **DigitalOcean App Platform**

- **AWS/GCP/Azure**// Get custom token from API

const response = await fetch('/api/auth/firebase-token', {

See individual deployment guides in `api/SETUP.md`.  headers: { 'Authorization': `Bearer ${accessToken}` }

});

---const { token } = await response.json();



## 🤝 Contributing// Sign in to Firebase

const auth = getAuth();

1. Fork the repositoryawait signInWithCustomToken(auth, token);

2. Create feature branch (`git checkout -b feature/amazing-feature`)

3. Commit changes (`git commit -m 'Add amazing feature'`)// Subscribe to messages

4. Push to branch (`git push origin feature/amazing-feature`)const db = getDatabase();

5. Open Pull Requestconst messagesRef = ref(db, `messages/${chatId}`);

onValue(messagesRef, (snapshot) => {

---  const messages = snapshot.val();

  // Update UI

## 📝 License});



MIT License - See LICENSE file for details// Send message

const newMessageRef = push(ref(db, `messages/${chatId}`));

---await newMessageRef.set({

  senderId: userId,

## 👥 Support  senderRole: 'CUSTOMER',

  type: 'TEXT',

- **Documentation**: See `/api/README.md` and `/web/README.md`  text: 'Hello!',

- **Issues**: GitHub Issues  createdAt: Date.now()

- **Email**: support@mekaniku.com (example)});

```

---

## 🔐 Firebase Realtime Database Security Rules

**Built with ❤️ using Hono, Next.js, Prisma, and TypeScript**

Deploy these rules to Firebase Console:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "chats": {
      "$chatId": {
        ".read": "root.child('chatMembers/' + $chatId + '/' + auth.uid).exists()",
        ".write": "root.child('chatMembers/' + $chatId + '/' + auth.uid).exists()"
      }
    },
    "messages": {
      "$chatId": {
        "$msgId": {
          ".read": "root.child('chatMembers/' + $chatId + '/' + auth.uid).exists()",
          ".write": "root.child('chatMembers/' + $chatId + '/' + auth.uid).exists()"
        }
      }
    },
    "chatMembers": {
      "$chatId": {
        "$uid": {
          ".read": "$uid === auth.uid",
          ".write": "auth != null && (newData.exists() && newData.val() === true)"
        }
      }
    },
    "typing": {
      "$chatId": {
        "$uid": {
          ".read": "root.child('chatMembers/' + $chatId + '/' + auth.uid).exists()",
          ".write": "$uid === auth.uid"
        }
      }
    },
    "presence": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 🧪 Testing

```powershell
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 📊 Database Schema

Key entities:
- **User** - Customers, workshop owners, mechanics, admins
- **Workshop** - Workshop locations and details
- **ServiceCatalog** - Available services per workshop
- **Booking** - Service bookings with status tracking
- **Inspection** - Pre-service inspections
- **WorkOrder** - Work tracking with tasks and parts
- **Payment** - Payment processing
- **Review** - Customer reviews and ratings
- **Report** - Service completion reports
- **Notification** - In-app notifications
- **AuditLog** - Complete audit trail

## 🔑 Seeded Test Accounts

After running `pnpm seed`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mekaniku.com | password123 |
| Workshop 1 | budi@workshop.com | password123 |
| Workshop 2 | siti@workshop.com | password123 |
| Customer 1 | customer1@example.com | password123 |
| Customer 2-30 | customer{N}@example.com | password123 |

## 🚧 Complete Business Flow Example

```powershell
# 1. Customer registers
$register = curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}' | ConvertFrom-Json

$token = $register.data.accessToken

# 2. Search workshops
curl "http://localhost:3000/api/workshops?city=Jakarta"

# 3. Create consultation
$consult = curl -X POST http://localhost:3000/api/consultations `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"workshopId":"WORKSHOP_ID","message":"Need oil change"}' | ConvertFrom-Json

# 4. Create booking
$booking = curl -X POST http://localhost:3000/api/bookings `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"workshopId":"WORKSHOP_ID","vehicleId":"VEHICLE_ID","serviceId":"SERVICE_ID","scheduledAt":"2024-12-01T10:00:00Z"}' | ConvertFrom-Json

# 5. Workshop confirms (use workshop token)
curl -X POST "http://localhost:3000/api/bookings/$($booking.data.id)/confirm" `
  -H "Authorization: Bearer WORKSHOP_TOKEN"

# 6. Workshop creates inspection
curl -X POST "http://localhost:3000/api/bookings/$($booking.data.id)/inspection" `
  -H "Authorization: Bearer WORKSHOP_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"findings":{"condition":"Good"},"photos":[]}'

# 7. Workshop creates work order
curl -X POST "http://localhost:3000/api/bookings/$($booking.data.id)/workorder" `
  -H "Authorization: Bearer WORKSHOP_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"tasks":{},"parts":{},"laborHours":1.5,"subtotal":150000}'

# 8. Customer pays
curl -X POST "http://localhost:3000/api/bookings/$($booking.data.id)/pay" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"amount":150000,"method":"CASH"}'

# 9. Workshop completes booking
curl -X POST "http://localhost:3000/api/bookings/$($booking.data.id)/complete" `
  -H "Authorization: Bearer WORKSHOP_TOKEN"

# 10. Customer reviews
curl -X POST "http://localhost:3000/api/bookings/$($booking.data.id)/review" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"rating":5,"comment":"Great service!"}'

# 11. Workshop generates report
curl -X POST "http://localhost:3000/api/bookings/$($booking.data.id)/report" `
  -H "Authorization: Bearer WORKSHOP_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"summary":"Service completed successfully"}'
```

## 📁 Project Structure

```
mekaniku-api/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── src/
│   ├── config/
│   │   └── env.ts          # Environment configuration
│   ├── db/
│   │   └── prisma.ts       # Prisma client
│   ├── lib/
│   │   └── firebase.ts     # Firebase Admin SDK
│   ├── middlewares/
│   │   ├── auth.ts         # JWT authentication
│   │   ├── rbac.ts         # Role-based access control
│   │   ├── error.ts        # Error handler
│   │   └── rateLimit.ts    # Rate limiting
│   ├── modules/
│   │   ├── auth/           # Authentication
│   │   ├── workshops/      # Workshop management
│   │   ├── consultations/  # Consultations
│   │   ├── bookings/       # Booking flow
│   │   ├── chat/           # Firebase chat
│   │   ├── inspections/    # Inspections
│   │   ├── workorders/     # Work orders
│   │   ├── payments/       # Payments
│   │   ├── reviews/        # Reviews
│   │   ├── reports/        # Reports
│   │   └── notifications/  # SSE notifications
│   ├── utils/
│   │   ├── logger.ts       # Logging
│   │   ├── pagination.ts   # Pagination helpers
│   │   ├── response.ts     # Response helpers
│   │   └── id.ts           # ID generators
│   ├── app.ts              # Hono app setup
│   └── server.ts           # Server entry point
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔮 Future Enhancements

- [ ] Email notifications via SMTP/SendGrid
- [ ] File upload for inspection photos
- [ ] PDF report generation (using puppeteer/pdfkit)
- [ ] SMS notifications via Twilio
- [ ] Push notifications via FCM
- [ ] Advanced geospatial search with PostGIS
- [ ] Stripe/Midtrans payment integration
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 📄 License

MIT

## 👥 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Hono, TypeScript, Prisma, and Firebase
