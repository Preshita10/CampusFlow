#!/bin/sh
# Startup script for Docker container

set -e

echo "🚀 Starting CampusFlow Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until nc -z postgres 5432; do
  sleep 1
done
echo "✅ PostgreSQL is ready"

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Push schema to database (creates tables if they don't exist)
# For production, you'd use migrations, but for MVP this is simpler
echo "📦 Syncing database schema..."
npx prisma db push --accept-data-loss || true

# Seed database (idempotent - safe to run multiple times)
echo "🌱 Seeding database..."
npm run prisma:seed || echo "⚠️ Seeding skipped (may already be seeded)"

# Start server
echo "🎉 Starting server..."
exec npm start
