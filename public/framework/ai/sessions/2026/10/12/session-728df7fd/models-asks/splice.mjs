/* One-off: splice tasks.txt into quick.mjs in place of the old TASKS block, and set the 5-model default. */
import fs from "node:fs";
const p = "Servex/ext/openrouter/evals/quick.mjs";
let s = fs.readFileSync(p, "utf8");
const a = s.indexOf("const code = s =>"), b = s.indexOf("async function ask(");
s = s.slice(0, a) + fs.readFileSync("public/framework/ai/2026-10-12/models-asks/tasks.txt", "utf8") + s.slice(b);
s = s.replace("deepseek/deepseek-v4.1-flash,google/gemini-3.8-flash,openai/gpt-6-luna", "openai/gpt-6-luna,deepseek/deepseek-v4.1-flash,google/gemini-3.8-flash,anthropic/claude-haiku-5.5,anthropic/claude-sonnet-5.5");
s = s.replace('arg("budget", 3)', 'arg("budget", 4)');
fs.writeFileSync(p, s);
