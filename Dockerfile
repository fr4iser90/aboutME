# Build stage
FROM node:20-alpine AS builder

# Set up non-root user first
RUN adduser --disabled-password --gecos '' appuser

# Create and set permissions for app directory
RUN mkdir -p /app && chown appuser:appuser /app

USER appuser
WORKDIR /app

# Install dependencies
COPY --chown=appuser:appuser package*.json ./
RUN npm install

# Copy source code
COPY --chown=appuser:appuser . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set up non-root user first
RUN adduser --disabled-password --gecos '' appuser

# Create and set permissions for app directory
RUN mkdir -p /app && chown appuser:appuser /app

USER appuser
WORKDIR /app

# Copy built assets from standalone output
COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appuser /app/public ./public

# Copy runtime scripts
COPY --from=builder --chown=appuser:appuser /app/scripts ./scripts
RUN chmod +x /app/scripts/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=5s --timeout=3s --start-period=2s --retries=2 \
  CMD curl -f http://localhost:3000 || exit 1


# Use entrypoint script for runtime validation
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
