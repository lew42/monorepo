// Pure-Node, no AI: pull the owner's prompts + the final result out of every real Claude SDK transcript, then keyword-tag it.
// node extract.mjs [days]   (days = only transcripts modified in the last N days; default all)  -> writes extract.json next to this file's TEMP copy
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const ROOT = path.join(os.homedir(), ".claude", "projects");
const OUT = path.join(process.env.TEMP || os.tmpdir(), "pw", "extract.json");
const days = +process.argv[2] || 0;

// machine pipeline calls (dictation cleaners, outliners, judges): skip entirely
const MACHINE = /^(You clean up|Read this numbered|Current outline|The prompt, one numbered|You are cleaning|Turn this outline|These sentences|You judge|You are reading prompts|Call the SendMessage)/;
// text a harness or Servex injects into the user turn: not the owner's words
const NOISE = /^(This session is being continued|\[Request interrupted|Stop hook feedback|\[Image|\[Servex|<task|<command-|<local-command|Caveat:|Base directory for this skill|\[from |Current outline|The user hasn't heard|Original image)/i;
const BRIEF = /^(Where you are|You are |Load the |Your brief)/;   // a Servex-written brief: keep a short head, it names the task

function extract(file) {
	const prompts = []; let result = "", first = "", last = "", raw = 0; const files = new Set(); let head = "", agent = "", task = "";
	const txt = fs.readFileSync(file, "utf8"); raw = txt.length;
	for (const line of txt.split("\n")) {
		if (line.charCodeAt(0) !== 123) continue;
		let o; try { o = JSON.parse(line); } catch { continue; }
		if (o.timestamp) { first ||= o.timestamp; last = o.timestamp; }
		const m = o.message; if (!m) continue; const c = m.content;
		if (o.type === "user") {
			if (o.toolUseResult) continue;
			const parts = typeof c === "string" ? [c] : (c || []).filter(b => b.type === "text").map(b => b.text);
			for (let t of parts) {
				t = t.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "").trim();
				if (!t) continue; head ||= t;
				if (NOISE.test(t)) continue;
				const ag = t.match(/^\[You are Servex agent ([^\].\s]+)/); if (ag) { agent ||= ag[1]; prompts.push({ brief: true, t: "agent " + ag[1] }); continue; }
					if (BRIEF.test(t)) {   // a brief: keep its last 500 chars (the task is at the end) and the task folder it names
						const w = t.replace(/\s+/g, " ");
						task ||= (w.match(/public\/framework\/ai\/(?:sessions\/\d{4}\/\d\d\/\d\d\/[\w.-]+(?:\/[\w.-]+)*|\d{4}-\d\d-\d\d\/[\w.-]+)/) || [""])[0];
						prompts.push({ brief: true, t: w.length > 500 ? w.slice(-500) : w }); continue;
					}
				prompts.push({ t: t.length > 1200 ? t.slice(0, 900) + " … " + t.slice(-250) : t });
			}
		} else if (o.type === "assistant" && Array.isArray(c)) {
			const tx = c.filter(b => b.type === "text" && b.text.trim()).map(b => b.text.trim()).join("\n");
			if (tx) result = tx;                                    // keep only the LAST assistant text: the final result
			for (const b of c) if (b.type === "tool_use" && /^(Edit|Write|MultiEdit|NotebookEdit)$/.test(b.name)) { const p = b.input?.file_path; if (p) files.add(String(p).replace(/\\/g, "/").replace(/^.*?(?:monorepo|worktrees\/[^/]+)\//, "")); }
		}
	}
	return { agent, task, head, prompts, result: result.length > 1500 ? result.slice(0, 1500) + " …" : result, files: [...files], first, last, raw };
}

const rows = [];
for (const d of fs.readdirSync(ROOT)) {
	const dir = path.join(ROOT, d); let es; try { es = fs.readdirSync(dir); } catch { continue; }
	for (const f of es) if (f.endsWith(".jsonl")) { const p = path.join(dir, f), st = fs.statSync(p); if (days && st.mtimeMs < Date.now() - days * 864e5) continue; if (st.size > 60e6) continue; rows.push({ p, id: f.slice(0, -6), mtime: st.mtimeMs }); }
}
const t0 = Date.now(), out = [];
for (const r of rows) {
	const e = extract(r.p); if (MACHINE.test(e.head)) continue;
	const own = e.prompts.filter(p => !p.brief), brief = e.prompts.find(p => p.brief);
	const text = [brief?.t, ...own.map(p => p.t), e.result].filter(Boolean).join("\n");
	out.push({ id: r.id, mtime: r.mtime, first: e.first, last: e.last, raw: e.raw, agent: e.agent, task: e.task, nown: own.length, brief: !!brief, files: e.files, head: e.head.replace(/\s+/g, " ").slice(0,70), chars: text.length, text });
}
fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(out));
const q = (a, p) => a[Math.min(a.length - 1, Math.floor(a.length * p))], ch = out.map(r => r.chars).sort((a, b) => a - b);
console.log(JSON.stringify({ transcripts: rows.length, real: out.length, secs: (Date.now() - t0) / 1000, extractedMB: +(ch.reduce((s, x) => s + x, 0) / 1e6).toFixed(1),
	medianChars: q(ch, .5), p90Chars: q(ch, .9), maxChars: ch.at(-1), noPromptNoBrief: out.filter(r => !r.nown && !r.brief).length, briefOnly: out.filter(r => !r.nown && r.brief).length, withOwnPrompt: out.filter(r => r.nown).length, wrote: OUT }, null, 1));
