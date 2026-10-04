// day-audit.mjs — every owner ask routed today: is it written down (brief), is it tracked (task log),
// did it land, and what's left. Computed from ai/asks.jsonl and the task dirs (law 7).
//   node public/framework/ai/2026-10-03/day-audit/day-audit.mjs [YYYY-MM-DD]
import fs from "node:fs";
import path from "node:path";

const day = process.argv[2] ?? "2026-10-03";
const AI = path.join(process.cwd(), "public/framework/ai");
const lines = fs.readFileSync(path.join(AI, "asks.jsonl"), "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l).ask; } catch { return null; } }).filter(Boolean);

const slug = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48).replace(/-$/, "");
const asks = new Map();
for (const a of lines){
	// Servex's ledger tick later writes status lines keyed by a slug of the title: fold them in.
	const key = slug(a.title ?? a.id ?? "") || a.id;
	if (!key) continue;
	const prev = asks.get(key) ?? {};
	asks.set(key, { ...prev, ...a, title: prev.title ?? a.title, owner: prev.owner ?? a.owner, words: prev.words ?? a.words, first_at: prev.first_at ?? a.at });
}

const rows = [];
for (const [key, a] of asks){
	if (!String(a.first_at ?? a.at ?? "").startsWith(day) || !a.title) continue;
	const brief = a.words && fs.existsSync(path.join(AI, "..", a.words)) ? a.words : null;
	const dir = brief ? path.dirname(path.join(AI, "..", a.words)) : null;
	const log = dir && fs.existsSync(path.join(dir, "task.jsonl")) ? fs.readFileSync(path.join(dir, "task.jsonl"), "utf8") : "";
	const landed = /"landed_at"/.test(log);
	const outcome = landed ? (log.match(/"outcome":"((?:[^"\\]|\\.){0,160})/)?.[1] ?? "") : "";
	rows.push({
		title: a.title ?? key,
		owner: a.owner ?? "",
		status: a.status ?? "",
		brief: brief ? "yes" : "no",
		log: log ? "yes" : "no",
		landed: landed ? "yes" : "no",
		dir: dir ? path.relative(AI, dir).replaceAll("\\", "/") : "",
		outcome: outcome.replace(/\\n/g, " ").replace(/\*\*/g, ""),
	});
}

fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), `audit-${day}.json`), JSON.stringify(rows, null, 1));
for (const r of rows) console.log([r.landed === "yes" ? "LANDED " : r.status.padEnd(7).slice(0, 7), r.brief === "yes" ? "brief" : "NO-BRIEF", r.log === "yes" ? "log" : "no-log", r.title.slice(0, 90), "|", r.owner].join("  "));
console.log(`\n${rows.length} asks · ${rows.filter(r => r.landed === "yes").length} landed · ${rows.filter(r => r.brief === "no").length} without a brief`);
