#!/bin/bash

# Script to start the OAuth server with Docker
# This script will:
# 1. Start MySQL container
# 2. Wait for MySQL to be ready
# 3. Run Prisma db push (sync schema)
# 4. Start the dev server

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🐳 Starting MySQL container..."
cd "$SCRIPT_DIR"
docker compose up -d

echo "⏳ Waiting for MySQL to be ready..."
# Wait for MySQL to accept connections (not just ping)
until docker exec mysql_oauth mysql -uroot -e "SELECT 1" &>/dev/null; do
    printf "."
    sleep 1
done
echo " ✓ MySQL is ready!"

# Extra wait for MySQL to fully initialize (create databases, etc.)
echo "⏳ Waiting for database initialization..."
sleep 3

echo "📦 Syncing database schema..."
cd "$PROJECT_DIR"
# Use Prisma CLI v6 to remain compatible with the `url` datasource in schema.prisma
npx prisma@6.18.0 db push

echo "✅ Database ready! Starting server..."
npm run dev

