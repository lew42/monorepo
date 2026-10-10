// Chunks the owner's prompts from raw session files for ONE day into pieces of ~30k tokens (120k chars), well under Haiku's 100k line.
// Usage: node chunk-sessions.mjs <YYYY-MM-DD> <outDir>   (reads ~/.claude/projects/<repo>/*.jsonl; writes chunkNN.txt + chunks.json; prints a summary)
import fs from "fs"; import path from "path"; import os from "os";
const [day, out] = process.argv.slice(2);
const dir = path.join(os.homedir(), ".claude", "projects", "C--Code-lew42-monorepo");
const MAX = 120000; fs.mkdirSync(out, { recursive: true });
const text = m => typeof m === "string" ? m : Array.isArray(m) ? m.filter(b => b.type === "text").map(b => b.text).join("\n") : "";
const prompts = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".jsonl"))) {
	const p = path.join(dir, f);
	if (fs.statSync(p).mtime.toISOString().slice(0, 10) < day) continue;
	for (const l of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
		if (!l) continue; let o; try { o = JSON.parse(l) } catch { continue }
		if (o.type !== "user" || !(o.timestamp || "").startsWith(day) || o.isSidechain) continue;
		const t = text(o.message?.content).trim();
		if (!t || t.startsWith("<system-reminder") || t.startsWith("[from:") || t.startsWith("[You are") || t.startsWith("<command")) continue;
		prompts.push({ session: f.replace(".jsonl", ""), at: o.timestamp, t: t.slice(0, 3000) });
	}
}
prompts.sort((a, b) => b.at.localeCompare(a.at));
let n = 0, cur = "", count = 0; const idx = [];
const flush = () => { if (cur) { n++; fs.writeFileSync(path.join(out, `chunk${String(n).padStart(2, "0")}.txt`), cur); idx.push({ chunk: n, prompts: count, chars: cur.length }); cur = ""; count = 0 } };
for (const p of prompts) { const s = `### ${p.session} ${p.at}\n${p.t}\n\n`; if (cur.length + s.length > MAX) flush(); cur += s; count++ }
flush(); fs.writeFileSync(path.join(out, "chunks.json"), JSON.stringify(idx));
console.log(day, prompts.length, "prompts,", idx.length, "chunks", JSON.stringify(idx));
