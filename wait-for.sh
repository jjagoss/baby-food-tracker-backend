#!/bin/sh

echo "Waiting for postgres..."
while ! pg_isready -h db -p 5432 -U postgres; do
    sleep 1
done
echo "PostgreSQL started"

echo "Running migrations..."
npx typeorm-ts-node-commonjs migration:run -d ./src/config/database.ts

echo "Starting application..."
node dist/server.js