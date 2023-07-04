# ---- Base Node ----
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies ----
FROM base AS dependencies
# Install both production and development dependencies.
RUN npm install && npm cache clean --force

# ---- Copy Files/Build ----
FROM dependencies AS build
COPY . .
RUN npm run build

# --- Release ----
FROM base AS release
# Install production dependencies.
COPY --from=dependencies /app/package*.json ./
RUN npm install --production && npm cache clean --force

# Copy built api
COPY --from=build /app/dist/main.js ./dist/main.js
EXPOSE 3001
CMD ["node", "dist/main.js"]
