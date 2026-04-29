import { streamText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { envVars } from "../../config/env";
import { vectorDbTools } from "./vectorEmbedding";
import { getRetrievalVectorPrompt } from "./prompt";
import type { ModelMessage, StreamTextResult } from "ai";

const MAX_TOOL_STEPS = 3;
const aiModel = envVars.AI_MODEL;
const tools = {
  knowledgeBaseSearch: vectorDbTools,
};

const chat = async (
  message: string,
  retries = 3,
): Promise<StreamTextResult<typeof tools, any>> => {
  if (!message) {
    throw new Error("Please provide a message.");
  }

  const messages: ModelMessage[] = [
    {
      role: "user",
      content: message,
    },
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = streamText({
        model: openai(aiModel),
        tools,
        stopWhen: stepCountIs(MAX_TOOL_STEPS),
        system: getRetrievalVectorPrompt(),
        messages,
      });

      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt === retries) throw error;

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error("Failed after retries");
};

export const AiMessengerServices = {
  chat,
};
