# Dockerfile

# ====================================================
# STAGE 1: Build Stage (Függőségek telepítése és Next.js build)
# ====================================================
FROM node:20-alpine AS builder

# Állítsa be a munkakönyvtárat
WORKDIR /app

# ----------------------------------------------------
# 1. HNSWLib / Natív függőségek telepítése
# A HNSWLib (hnswlib-node) sikeres telepítéséhez szükséges
# C++ fordító (build-base), Python, és git telepítése.
# ----------------------------------------------------
RUN apk update && \
    apk add --no-cache build-base python3 git && \
    ln -sf python3 /usr/bin/python
# ----------------------------------------------------


# Másolja be a package fájlokat és telepítse a függőségeket
COPY package.json package-lock.json ./
RUN rm -rf node_modules && npm install --legacy-peer-deps && npm dedupe

# ----------------------------------------------------
# 2. A build eszközök eltávolítása
# Csak a npm install-nál volt rájuk szükség, így csökkentjük az image méretét.
# ----------------------------------------------------
RUN apk del build-base python3 git
# ----------------------------------------------------


# Másolja be az összes többi fájlt
COPY . .

# Futtassa a produkciós buildet
RUN npm run build


# ====================================================
# STAGE 2: Production Server (Futtatási környezet)
# ====================================================
FROM node:20-alpine

# Állítsa be a Next.js környezetet (produkciós mód)
ENV NODE_ENV production

# A Next.js a 3000-es porton fut
EXPOSE 3000

# Állítsa be a munkakönyvtárat
WORKDIR /app

# Csak a szükséges fájlokat másolja át a build stage-ből
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# --------------------------------------------------------------------------------------
# VÉGLEGES JAVÍTÁS (2. kísérlet): Natív bináris fájl (addon.node) átmásolása
#   1. A Next.js root mappájába (korábbi fix)
#   2. A lib/binding mappába (a logok által javasolt útvonalra)
# --------------------------------------------------------------------------------------
# 1. Átmásolás a .next mappába (a korábbi próbálkozás)
COPY --from=builder /app/node_modules/hnswlib-node/build/Release/addon.node /app/.next/addon.node

# 2. Átmásolás a lib/binding mappába (a logok alapján)
RUN mkdir -p /app/.next/lib/binding/node-v115-linux-x64/
COPY --from=builder /app/node_modules/hnswlib-node/build/Release/addon.node /app/.next/lib/binding/node-v115-linux-x64/addon.node
# --------------------------------------------------------------------------------------

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY tsconfig.json .
COPY documents ./documents

# ... (mkdir -p és chmod marad)
RUN mkdir -p hnswlib-index 
RUN chmod -R 777 hnswlib-index
# ----------------------------------------------------

# Indítsa el a Next.js produkciós szervert
CMD ["npm", "run", "start"]