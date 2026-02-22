FROM node:20-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy app
COPY . .

# Create cache directory
RUN mkdir -p cache

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]
