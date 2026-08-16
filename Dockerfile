FROM node:22-alpine AS base

# 1. Instalar dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# 2. Construir o projeto
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis falsas apenas para permitir que o Next.js / Payload faça o build
# O Next.js exige essas variáveis no build, mas na hora de rodar (runtime)
# ele vai usar as variáveis reais cadastradas no Coolify.
ENV PAYLOAD_SECRET=dummy_secret_build_time
ENV DATABASE_URI=postgresql://dummy_user:dummy_pass@localhost:5432/dummy_db
ENV S3_ACCESS_KEY_ID=dummy_s3_key

# Desabilitar a telemetria do Next.js
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx next build

# 3. Imagem de Produção Final
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar os arquivos necessários para rodar a aplicação
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# O Payload precisa da pasta src no runtime em algumas versões, copiamos tudo que é leve
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/payload.config.ts ./payload.config.ts

# Porta padrão do Next.js
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
