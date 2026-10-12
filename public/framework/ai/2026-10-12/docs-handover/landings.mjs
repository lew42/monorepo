// Prints one line per ai/2026-10-12/* task, computed from its task.jsonl (never retyped).
import fs from "fs"; import path from "path";
const day = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")).replace(/[\/][^\/]+$/, "");
const rows = [];
for (const d of fs.readdirSync(day, { withFileTypes: true }).filter(x => x.isDirectory())) {
	const f = path.join(day, d.name, "task.jsonl"); if (!fs.existsSync(f)) continue;
	let landed = null, last = null;
	for (const l of fs.readFileSync(f, "utf8").split("\n")) { if (!l.trim()) continue; let o; try { o = JSON.parse(l); } catch { continue; }
		if (o.assign?.landed_at && o.assign.outcome) landed = o.assign; if (o.log?.msg) last = o.log; }
	const first = s => (s || "").split("\n").find(x => x.trim() && !x.startsWith("- [")).replace(/\*\*/g, "").slice(0, 150);
	rows.push(landed ? `- ✅ [${d.name}](/framework/ai/2026-10-12/${d.name}/STATE.md): ${first(landed.outcome)}`
		: `- ⬜ ${d.name}: not landed${last ? ` (last log ${last.at.slice(11, 16)})` : ""}`);
}
console.log(rows.join("\n"));
