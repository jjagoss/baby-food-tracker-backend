#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
./wait-for.sh db

# Run migrations
echo "Running database migrations..."
npx ts-node ./src/migrations/1704932000000-InitialMigration.ts

# Start the application
echo "Starting the application..."
node dist/server.js