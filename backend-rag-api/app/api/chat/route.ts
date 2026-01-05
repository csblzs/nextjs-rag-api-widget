import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"; // ✅ HELYES GEMINI EMBEDDINGS
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence, RunnableMap } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
// import { Embeddings as BaseEmbeddings } from "@langchain/core/embeddings"; // Kísérletként meg lehet hagyni, de most eltávolítjuk a tisztaság kedvéért.

export async function POST(req: NextRequest) {
  console.log("POST /api/chat started");
  try {
    const body = await req.json();
    const { question } = body;
    console.log("Question received:", question);

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // 1. LLM Inicializálása
    const llm = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0,
      // @ts-ignore
      apiVersion: "v1beta",
    });

    // 2. Embeddings Inicializálása (Ez az, amit az indexelésnél használnod kell!)
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004", // Stabil Gemini embedding modell
      apiKey: process.env.GEMINI_API_KEY,
    });

    try {
      const testEmbed = await embeddings.embedQuery(question);
      console.log("Test embedding generated. Type:", typeof testEmbed, "IsArray:", Array.isArray(testEmbed), "Length:", testEmbed.length);
    } catch (err) {
      console.error("Error generating test embedding:", err);
    }

    // 3. Vector Store Betöltése
    const INDEX_PATH = "/app/hnswlib-index";
    console.log("Loading HNSWLib index from:", INDEX_PATH);
    
    const vectorStore = await HNSWLib.load(INDEX_PATH, embeddings);

    const retriever = vectorStore.asRetriever(8);

    // 4. Retriever helyett manuális keresés
    console.log("Searching for documents...");
    const docs = await vectorStore.similaritySearch(question, 10);
    console.log(`Found ${docs.length} documents.`);

    // 5. Prompt (Modern formátum)
    const template = `Használd az alábbi kontextust a kérdés megválaszolásához.
Ha a válasz nem található meg a kontextusban, udvariasan utasítsd el a választ ezzel a szöveggel: 'Az oldalal kapcsolatban kérdezz te tepsi fejű!', és közöld, hogy csak az oldallal kapcsolatos kérdésekben segítesz.
NE találj ki választ.

Kontextus:
{context}

Kérdés: {question}

Válasz:`;

    const prompt = PromptTemplate.fromTemplate(template);

    // 6. Manuális RAG folyamat
    
    // A. Dokumentumok formázása
    const context = docs.map((doc) => doc.pageContent).join("\n\n");

    // B. Prompt kitöltése
    const formattedPrompt = await prompt.format({
      context: context,
      question: question,
    });

    // C. LLM hívása
    console.log("Invoking LLM...");
    const llmResult = await llm.invoke(formattedPrompt);
    console.log("LLM response received.");

    // D. Válasz kinyerése
    const answer = llmResult.content;

    // 8. Válasz visszaadása
    return NextResponse.json({ answer: answer }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error: any) {
    console.error('Error in chat route:', error);
    if (error.stack) {
        console.error(error.stack);
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}