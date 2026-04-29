import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { envVars } from "./env";

const OPENAI_API_KEY = envVars.OPENAI_API_KEY;
const AI_URL = envVars.AI_URL;
const supabaseUrl = envVars.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

export const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: AI_URL,
});

export const supabase = createClient(supabaseUrl, supabaseKey);
