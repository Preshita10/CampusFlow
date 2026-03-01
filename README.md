# CampusFlow

**Academic Request & Workflow Management System** — A campus-wide platform for students and staff to manage academic requests, approvals, and workflows. Built with React, Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Quick Start

```bash
git clone <your-repo-url>
cd CampusFlow
./setup.sh
```

Then start the app (see below). Or follow the manual setup.

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL 15+ installed and running
- Git

### Setup

1. **Run the setup script** (automates database and dependency setup):
```bash
./setup.sh
```

Or manually:

2. **Install dependencies**:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Set up the database**:
```bash
# Create database (if not exists)
createdb campusflow

# Or using psql
psql -U postgres -c "CREATE DATABASE campusflow;"
```

4. **Configure environment variables**:
```bash
# Backend - Copy .env.example to .env and update if needed
cd backend
cp .env.example .env

# Frontend - Copy .env.example to .env
cd ../frontend
cp .env.example .env
```

5. **Initialize database**:
```bash
cd backend
npx prisma generate
npx prisma db push
npm run prisma:seed
```

6. **Start the application**:

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Access the application at: **http://localhost:5173**

### Demo Credentials (for testing only)

Demo credentials are provided here for local testing. They are **not** shown in the application UI.

The system comes pre-seeded with multiple users:

- **Student**
  - Email: `student@gmu.edu`
  - Password: `student123`
  - Role: `STUDENT`

- **Advisor**
  - Email: `advisor@gmu.edu`
  - Password: `advisor123`
  - Role: `ADVISOR`

- **Professor**
  - Email: `professor@gmu.edu`
  - Password: `professor123`
  - Role: `PROFESSOR`

- **Department Admin**
  - Email: `deptadmin@gmu.edu`
  - Password: `deptadmin123`
  - Role: `DEPT_ADMIN`

- **Dean**
  - Email: `dean@gmu.edu`
  - Password: `dean123`
  - Role: `DEAN`

- **Super Admin**
  - Email: `admin@gmu.edu`
  - Password: `admin123`
  - Role: `SUPER_ADMIN`

## 📋 Features

### Student Features
- Create academic request tickets (title + description)
- View list of own requests
- View request details with AI-generated category and summary
- Add comments to own requests
- View audit log timeline

### Staff Features
- View all requests in queue
- Filter requests by status and category
- See SLA Risk badge for requests older than 24h still in SUBMITTED status
- Update request status (SUBMITTED → IN_REVIEW → NEEDS_INFO → APPROVED/REJECTED)
- Add comments to any request
- View metrics dashboard (total requests, by status, by category, avg resolution time, SLA risk count)

### AI Features (MVP)
- **Automatic Classification**: Rule-based keyword matching categorizes requests into:
  - COURSE_OVERRIDE
  - ADD_DROP
  - GRADUATION_AUDIT
  - RECOMMENDATION
  - FUNDING
  - GENERAL
- **AI Summary**: Generates 4-6 line summaries covering request intent, status, key details, and latest comments
- **Optional LLM Support**: Set `OPENAI_API_KEY` environment variable to enable LLM-based classification/summarization (falls back to rule-based if unavailable)

### Audit Logging
Every action creates an audit log entry:
- REQUEST_CREATED
- STATUS_CHANGED (with from/to metadata)
- COMMENT_ADDED
- ASSIGNMENT_CHANGED

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend       │
│   React + Vite   │
│   Port: 5173     │
└────────┬─────────┘
         │ HTTP
         │
┌────────▼─────────┐
│   Backend API     │
│   Express + TS    │
│   Port: 3001      │
└────────┬─────────┘
         │
┌────────▼─────────┐
│   PostgreSQL      │
│   Port: 5432      │
└───────────────────┘
```

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js 20 + Express + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 15

## 📁 Project Structure

```
campusflow/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic (AI, audit)
│   │   ├── middleware/      # Auth middleware
│   │   └── prisma/          # Seed script
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── .env.example         # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript types
│   ├── .env.example         # Environment variables template
│   └── package.json
├── setup.sh                  # Setup script for local development
└── README.md
```

## 🔌 API Endpoints

### Health Check
```bash
GET /health
```

### User
```bash
GET /me
Headers: x-user-id, x-user-role
```

### Requests
```bash
# Create request (STUDENT only)
POST /requests
Headers: x-user-id: 1, x-user-role: STUDENT
Body: { "title": "...", "description": "..." }

