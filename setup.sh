#!/bin/bash

# CampusFlow Setup Script
# This script sets up the project for local development without Docker

set -e

echo "🚀 CampusFlow Setup Script"
echo "=========================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql@15"
    echo "   Ubuntu: sudo apt-get install postgresql-15"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Database setup
echo "📦 Setting up database..."
DB_NAME="campusflow"
DB_USER="campusflow"
DB_PASSWORD="campusflow123"

# Check if database exists
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  Database '$DB_NAME' already exists. Skipping creation."
else
    echo "Creating database '$DB_NAME'..."
    psql -U postgres -c "CREATE DATABASE $DB_NAME;" || {
        echo "⚠️  Could not create database. You may need to run:"
        echo "   createdb $DB_NAME"
        echo "   Or create it manually using psql"
    }
fi

# Create user if it doesn't exist
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "User already exists, skipping..."

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

echo "✅ Database setup complete"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cat > .env << EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=change-me-in-development-use-strong-secret
JWT_REFRESH_SECRET=change-me-refresh-in-development-use-strong-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
OPENAI_API_KEY=
EOF
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists. Skipping creation."
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "Pushing database schema..."
npx prisma db push --accept-data-loss || true

# Seed database
echo "Seeding database..."
npm run prisma:seed || echo "⚠️  Seeding skipped (may already be seeded)"

cd ..
echo "✅ Backend setup complete"
echo ""

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:3001
EOF
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists. Skipping creation."
fi

cd ..
echo "✅ Frontend setup complete"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Terminal 1 - Backend:  cd backend && npm run dev"
echo "  2. Terminal 2 - Frontend: cd frontend && npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "Demo Users:"
echo "  Student:      student@gmu.edu / student123"
echo "  Advisor:     advisor@gmu.edu / advisor123"
echo "  Professor:   professor@gmu.edu / professor123"
echo "  Dept Admin:  deptadmin@gmu.edu / deptadmin123"
echo "  Dean:        dean@gmu.edu / dean123"
echo "  Super Admin: admin@gmu.edu / admin123"
