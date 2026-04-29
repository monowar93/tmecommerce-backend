import { tool } from "ai";
import { z } from "zod";
import { embed } from "ai";
import { openai, supabase } from "../../config/ai";
import { envVars } from "../../config/env";

const SIMILARITY_MATCH_COUNT = 5;
const EMBEDDING_MODEL_NAME =
  envVars.EMBEDDING_MODEL_NAME || "text-embedding-3-large";

export const vectorDbTools = tool({
  description: `Retrieve specific information about TM-ECommerce website to answer user questions.`,
  inputSchema: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    try {
      // 1. Embed the query
      const { embedding } = await embed({
        model: openai.embedding(EMBEDDING_MODEL_NAME),
        value: query,
      });

      // 2. Query Supabase
      const { data: documents, error: matchError } = await supabase.rpc(
        "match_documents",
        {
          query_embedding: embedding,
          match_count: SIMILARITY_MATCH_COUNT,
        },
      );

      if (matchError) {
        console.error("[Tool:KB] Error matching documents:", matchError);
        // Return an error message that the LLM can understand
        return { error: `Database query failed: ${matchError.message}` };
      }

      if (!documents || documents.length === 0) {
        console.log("[Tool:KB] No relevant documents found.");
        return {
          info: "No relevant information found in the knowledge base for that query.",
        };
      }

      return {
        retrievedDocuments: documents.map((doc: any) => ({
          content: doc.content,
        })),
      };
    } catch (error) {
      console.error("[Tool:KB] Error during execution:", error);
      return {
        error: `Failed to execute knowledge base retrieval: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  },
});
