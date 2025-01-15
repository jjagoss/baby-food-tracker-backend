FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files including migrations
COPY . .

# Build TypeScript
RUN npm run build

# Copy migrations to dist folder
RUN cp -r src/migrations dist/

EXPOSE 3000

# Run migrations and then start the server
CMD npm run migration:run && npm start