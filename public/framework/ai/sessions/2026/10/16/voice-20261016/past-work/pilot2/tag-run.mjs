// Round 4 step 4: fill the empty `tags` of each session (newest first). Procedural tags first (AISessionDigest.tags), then a bounded Haiku pass for topic/sub-topic tags.
// Tags are appended to the session's session.jsonl through AISession.log (the one writer); a session that already has tags is skipped.   node tag-run.mjs [days=3] [capUsd=1] [--dry]
import fs from "node:fs"; import path from "node:path";
import { AISessionDigest as D } from "../../../../../../../AISession/AISessionDigest.mjs";
import AISessionIndex from "../../../../../../../AISession/AISessionIndex.mjs";
import AISession from "../../../../../../../AISession/AISession.js";
import { haiku, json, spent } from "./haiku.mjs";
const days = +process.argv[2] || 3, cap = +process.argv[3] || 1, dry = process.argv.includes("--dry"), BY = "digest-pipeline", start = spent(), BATCH = 25;
const dirs = new Map((await new AISessionIndex({ log() {} }).session_dirs()).map(d => [d.id, d.dir]));
const ds = D.all(days).filter(d => dirs.has(d.id)).sort((a, b) => (b.last || "").localeCompare(a.last || ""));   // newest first
const todo = []; for (const d of ds) { const rec = await AISession.record(d.id); if (!rec.tags.length) todo.push(d); }
const n = { sessions: ds.length, empty_tags: todo.length, procedural_lines: 0, haiku_lines: 0, haiku_calls: 0, haiku_sessions: 0, failed: 0 };
const put = async (d, tag) => { if (dry) return; await AISession.log(d.id, { tag: tag.toLowerCase().replace(/[^a-z0-9/_.-]+/g, "-").slice(0, 40) }, BY); };
const SYS = `You tag Claude Code work sessions for a search index. For each session you get an id, the owner's first words, the session's final message, and the modules it edited. Reply with ONLY a JSON object {"<id>": ["topic/sub", ...]}. 1 to 3 tags per session, each "topic/subtopic" in lowercase kebab-case, at most 30 characters, naming WHAT the session is about (for example chat/dedup, page/live-cards, cost/accounting, dictation/whisper, servex/gate, docs/readme). Reuse the same topic word for the same subject across sessions. An empty list [] is correct when the session has no real subject (a greeting, an empty or mechanical run). No prose.`;
const vocab = new Set();
// procedural first, for every session
for (const d of todo) for (const t of d.tags()) { await put(d, t); n.procedural_lines++; }
// Haiku pass: sessions with an owner prompt or a result, newest first, in small inlined batches (well under 100k tokens)
const hs = todo.filter(d => d.prompts.length || d.result);
for (let i = 0; i < hs.length; i += BATCH) {
	if (spent() - start >= cap) { console.log("Haiku cap reached"); break; }
	const batch = hs.slice(i, i + BATCH), clip = (s, k) => (s || "").replace(/\s+/g, " ").slice(0, k);
	const input = (vocab.size ? "Topics already used (reuse when they fit): " + [...vocab].slice(-40).join(", ") + "\n\n" : "") + batch.map(d => JSON.stringify({ id: d.id.slice(0, 8), owner: clip(d.prompts[0]?.t, 260), result: clip(d.result, 220), edited: [...new Set(d.edited.map(f => f.split("/").slice(0, 4).join("/")))].slice(0, 4) })).join("\n");
	let out; try { const r = haiku(SYS, input, { cap: start + cap }); out = json(r.text); n.haiku_calls++; } catch (e) { n.failed++; console.log("batch failed:", String(e.message).slice(0, 120)); continue; }
	for (const d of batch) { const tags = (out[d.id.slice(0, 8)] || []).filter(t => typeof t === "string" && /^[a-z0-9][a-z0-9/_.-]*$/i.test(t)).slice(0, 3); if (tags.length) n.haiku_sessions++; for (const t of tags) { await put(d, t); vocab.add(t); n.haiku_lines++; } }
}
n.haiku_usd = +(spent() - start).toFixed(4);
console.log(JSON.stringify(n)); console.log("vocabulary:", [...vocab].sort().join(" "));
