import OpenAI from "openai";
import 'dotenv/config';

export const llmClient = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 30000,
  maxRetries: 2,
});
