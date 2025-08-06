# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for vite)
RUN npm ci

# Copy source code
COPY . .

# Copy environment file
COPY env.demo .env

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev:demo"] 