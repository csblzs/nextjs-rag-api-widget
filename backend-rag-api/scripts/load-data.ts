// scripts/load-data.ts (HNSWLib index generálása)

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs"; 

dotenv.config();

const INDEX_PATH = "/app/hnswlib-index";

// Embeddings inicializálása
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY,
});

async function loadAndIndexData() {
    console.log("--- Starting Data Loading and Indexing (HNSWLib + Gemini) ---");

    try {
        // 1. Dokumentumok betöltése és felosztása
        const directoryPath = path.join(process.cwd(), "documents");
        const loader = new DirectoryLoader(directoryPath, { ".txt": (p: string) => new TextLoader(p) });
        const docs = await loader.load();
        
        console.log(`1. Loaded ${docs.length} documents.`);
        
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 2000, chunkOverlap: 500 });
        const splitDocs = await splitter.splitDocuments(docs);
        
        console.log(`2. Split into ${splitDocs.length} chunks.`);

        // 3. Index létrehozása és dokumentumok hozzáadása
        console.log("3. Creating HNSWLib Index...");
        
        const vectorStore = await HNSWLib.fromDocuments(
            splitDocs,
            embeddings,
        );
        
        // 4. Index elmentése a lemezre (perzisztencia!)
        if (!fs.existsSync(INDEX_PATH)) {
            fs.mkdirSync(INDEX_PATH, { recursive: true });
        }
        console.log(`4. Saving index to disk: ${INDEX_PATH}`);
        await vectorStore.save(INDEX_PATH);

        console.log("--- Successfully saved HNSWLib index to disk. ---");

    } catch (error) {
        console.error("Hiba az adatbetöltés és indexelés során:", error);
    }
}

loadAndIndexData();