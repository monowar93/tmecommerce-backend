import { streamText, stepCountIs } from "ai";
import { envVars } from "../../config/env";
import { vectorDbTools } from "./vectorEmbedding";
import { getRetrievalVectorPrompt } from "./prompt";
import type { ModelMessage, StreamTextResult } from "ai";
import { azureProvider } from "../../config/ai";

const MAX_TOOL_STEPS = 4;
const aiModel = envVars.AI_MODEL;
const tools = {
  knowledgeBaseSearch: vectorDbTools,
};

// This function sends a message to the AI model and returns a stream
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
        model: azureProvider(aiModel),
        tools,
        toolChoice: "auto",
        stopWhen: stepCountIs(MAX_TOOL_STEPS),
        system: getRetrievalVectorPrompt(),
        messages,
        onStepFinish: ({ toolCalls, toolResults, finishReason, usage }) => {
          if (toolCalls && toolCalls.length > 0) {
            console.log(
              "[AI] Tool calls in step:",
              toolCalls.map((tc: any) => ({
                name: tc.toolName,
                input: tc.input,
              })),
            );
          }
          if (toolResults && toolResults.length > 0) {
            console.log(
              "[AI] Tool results in step:",
              toolResults.map((tr: any) => ({
                name: tr.toolName,
                outputPreview:
                  typeof tr.output === "string"
                    ? tr.output.slice(0, 200)
                    : JSON.stringify(tr.output).slice(0, 400),
              })),
            );
          }
          console.log(
            "[AI] Step finished. reason:",
            finishReason,
            "usage:",
            usage,
          );
        },
        onError: ({ error }) => {
          console.error("[AI] Stream error:", error);
        },
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
