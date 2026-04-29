import { tool } from "ai";
import { z } from "zod";
import { embed } from "ai";
import { azureProvider, supabase } from "../../config/ai";
import { envVars } from "../../config/env";

const SIMILARITY_MATCH_COUNT = 5;
const EMBEDDING_MODEL_NAME =
  envVars.EMBEDDING_MODEL_NAME || "text-embedding-3-large";

export const vectorDbTools = tool({
  description: `Search the TM-ECommerce knowledge base for information about the website's features, products, pages, navigation, account, orders, payments, admin dashboard, tech stack, creator/developer (Tarek Monowar), security, demo accounts, and any other website-specific topic. ALWAYS use this for any user question that could plausibly be answered by the website's documentation.`,
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "A focused natural-language search query that captures what the user wants to know. Rephrase the user's question into a clear search phrase (e.g. 'main features of TM-ECommerce', 'how Stripe checkout works', 'admin dashboard capabilities').",
      ),
  }),
  execute: async ({ query }) => {
    console.log("[Tool:KB] Called with query:", query);
    try {
      const { embedding } = await embed({
        model: azureProvider.embedding(EMBEDDING_MODEL_NAME),
        value: query,
      });

      console.log("[Tool:KB] Embedding generated, length:", embedding.length);

      const { data: documents, error: matchError } = await supabase.rpc(
        "match_documents",
        {
          query_embedding: embedding,
          match_count: SIMILARITY_MATCH_COUNT,
        },
      );

      if (matchError) {
        console.error("[Tool:KB] match_documents RPC error:", matchError);
        return { error: `Database query failed: ${matchError.message}` };
      }

      console.log(
        "[Tool:KB] Documents returned:",
        documents?.length ?? 0,
      );

      if (!documents || documents.length === 0) {
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
