#!/bin/bash
# Setup script for initial development

echo "🔧 Setting up CampusFlow Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database..."
npm run prisma:seed

echo "✅ Setup complete!"
