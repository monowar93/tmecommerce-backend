import { createAzure } from "@ai-sdk/azure";
import { createClient } from "@supabase/supabase-js";
import { envVars } from "./env";

const OPENAI_API_KEY = envVars.OPENAI_API_KEY;
const supabaseUrl = envVars.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

export const azureProvider = createAzure({
  resourceName: "ai-api-agents",
  apiKey: OPENAI_API_KEY,
});

export const supabase = createClient(supabaseUrl, supabaseKey);