# List requests
GET /requests?status=SUBMITTED&category=COURSE_OVERRIDE
Headers: x-user-id, x-user-role

# Get request details
GET /requests/:id
Headers: x-user-id, x-user-role

# Update status (STAFF only)
PATCH /requests/:id/status
Headers: x-user-id: 2, x-user-role: STAFF
Body: { "status": "IN_REVIEW" }

# Add comment
POST /requests/:id/comments
Headers: x-user-id, x-user-role
Body: { "message": "..." }
```

### Metrics (STAFF only)
```bash
GET /metrics
Headers: x-user-id: 2, x-user-role: STAFF
```

## 🧪 Demo Script

### 1. Start the System

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 2. Access the Application
Open http://localhost:5173 in your browser.

### 3. Student Workflow
1. Ensure you're acting as **Student** (check navbar toggle)
2. Navigate to "My Requests"
3. Click "+ New Request"
4. Fill in:
   - Title: "Request to Override Prerequisite for CS 662"
   - Description: "I would like to request permission to enroll in CS 662 Advanced Graphics without having completed CS 550. I have equivalent experience from my previous institution."
5. Click "Submit Request"
6. View the created request - notice the AI-generated category and summary
7. Add a comment: "Please let me know if you need any additional information."

### 4. Staff Workflow
1. Click "Act as: Staff" in the navbar
2. Navigate to "Request Queue"
3. See all requests, including the one you just created
4. Click on a request to view details
5. Change status from "SUBMITTED" to "IN_REVIEW"
6. Add a comment: "Thank you for your request. I will review your transcript and get back to you within 2 business days."
7. Notice the audit log shows all activity
8. Navigate to "Metrics" to see dashboard statistics

### 5. Using cURL (Alternative)

First, login to get an access token:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@gmu.edu",
    "password": "student123"
  }'
```

Use the returned `accessToken` in subsequent requests:
```bash
TOKEN="your-access-token-here"

# Create Request as Student
curl -X POST http://localhost:3001/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Late Add Request for MATH 101",
    "description": "I need to add MATH 101 to my schedule after the add deadline."
  }'

# List Requests
curl http://localhost:3001/api/requests \
  -H "Authorization: Bearer $TOKEN"

# Update Status (as Staff)
curl -X PATCH http://localhost:3001/api/requests/req-1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "APPROVED"}'

# Get Metrics (as Staff)
curl http://localhost:3001/api/metrics \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Configuration

### Environment Variables

Backend (`.env` in `backend/` directory):
```env
DATABASE_URL=postgresql://campusflow:campusflow123@localhost:5432/campusflow
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=change-me-in-development-use-strong-secret
JWT_REFRESH_SECRET=change-me-refresh-in-development-use-strong-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
OPENAI_API_KEY=
```

Frontend (`.env` in `frontend/` directory):
```env
VITE_API_URL=http://localhost:3001
```

### Database Migrations

To run migrations manually:

```bash
cd backend
npx prisma migrate dev
# Or for production
npx prisma migrate deploy
```

### Seed Data

To seed the database:

```bash
cd backend
npm run prisma:seed
```

## 🐛 Troubleshooting

### Port Already in Use
If ports 3001, 5173, or 5432 are already in use:

1. Stop conflicting services
2. Or modify ports in `.env` files

### Database Connection Issues
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Test connection
psql -U campusflow -d campusflow

# Reset database (WARNING: deletes all data)
dropdb campusflow
createdb campusflow
cd backend
npx prisma db push
npm run prisma:seed
```

### Backend Not Starting
```bash
# Check backend logs in terminal
# Common issues:
# - Prisma migrations failed → Check DATABASE_URL
# - Port conflict → Check PORT environment variable
# - Missing dependencies → Run npm install
```

### Frontend Not Loading
```bash
# Check frontend logs in terminal
# Verify VITE_API_URL matches backend URL
# Check browser console for CORS errors
# Clear browser cache
```

### Prisma Issues
```bash
cd backend
# Regenerate Prisma client
npx prisma generate

# Reset database and re-seed
npx prisma db push --accept-data-loss
npm run prisma:seed
```

## 🔒 Security Notes

**⚠️ MVP Implementation**: This is an MVP with simplified authentication using headers. For production:

1. Implement proper authentication (JWT, OAuth, etc.)
2. Add rate limiting
3. Implement CSRF protection
4. Add input sanitization
5. Use environment-specific secrets
6. Enable HTTPS
7. Add request validation middleware
8. Implement proper RBAC with database-backed roles

