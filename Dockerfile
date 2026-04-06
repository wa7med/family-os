# ---- Dev Stage ----
FROM node:20-alpine AS dev
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN mkdir -p /app/data /app/uploads
RUN chmod +x /app/scripts/init-db.sh
EXPOSE 3000
ENV NODE_ENV=development
CMD ["sh", "/app/scripts/init-db.sh"]

# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# ---- Prod Stage ----
FROM node:20-alpine AS prod
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
RUN mkdir -p /app/data /app/uploads
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
