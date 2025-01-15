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

# This is important - copy migrations to dist folder
RUN cp -r src/migrations dist/

EXPOSE 3000

CMD ["npm", "start"]