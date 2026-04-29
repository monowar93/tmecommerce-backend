import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs/promises";
import { azureProvider, supabase } from "../config/ai";
import { env } from "process";
import { embed } from "ai";
import path from "path";

const EMBEDDING_MODEL_NAME =
  env.EMBEDDING_MODEL_NAME || "text-embedding-3-large";
const __dirname = path.resolve();

//import long content and use
async function splitDocument(document: any) {
  const absolutePath = path.join(
    __dirname,
    "src",
    "app",
    "embeddedData",
    document,
  );

  try {
    const text = await fs.readFile(absolutePath, "utf8");
    if (!text) {
      throw new Error("Document is empty or could not be read.");
    }
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const output = await splitter.createDocuments([text]);
    return output;
  } catch (error) {
    console.error("Error splitting document:", error);
    throw error; // Re-throw the error after logging it
  }
}

export async function createAndStoreEmbeddings(document: any) {
  try {
    const chunkData = await splitDocument(document);
    const data = await Promise.all(
      chunkData.map(async (chunk) => {
        const embeddingResponse = await embed({
          model: azureProvider.embedding(EMBEDDING_MODEL_NAME),
          value: chunk.pageContent,
        });
        return {
          content: chunk.pageContent,
          embedding: embeddingResponse.embedding,
        };
      }),
    );

    console.log(data);

    const { error } = await supabase
      .from("tm_ecommerce_embedding")
      .insert(data);
    if (error) {
      throw new Error(`Error inserting data: ${error}`);
    } else {
      console.log("Embedding and storing complete!", data);
    }
  } catch (error: any) {
    console.error("Error in createAndStoreEmbeddings:", error.message);
  }
}
