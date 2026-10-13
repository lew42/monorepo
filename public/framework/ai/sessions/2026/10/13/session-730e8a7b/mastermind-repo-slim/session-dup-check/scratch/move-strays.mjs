// Moves the two stray old-style day folders into the sessions store; manifest + ledger lines (task-moves.jsonl format). --apply to run.
import fs from "node:fs"; import path from "node:path";
const AI = "public/framework/ai", apply = process.argv.includes("--apply"), at = new Date().toISOString();
const moves = ["crawl", "feedback-council"].map(s => ({ kind: "task", from: `${AI}/2026-10-13/${s}`, to: `${AI}/sessions/2026/10/13/${s}`, session: null }));
for (const m of moves) {
	if (!fs.existsSync(m.from)) { console.log("skip (gone)", m.from); continue; }
	if (fs.existsSync(m.to)) { console.log("skip (target exists)", m.to); continue; }
	console.log(apply ? "move" : "would move", m.from, "->", m.to);
	if (apply) { fs.mkdirSync(path.dirname(m.to), { recursive: true }); fs.renameSync(m.from, m.to); fs.appendFileSync(`${AI}/sessions/task-moves.jsonl`, JSON.stringify({ at, ...m }) + "\n"); }
}
if (apply) fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname.slice(1)), "stray-manifest.json"), JSON.stringify({ at, moves }, null, 1));
