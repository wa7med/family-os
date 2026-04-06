#!/bin/sh
set -e

DB_PATH="${DATABASE_URL:-/app/data/family-os.db}"
FIRST_RUN=false

if [ ! -f "$DB_PATH" ]; then
  FIRST_RUN=true
fi

# Always run migrations (only new ones are applied)
echo "🔧 Running database migrations..."
npx tsx src/lib/migrate-runner.ts

if [ "$FIRST_RUN" = true ]; then
  echo "🌱 First run — seeding database..."
  npx tsx src/db/seed.ts
  echo "✅ Database ready!"
fi

echo "🚀 Starting Next.js dev server..."
exec npm run dev
