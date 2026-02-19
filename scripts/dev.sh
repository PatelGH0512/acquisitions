#!/bin/bash

# Development startup script for Acquisition App with Neon Local
# This script starts the application in development mode with Neon Local

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "   Please copy .env.development from the template and update with your Neon credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

# Create .neon_local directory if it doesn't exist
mkdir -p .neon_local

# Add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "✅ Added .neon_local/ to .gitignore"
fi

echo "📦 Building and starting development containers..."
echo "   - Neon Local proxy will create an ephemeral database branch"
echo "   - Application will run with hot reload enabled"
echo ""

# Start Neon Local first so it's reachable for migrations
docker compose -f docker-compose.dev.yml up -d --build neon-local

# Wait for the database to be ready
echo "⏳ Waiting for the database to be ready..."
for i in {1..30}; do
    printf "."
    if docker compose -f docker-compose.dev.yml exec -T neon-local env PGPASSWORD=npg psql -h 127.0.0.1 -p 5432 -U neon -d neondb -c 'SELECT 1' >/dev/null 2>&1; then
        echo ""
        echo "✅ Database is ready"
        break
    fi
    sleep 1
done

if [ "$i" -eq 30 ]; then
    echo ""
    echo "❌ Database did not become ready in time."
    echo "   Try: docker compose -f docker-compose.dev.yml logs neon-local"
    exit 1
fi

# Run migrations with Drizzle
echo "📜 Applying latest schema with Drizzle..."
NEON_LOCAL=true \
NEON_LOCAL_ENDPOINT=http://localhost:55432/sql \
DATABASE_URL=postgres://neon:npg@localhost:55432/neondb \
npm run db:migrate

# Start development environment
docker compose -f docker-compose.dev.yml up --build

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:5173"
echo "   Database: postgres://neon:npg@localhost:55432/neondb"
echo ""
echo "To stop the environment, press Ctrl+C or run: docker compose down"