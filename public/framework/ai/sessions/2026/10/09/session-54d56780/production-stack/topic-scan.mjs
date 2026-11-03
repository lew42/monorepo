// Topic scan: finds the owner's own prompts about a topic across ALL past sessions.
// Run: node topic-scan.mjs <out.md> keyword [keyword...]   e.g. node topic-scan.mjs hits.md cloudflare wrangler "durable object" login stripe
// Reads ~/.claude/projects/<repo>/*.jsonl (never loaded into a model); prints counts, writes one markdown line per hit:
// date | session link | the matching sentence | path tags (module paths named in that prompt).
import fs from "fs"; import path from "path"; import os from "os";
const [out, ...words] = process.argv.slice(2);
if (!out || !words.length) { console.log("usage: node topic-scan.mjs <out.md> keyword [keyword...]"); process.exit(1) }
const dir = path.join(os.homedir(), ".claude", "projects", "C--Code-lew42-monorepo");
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const re = new RegExp("(?<![A-Za-z])(" + words.map(esc).join("|") + ")", "i");
const text = m => typeof m === "string" ? m : Array.isArray(m) ? m.filter(b => b.type === "text").map(b => b.text).join("\n") : "";
// A module path named in a prompt: public/framework/ext/Refine, ext/Refine, core/Page, Servex/..., Server/...
const PATH = /(?:public\/)?(?:framework\/)?\b((?:ext|core|ux|ui|ai|styles)\/[A-Za-z0-9_-]+)|\b(Servex|Server|worker)\/(?:[A-Za-z0-9_.-]+)?|\/(imagine\/[a-z-]+|notes\/[a-z-]+)/g;
const tags = t => { const s = new Set(); for (const m of t.matchAll(PATH)) s.add(m[1] ? "/framework/" + m[1] + "/" : m[2] ? "/" + (m[2] === "worker" ? "worker" : "framework/" + m[2].toLowerCase()) + "/" : "/" + m[3] + "/"); return [...s] };
const hits = [], once = new Set(); let prompts = 0, sessions = new Set();
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".jsonl"))) {
	let first = true;
	for (const l of fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/)) {
		if (!l) continue; let o; try { o = JSON.parse(l) } catch { continue }
		if (o.type !== "user" || o.isSidechain) continue;
		let t = text(o.message?.content).trim();
		if (first && t) { first = false; if (/^\[You are/.test(t)) break }   // a Servex agent's session: prompts are briefs, not the owner
		if ((o.origin?.kind && o.origin.kind !== "human") || /^<task-notification/.test(t)) continue;   // agent results fed back as user messages
		if (o.entrypoint === "sdk-ts" && o.origin?.kind !== "human") continue;                         // Servex-spawned agents' briefs
		if (t.length > 30000 || /^(This session is being continued|Your session id|Base directory for)/.test(t)) continue;   // compaction summaries and injected skills, not the owner
		if (!t || /^(<system-reminder|<command|<local-command|\[You are|\[from:|Caveat:|\[Request interrupted)/.test(t)) continue;
		t = t.replace(/^Where you are:[\s\S]*?\n\n(?=[^\n]*\S)/, m => m.length > 4000 ? "" : m);   // readme preamble, not the owner's words
		prompts++;
		const seen = new Set();
		for (const s of t.split(/(?<=[.!?])\s+|\n+/)) {
			if (s.length < 15 || s.length > 600 || !re.test(s) || seen.has(s) || once.has(s) || /^[-*#\s]*\*\*/.test(s)) continue;
			once.add(s);
			seen.add(s); sessions.add(f);
			hits.push({ at: (o.timestamp || "").slice(0, 10), id: f.replace(".jsonl", ""), s: s.replace(/\|/g, "\\|").trim(), tags: tags(t) });
			if (seen.size >= 3) break;   // at most 3 sentences per prompt
		}
	}
}
hits.sort((a, b) => a.at.localeCompare(b.at));
const rows = hits.map(h => `| ${h.at} | [${h.id.slice(0, 8)}](/framework/ai/sessions/${h.id}/) | ${h.s} | ${h.tags.map(t => `[${t}](${t})`).join(" ") || "-"} |`);
fs.writeFileSync(out, `# Topic scan: ${words.join(", ")}\n\n${hits.length} sentences from ${sessions.size} sessions (of ${prompts} owner prompts scanned).\n\n| date | session | the owner's sentence | path tags |\n|---|---|---|---|\n${rows.join("\n")}\n`);
console.log(`${hits.length} hits, ${sessions.size} sessions, ${prompts} prompts -> ${out}`);
