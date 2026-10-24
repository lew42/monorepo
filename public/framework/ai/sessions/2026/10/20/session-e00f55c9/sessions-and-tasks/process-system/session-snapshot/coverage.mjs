// node coverage.mjs <session folder>: how many of a session's owner prompts have a linked task, and how the task titles read (2026-10-23).
import fs from "fs";
const S = process.argv[2];
const P = fs.readFileSync(S + "/prompts.jsonl", "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const prompts = new Map();
for (const l of P){ const p = prompts.get(l.prompt) ?? { id: l.prompt, at: l.at, stages: new Set(), asks: 0, words: 0 }; p.stages.add(l.stage); if (l.text) p.words = l.text.split(/\s+/).length; if (l.parts){ const walk = ps => ps.forEach(x => { if (x.kind === "ask") p.asks++; if (x.parts) walk(x.parts); }); walk(l.parts); } prompts.set(l.prompt, p); }
// tasks with a source.prompt, in the session log and in any task file below the folder
const linked = new Map(), titles = [];
const scan = f => { for (const l of fs.readFileSync(f, "utf8").split("\n")){ if (!l.includes('"prompt"')) continue; let j; try { j = JSON.parse(l); } catch { continue; }
	const add = j?.tasks?.add ?? (j?.add?.type === "Task" ? j.add : null); const src = add?.source?.prompt; if (src){ linked.set(src, (linked.get(src) ?? 0) + 1); titles.push([add.title, add.state]); } } };
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })){ const f = d + "/" + e.name; if (e.isDirectory()) walk(f); else if (/^(session|task)\.jsonl$/.test(e.name)) scan(f); } };
walk(S);
const all = [...prompts.values()], withTask = all.filter(p => linked.has(p.id)), finals = all.filter(p => p.stages.has("final") || p.words);
console.log("prompts", all.length, "| with final text", finals.length, "| with >=1 linked task", withTask.length, "| tasks linked", [...linked.values()].reduce((a, b) => a + b, 0));
console.log("finals without a task:", finals.filter(p => !linked.has(p.id)).length, "| asks split by the parts step:", all.reduce((s, p) => s + p.asks, 0));
const noTask = finals.filter(p => !linked.has(p.id)).slice(0, 8);
const textOf = id => (P.find(l => l.prompt === id && l.text)?.text ?? P.find(l => l.prompt === id && l.subject)?.subject ?? "").slice(0, 90).replace(/\s+/g, " ");
console.log("examples without a task:\n" + noTask.map(p => " - " + p.at.slice(0, 16) + " " + textOf(p.id)).join("\n"));
const st = {}; titles.forEach(([, s]) => st[s] = (st[s] ?? 0) + 1); console.log("linked task states at creation", st);
const long = titles.filter(([t]) => (t ?? "").length > 120).length; console.log("titles over 120 chars (copied sentences, not outcomes):", long, "of", titles.length);
console.log("sample titles:\n" + titles.slice(-6).map(([t]) => " - " + String(t).slice(0, 110)).join("\n"));
const live = finals.filter(p => p.at >= "2026-10-23T04");
console.log("live prompts (after the 02:00 backfill):", live.length, "| with a task:", live.filter(p => linked.has(p.id)).length);
console.log("live without a task:\n" + live.filter(p => !linked.has(p.id)).map(p => " - " + p.at.slice(0, 16) + " " + textOf(p.id)).join("\n"));
