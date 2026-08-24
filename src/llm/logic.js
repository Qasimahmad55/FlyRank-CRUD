import { llmClient } from "./client.js";
import { outputSchema } from "./schema.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const promptPath = path.join(__dirname, '../../prompts', 'triage-v1.md');
const systemPrompt = fs.readFileSync(promptPath, 'utf8');

function parseModelOutput(rawText) {
  let text = rawText.trim();
  if (text.startsWith("```json")) {
    text = text.substring(7);
  } else if (text.startsWith("```")) {
    text = text.substring(3);
  }
  if (text.endsWith("```")) {
    text = text.substring(0, text.length - 3);
  }
  return JSON.parse(text.trim());
}

async function getLLMResponse(messages) {
  const startTime = Date.now();
  const completion = await llmClient.chat.completions.create({
    model: process.env.LLM_MODEL,
    temperature: 0,
    messages: messages
  });
  const duration = Date.now() - startTime;
  return {
    content: completion.choices[0].message.content,
    usage: completion.usage || { prompt_tokens: 0, completion_tokens: 0 },
    duration
  };
}

function logCost(version, model, usage, duration, isRepair) {
  console.log(JSON.stringify({
    event: "llm_call",
    prompt_version: version,
    model: model,
    input_tokens: usage.prompt_tokens,
    output_tokens: usage.completion_tokens,
    duration_ms: duration,
    is_repair: isRepair
  }));
}

export async function processTriage(text) {
  if (process.env.LLM_ENABLED === "false") {
    return {
      category: "other",
      urgency: "low",
      confidence: 1.0,
      reason: "LLM disabled via kill switch"
    };
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: text }
  ];

  let response = await getLLMResponse(messages);
  logCost("v1", process.env.LLM_MODEL, response.usage, response.duration, false);
  let rawOutput = response.content;
  
  try {
    const parsed = parseModelOutput(rawOutput);
    const result = outputSchema.safeParse(parsed);
    if (result.success) return result.data;
    
    // Repair attempt
    messages.push({ role: "assistant", content: rawOutput });
    messages.push({ 
      role: "user", 
      content: `Your previous answer was rejected for this reason: ${JSON.stringify(result.error.errors)}. Return only corrected JSON matching the schema.` 
    });
    
    let repairedResponse = await getLLMResponse(messages);
    logCost("v1", process.env.LLM_MODEL, repairedResponse.usage, repairedResponse.duration, true);
    const repairedOutput = repairedResponse.content;
    const repairedParsed = parseModelOutput(repairedOutput);
    const repairedResult = outputSchema.safeParse(repairedParsed);
    if (repairedResult.success) return repairedResult.data;
    
    throw new Error("Validation failed after repair: " + JSON.stringify(repairedResult.error.errors));
  } catch (error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      input: text,
      error: error.message,
      rawOutput: rawOutput,
      promptVersion: "v1"
    };
    fs.appendFileSync(path.join(logDir, 'quarantine.jsonl'), JSON.stringify(logEntry) + "\n");
    throw error;
  }
}
