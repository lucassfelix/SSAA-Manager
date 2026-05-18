# Build from repository root:
#   docker build -f packages/supabase-api/Dockerfile -t neofront-supabase-api .
#
# Run with -e DATABASE_URL -e SESSION_SECRET -e SUPABASE_URL -e CORS_ORIGIN
# Optional: -e PORT=3101 -e COOKIE_SAMESITE=none -e COOKIE_SECURE=true (cross-site SPA).

FROM node:22-alpine
WORKDIR /app
COPY packages/supabase-api/package.json ./
RUN npm install --omit=dev
COPY packages/supabase-api/src ./src
ENV NODE_ENV=production
EXPOSE 3101
CMD ["node", "src/index.js"]
