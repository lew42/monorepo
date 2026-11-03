// For each session file touched on/after <day>, list the files it created/edited (Edit/Write/NotebookEdit tool calls) and pick 2-3 "core" ones.
// Core = a module's real code (not dated task dirs, jsonl logs, scratch). Score: files edited most, then under core/ ext/ ux/ Servex/ Server/.
// Usage: node core-links.mjs <YYYY-MM-DD> <out.json>. Reads session files by script; resumes nothing, sends nothing.
import fs from "fs"; import path from "path"; import os from "os";
const [day, out] = process.argv.slice(2);
const proj = path.join(os.homedir(), ".claude", "projects");
const files = fs.readdirSync(proj).flatMap(d => { try { return fs.readdirSync(path.join(proj, d)).filter(f => f.endsWith(".jsonl")).map(f => path.join(proj, d, f)) } catch { return [] } });
const root = "C:/Code/lew42/monorepo/";
const skip = /\/ai\/20\d\d-|\.jsonl$|\/node_modules\/|\/\.claude\/|AppData|\/doc\/|\/topics\/|scratch/i;
const weight = f => (/\/(core|ext|ux|audio|dev)\//.test(f) ? 3 : /^(Servex|Server)\//.test(f) ? 3 : 1) + (/\.(js|mjs|css)$/.test(f) ? 1 : 0);
const res = [];
for (const p of files) {
	const f = path.basename(p);
	if (fs.statSync(p).mtime.toISOString().slice(0, 10) < day) continue;
	const edits = new Map(); let first = "", last = "";
	for (const l of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
		if (!l.includes("file_path")) continue;
		let o; try { o = JSON.parse(l) } catch { continue }
		if (!(o.timestamp || "").startsWith(day) && (o.timestamp || "") < day) continue;
		for (const b of o.message?.content || []) {
			if (b.type !== "tool_use" || !/^(Edit|Write|NotebookEdit)$/.test(b.name)) continue;
			let fp = String(b.input?.file_path || "").replace(/\\/g, "/");
			if (fp.startsWith(root)) fp = fp.slice(root.length); else fp = fp.replace(/^C:\/Code\/lew42\/worktrees\/[^\/]+\//, "");
			if (!fp || fp.startsWith("/") || /^[A-Za-z]:/.test(fp) || skip.test("/" + fp)) continue;
			edits.set(fp, (edits.get(fp) || 0) + 1); first = first || o.timestamp; last = o.timestamp;
		}
	}
	if (!edits.size) continue;
	const core = [...edits].map(([file, n]) => ({ file, n, score: n * weight(file) })).sort((a, b) => b.score - a.score).slice(0, 3);
	res.push({ session: f.replace(".jsonl", ""), first, last, files: edits.size, core: core.map(c => "/" + c.file) });
}
res.sort((a, b) => b.last.localeCompare(a.last));
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log(res.length, "sessions with edits since", day);
for (const r of res.slice(0, 8)) console.log(r.session.slice(0, 8), r.files, r.core.join(" "));
