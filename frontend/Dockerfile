# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install a simple HTTP server to serve the built files
RUN npm install -g http-server

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the server
CMD ["http-server", "dist", "-p", "8080", "-g"]
