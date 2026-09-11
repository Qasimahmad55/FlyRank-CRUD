import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const casesPath = path.join(__dirname, 'cases.json');

const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

async function runEval() {
  console.log(`Running eval on ${cases.length} cases...`);
  let matches = 0;
  const failed = [];

  for (let i = 0; i < cases.length; i++) {
    const { text, expected_category } = cases[i];
    try {
      const res = await fetch("http://localhost:3000/triage", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.category === expected_category) {
        matches++;
      } else {
        failed.push({ text, expected: expected_category, got: data.category });
      }
    } catch (error) {
      failed.push({ text, expected: expected_category, error: error.message });
    }
  }

  console.log(`\nEval Score: ${matches}/${cases.length} (${Math.round((matches/cases.length)*100)}%)`);
  if (failed.length > 0) {
    console.log("\nFailed cases:");
    console.log(JSON.stringify(failed, null, 2));
  } else {
    console.log("\nAll cases passed!");
  }
}

runEval();
