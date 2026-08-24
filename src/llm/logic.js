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
  const completion = await llmClient.chat.completions.create({
    model: process.env.LLM_MODEL,
    temperature: 0,
    messages: messages
  });
  return completion.choices[0].message.content;
}

export async function processTriage(text) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: text }
  ];

  let rawOutput = await getLLMResponse(messages);
  
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
    
    const repairedOutput = await getLLMResponse(messages);
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
