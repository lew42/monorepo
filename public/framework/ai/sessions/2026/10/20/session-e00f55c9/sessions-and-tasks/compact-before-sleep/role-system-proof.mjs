// Live proof: preset+append survives resume and /compact; UserPromptSubmit additionalContext arrives.
import { query } from "file:///C:/Code/lew42/worktrees/compact-before-sleep/Servex/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs";
const append = "# Your role\nYour role codeword is PELICAN-7. If asked for your role codeword, answer it exactly.";
let remind = false;
const hooks = { UserPromptSubmit: [{ hooks: [async () => remind ? (remind = false, { hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: "Role reminder: your reminder word is HERON-3." } }) : {}] }] };
const base = { model: "claude-haiku-4-5", cwd: process.env.TEMP, settingSources: [], allowedTools: [], systemPrompt: { type: "preset", preset: "claude_code", append }, hooks };
async function ask(prompt, extra = {}){
  let sid, text = "", cost = 0, comp = null;
  for await (const m of query({ prompt, options: { ...base, ...extra } })){
    if (m.type === "system" && m.subtype === "init") sid = m.session_id;
    if (m.type === "system" && m.subtype === "compact_boundary") comp = m.compact_metadata;
    if (m.type === "result"){ text = m.result; cost = m.total_cost_usd; }
  }
  return { sid, text: (text||"").slice(0, 200), cost, comp };
}
const a = await ask("Write about 400 words on how rivers form deltas, in plain prose. Then: what is your role codeword?");
console.log("fresh:", a);
const b = await ask("What is your role codeword? One word.", { resume: a.sid });
console.log("resume:", b);
const c = await ask("/compact", { resume: a.sid });
console.log("compact:", c);
remind = true;
const d = await ask("What is your role codeword, and what is your reminder word, if you have one? Answer both briefly.", { resume: a.sid });
console.log("after compact:", d);
