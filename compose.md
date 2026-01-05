version: '3.8'

services:
  # ----------------------------------------------------
  # 1. RAG Szerver (ChromaDB)
  # ----------------------------------------------------
  chroma_db:
    image: chromadb/chroma:latest
    container_name: chroma_db
    # Külső port 8008 (ha kívülről szeretné ellenőrizni), belső port 8000
    ports:
      - "8008:8000"
    volumes:
      # Fontos: Adatmegőrzés a Chroma számára
      - chroma_data:/app/chroma/index
    environment:
      - IS_PERSISTENT=TRUE
      - CHROMA_DATA_PATH=/app/chroma/index
      - ALLOW_RESET=TRUE # Fejlesztés alatt hasznos

  # ----------------------------------------------------
  # 2. Next.js RAG API
  # ----------------------------------------------------
  rag_api:
    build:
      context: . # A Dockerfile-t a jelenlegi (backend-rag-api) mappában keresi
      dockerfile: Dockerfile
    container_name: rag_api
    # A Next.js (belső 3000) elérhető a VPS külső 3000-es portján
    ports:
      - "3000:3000"
    depends_on:
      - chroma_db # Először a ChromaDB induljon el
    environment:
      # A Next.js/LangChain kód által használt API kulcsok átadása a konténernek
      # Ezeket a kulcsokat a .env.local fájlból olvassa be a VPS
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      COHERE_API_KEY: ${COHERE_API_KEY}
      NODE_ENV: production
      # A belső ChromaDB cím a LangChain kód számára
      CHROMA_URL: http://chroma_db:8000
      
volumes:
  chroma_data: