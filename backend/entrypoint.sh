#!/bin/sh
set -e

echo "==> Waiting for PostgreSQL to be ready..."
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  echo "    PostgreSQL is not ready yet - sleeping 2s..."
  sleep 2
done
echo "==> PostgreSQL is ready!"

echo "==> Generating Prisma Client..."
npx prisma generate

echo "==> Running Prisma migrations..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "==> Running database seed..."
  npx prisma db seed
fi

echo "==> Starting NestJS server..."
exec node dist/src/main.js
