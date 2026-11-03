// node classify2.mjs <model> <transcript.jsonl>... -> ONE Haiku call over the stripped transcripts (packed), prints JSON + real cost
import fs from "node:fs"; import path from "node:path"; import { spawnSync } from "node:child_process"; import { strip } from "./strip.mjs";
const model = process.argv[2], files = process.argv.slice(3);
const tree = fs.readFileSync(new URL("./topic-tree.txt", import.meta.url), "utf8");
const SYS = `You tag finished work sessions on a web-framework repo, so they can be found later. You get the repo's module list and topic list, then one or more stripped transcripts (owner prompts, assistant text, files edited), each under a "=== SESSION <id> ===" line.
Reply with ONE JSON array and nothing else, one object per session, in order:
{"id":"<id>","summary":"2 sentences: what was actually done, not what was asked","modules":["directories from MODULE PATHS, the deepest one that holds the real work; skip logs, task files and readmes touched in passing"],"topics":["up to 6 from TOPICS"],"new_topics":["up to 3 short concept words not in TOPICS"],"owner_asks":["up to 3 short paraphrases of what the owner asked for"],"confidence":"high|medium|low"}
"page" means the Page class (core/Page) only when the work is about the page system; a page someone built is tagged by its own module. Tag substance, not routine upkeep.`;
let body = ""; const meta = [];
for (const f of files) { const s = strip(f); let t = s.text; if (t.length > 90000) t = t.slice(0, 60000) + "\n[...middle cut...]\n" + t.slice(-25000); const id = path.basename(f, ".jsonl"); meta.push({ id, chars: t.length, files: s.nfiles }); body += `\n=== SESSION ${id} ===\n${t}\n`; }
const t0 = Date.now();
const r = spawnSync("C:/Users/mike/.local/bin/claude.exe", ["-p", "--model", model, "--effort", "low", "--tools", "", "--no-session-persistence", "--output-format", "json", "--disable-slash-commands", "--strict-mcp-config", "--setting-sources", "local", "--system-prompt", SYS],
  { input: `${tree}\n${body}`, encoding: "utf8", shell: false, maxBuffer: 1e8, cwd: process.env.TEMP, env: { ...process.env, CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1", MAX_THINKING_TOKENS: "0", DISABLE_PROMPT_CACHING: "1" } });
let j; try { j = JSON.parse(r.stdout); } catch { console.log("RAW", r.stdout?.slice(0, 600), r.stderr?.slice(0, 600)); process.exit(1); }
const mu = Object.entries(j.modelUsage || {}).map(([k, v]) => ({ k, in: v.inputTokens, out: v.outputTokens, usd: +v.costUSD.toFixed(4) }));
console.log(JSON.stringify({ sessions: files.length, secs: (Date.now() - t0) / 1000, usd: +j.total_cost_usd.toFixed(4), mu, meta }));
console.log(j.result);
fs.writeFileSync(new URL("./out2.json", import.meta.url), JSON.stringify({ meta, result: j.result, usd: j.total_cost_usd }));
