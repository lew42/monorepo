// find-writes.mjs — every transcript tool_use (any tool) whose input names one of the lost cards,
// with its result; read-only, prints a compact list.
import fs from "node:fs"; import path from "node:path"; import readline from "node:readline";
const DIR = "C:/Users/mike/.claude/projects/C--Code-lew42-monorepo";
const ids = process.argv.slice(2);
const since = Date.parse("2026-10-01T00:00:00-05:00");
const out = [];
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith(".jsonl"))){
	const file = path.join(DIR, f); if (fs.statSync(file).mtimeMs < since) continue;
	const calls = new Map();
	const rl = readline.createInterface({ input: fs.createReadStream(file, "utf8"), crlfDelay: Infinity });
	for await (const raw of rl){
		if (!ids.some(id => raw.includes(id.split("/").pop()))) { if (!raw.includes("tool_result")) continue; }
		let o; try { o = JSON.parse(raw); } catch { continue; }
		for (const c of (Array.isArray(o.message?.content) ? o.message.content : [])){
			if (c.type === "tool_use"){ const s = JSON.stringify(c.input); const hit = ids.find(id => s.includes(id.split("/").pop()));
				if (hit){ const e = { session: f.slice(0, 8), at: o.timestamp, tool: c.name, hit: hit.split("/").pop().slice(0, 14), input: s.slice(0, 400) }; calls.set(c.id, e); out.push(e); } }
			else if (c.type === "tool_result" && calls.has(c.tool_use_id)){ const r = typeof c.content === "string" ? c.content : (c.content ?? []).map(x => x.text ?? "").join(""); calls.get(c.tool_use_id).result = r.slice(0, 200); }
		}
	}
}
out.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname.slice(1)), "writes.json"), JSON.stringify(out, null, 1));
for (const e of out) if (!/^(Read|Grep|Glob)$/.test(e.tool)) console.log(e.at, e.session, e.tool, e.hit, "|", e.input.slice(0, 160).replace(/\n/g, " "));
