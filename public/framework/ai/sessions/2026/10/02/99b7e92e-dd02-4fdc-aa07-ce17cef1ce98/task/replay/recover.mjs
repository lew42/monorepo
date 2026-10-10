// recover.mjs — put back the files the 22:36 rm -rf removed from the main tree, never touching
// a path that exists now. Two phases:
//   node recover.mjs scan      read every claude transcript once → ops.json (each write to a
//                              deleted path: Write, Edit, MultiEdit, heredoc, append.mjs, dir_log,
//                              plus full Read snapshots), in time order
//   node recover.mjs apply [--dry]   targets.json (every file to restore), choose a source per
//                              path (exact transcript replay > worktree copy > partial replay),
//                              write with flag "wx", record one line per target in ../recovered.jsonl
// Nothing is ever deleted or overwritten. Card page.jsonl under ai/2026/10/ is the cards pass's.
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { execFileSync } from "node:child_process";

const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const TASK = path.resolve(here, "..");
const REPO = path.resolve(TASK, "../../../../..");
const PROJECTS = "C:/Users/mike/.claude/projects/C--Code-lew42-monorepo";
const CUTOFF = Date.parse("2026-10-01T22:36:00-05:00");
const TEMP = (process.env.TEMP ?? "C:/Users/mike/AppData/Local/Temp").replace(/\\/g, "/");
const NL = String.fromCharCode(10);
const LOCAL = (process.env.LOCALAPPDATA ?? "C:/Users/mike/AppData/Local").replace(/\\/g, "/");

// ---- what was deleted
const entries = fs.readFileSync(path.join(TASK, "deleted-paths.txt"), "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
const fileEntries = new Set(entries.filter(e => !e.endsWith("/")));
const dirEntries = entries.filter(e => e.endsWith("/"));
const EXCLUDE_DIRS = ["public/framework/ai/2026/09/30/openrouter-does-our-harness-run-through/"];
function deleted(rel){
	if (!rel || EXCLUDE_DIRS.some(d => rel.startsWith(d))) return false;
	return fileEntries.has(rel) || dirEntries.some(d => rel.startsWith(d));
}
function skipReason(rel){
	const base = path.posix.basename(rel);
	if (rel === "nul") return "skipped-generated";
	if (base === "files.jsonl") return "skipped-generated";
	if (base === "page.jsonl" && !rel.startsWith("public/framework/ai/2026/")) return "skipped-generated";
	if (base === "page.jsonl" && rel.startsWith("public/framework/ai/2026/10/")) return "cards-pass";
	return null;
}

// ---- path normalization: anything naming the main tree → repo-relative ("" if not main)
const MAIN = REPO.replace(/\\/g, "/").toLowerCase();
function rel(p, cwd){
	if (!p) return null;
	let s = String(p).trim().replace(/^["']|["']$/g, "").replace(/\\/g, "/");
	s = s.replace(/^\/([a-z])\//i, (_, d) => `${d}:/`);              // /c/Code → c:/Code
	if (!/^[a-z]:\//i.test(s)){
		if (!cwd) return null;
		s = path.posix.join(String(cwd).replace(/\\/g, "/").replace(/^\/([a-z])\//i, (_, d) => `${d}:/`), s);
	}
	s = path.posix.normalize(s);
	if (!s.toLowerCase().startsWith(MAIN + "/")) return null;
	return s.slice(MAIN.length + 1);
}
const absAny = (p, cwd) => {   // any absolute path (scratch files), normalized lower-case key
	if (!p) return null;
	let s = String(p).trim().replace(/^["']|["']$/g, "").replace(/\\/g, "/").replace(/^\/([a-z])\//i, (_, d) => `${d}:/`);
	if (!/^[a-z]:\//i.test(s)){ if (!cwd) return null; s = path.posix.join(String(cwd).replace(/\\/g, "/"), s); }
	return path.posix.normalize(s).toLowerCase();
};

// ---- a tiny shell reader: variable assignments, cd, heredocs, append.mjs
function expand(s, vars){
	return s.replace(/\$\{(\w+)\}|\$(\w+)/g, (m, a, b) => { const k = a ?? b; return vars[k] ?? (k === "TEMP" || k === "TMP" ? TEMP : k === "LOCALAPPDATA" ? LOCAL : k === "CLAUDE_PROJECT_DIR" ? REPO : m); });
}
function shellOps(cmd, cwd0){
	const out = [], vars = {};
	let cwd = cwd0;
	// heredoc bodies, cut out first so their text is not read as commands
	const docs = [];
	const text = cmd.replace(/<<-?\s*(['"]?)(\w+)\1([^\n]*)\n([\s\S]*?)\n\2(?=\n|$)/g, (m, q, tag, rest, body) => { docs.push(body + "\n"); return `<<HEREDOC${docs.length - 1}${rest}`; });
	for (const raw of text.split(/\n|&&|;(?!;)/)){
		const st = raw.trim();
		let m;
		if ((m = st.match(/^(?:export\s+)?(\w+)=("([^"]*)"|'([^']*)'|(\S*))$/))){ vars[m[1]] = expand(m[3] ?? m[4] ?? m[5] ?? "", vars); continue; }
		if ((m = st.match(/^cd\s+("[^"]+"|'[^']+'|\S+)/))){ const to = expand(m[1].replace(/^["']|["']$/g, ""), vars); cwd = /^([a-z]:|\/)/i.test(to) ? to : path.posix.join(cwd ?? "", to); continue; }
		// cat > file <<HEREDOCn   /  cat >> file <<HEREDOCn  / tee
		if ((m = st.match(/^cat\s+(>>?)\s*("[^"]+"|'[^']+'|\S+)\s*<<HEREDOC(\d+)/)) || (m = st.match(/^cat\s+<<HEREDOC(\d+)\s*(>>?)\s*("[^"]+"|'[^']+'|\S+)/))){
			const [op, file, n] = m[0].startsWith("cat <<") ? [m[2], m[3], m[1]] : [m[1], m[2], m[3]];
			out.push({ kind: op === ">>" ? "append_text" : "write", file: expand(file, vars), cwd, body: docs[+n] });
			continue;
		}
		if ((m = st.match(/append\.mjs\s+("[^"]+"|'[^']+'|\S+)\s+("[^"]+"|'[^']+'|\S+)/))){
			out.push({ kind: "append_mjs", file: expand(m[1], vars), lines: expand(m[2], vars), cwd });
			continue;
		}
		if ((m = st.match(/^printf\s+'%s'\s+'([^']*)'\s*>\s*("[^"]+"|\S+)$/))){ out.push({ kind: "write", file: expand(m[2], vars), cwd, body: m[1] }); continue; }
		if ((m = st.match(/^echo\s+'([^']*)'\s*>\s*("[^"]+"|\S+)$/))){ out.push({ kind: "write", file: expand(m[2], vars), cwd, body: m[1] + "\n" }); continue; }
	}
	return out;
}

// ---- phase 1: scan the transcripts
async function scan(){
	const files = [];
	const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })){ const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith(".jsonl")) files.push(p); } };
	walk(PROJECTS);
	const ops = [];
	let n = 0;
	for (const file of files){
		n++;
		if (fs.statSync(file).mtimeMs < Date.parse("2026-09-20T00:00:00Z")) continue;   // the deleted files are all from 09-21 on
		const session = path.basename(file, ".jsonl");
		const pending = new Map();      // tool_use_id -> op[]
		const scratch = new Map();      // abs path -> last text written (lines.json for append.mjs)
		const rl = readline.createInterface({ input: fs.createReadStream(file, "utf8"), crlfDelay: Infinity });
		for await (const raw of rl){
			const isUse = raw.includes('"tool_use"'), isRes = raw.includes('"tool_result"');
			if (!isUse && !isRes) continue;
			if (isRes && !isUse){
				const ids = [...raw.matchAll(/"tool_use_id":"([^"]+)"/g)].map(m => m[1]);
				if (!ids.some(id => pending.has(id))) continue;
			}
			let o; try { o = JSON.parse(raw); } catch { continue; }
			const at = Date.parse(o.timestamp);
			if (!(at <= CUTOFF)) continue;
			const cwd = o.cwd;
			for (const c of Array.isArray(o.message?.content) ? o.message.content : []){
				if (c.type === "tool_use"){
					const i = c.input ?? {}, mine = [];
					if (c.name === "Write"){
						const r = rel(i.file_path, cwd); const k = absAny(i.file_path, cwd);
						if (k && typeof i.content === "string") scratch.set(k, i.content);
						if (r && deleted(r)) mine.push({ kind: "write", path: r, body: i.content });
					} else if (c.name === "Edit"){
						const r = rel(i.file_path, cwd);
						if (r && deleted(r)) mine.push({ kind: "edit", path: r, edits: [{ old: i.old_string, new: i.new_string, all: !!i.replace_all }] });
					} else if (c.name === "MultiEdit"){
						const r = rel(i.file_path, cwd);
						if (r && deleted(r)) mine.push({ kind: "edit", path: r, edits: (i.edits ?? []).map(e => ({ old: e.old_string, new: e.new_string, all: !!e.replace_all })) });
					} else if (c.name === "Read"){
						const r = rel(i.file_path, cwd);
						if (r && deleted(r) && i.offset == null && i.limit == null) mine.push({ kind: "snapshot", path: r });
					} else if (c.name === "Bash" && typeof i.command === "string"){
						for (const s of shellOps(i.command, cwd)){
							const k = absAny(s.file, s.cwd);
							if (s.kind === "write" && k) scratch.set(k, s.body);
							const r = rel(s.file, s.cwd);
							if (!r || !deleted(r)) continue;
							if (s.kind === "write") mine.push({ kind: "write", path: r, body: s.body });
							else if (s.kind === "append_text") mine.push({ kind: "append_text", path: r, body: s.body });
							else if (s.kind === "append_mjs"){
								const lk = absAny(s.lines, s.cwd), body = lk && scratch.get(lk);
								mine.push({ kind: "append_mjs", path: r, body: body ?? null });
							}
						}
					} else if (c.name === "mcp__servex__dir_log"){
						const r = rel(path.posix.join(String(i.dir ?? ""), "ai/log.jsonl"), REPO);
						if (r && deleted(r)) mine.push({ kind: "append_line", path: r, body: i.line ?? json(i.entry) });
					}
					if (mine.length){ for (const m of mine) Object.assign(m, { at, session }); pending.set(c.id, mine); ops.push(...mine); }
				} else if (c.type === "tool_result" && pending.has(c.tool_use_id)){
					const res = typeof c.content === "string" ? c.content : (c.content ?? []).map(x => x.text ?? "").join("");
					for (const m of pending.get(c.tool_use_id)){
						m.error = !!c.is_error || /^(<tool_use_error>|Error)/.test(res) || /REFUSED|Nothing was written/.test(res);
						if (m.kind === "snapshot") m.body = readResult(res);
						if (m.kind === "append_mjs"){ const t = res.match(/appended \d+ at (\S+);/); m.stamp = t?.[1] ?? null; if (!t) m.error = true; }
						if (m.kind === "append_line"){ const j = json(res); if (j?.line) m.body = j.line; if (j && j.ok === false) m.error = true; }
					}
					pending.delete(c.tool_use_id);
				}
			}
		}
		if (n % 200 === 0) console.log(`${n}/${files.length} transcripts, ${ops.length} ops`);
	}
	ops.sort((a, b) => a.at - b.at);
	fs.writeFileSync(path.join(here, "ops.json"), JSON.stringify(ops));
	console.log(`scanned ${files.length} transcripts: ${ops.length} ops on ${new Set(ops.map(o => o.path)).size} deleted paths`);
}
function json(s){ if (s && typeof s === "object") return s; try { return JSON.parse(s); } catch { return null; } }
// a Read result: "   1\tline" rows from 1, consecutive; anything after (a reminder block) ignored
function readResult(res){
	const rows = [];
	for (const l of res.split("\n")){
		const m = l.match(/^\s*(\d+)[\t→](.*)$/);
		if (!m){ if (rows.length) break; continue; }
		if (+m[1] !== rows.length + 1) break;
		rows.push(m[2].replace(/\r$/, ""));
	}
	if (!rows.length || /File content \(.*\) exceeds|truncated/i.test(res)) return null;
	return rows.join("\n") + "\n";
}

// ---- replay one path's ops → { text, confidence } or null
function replay(list){
	let text = null, clean = false, based = false, ops = 0;
	for (const o of list){
		if (o.error) continue;
		if (o.kind === "write"){ text = o.body ?? ""; clean = true; based = true; }
		else if (o.kind === "snapshot"){ if (o.body != null){ text = o.body; clean = true; based = true; } }
		else if (o.kind === "edit"){
			if (text == null){ clean = false; continue; }
			for (const e of o.edits){
				if (!text.includes(e.old)){ clean = false; continue; }
				text = e.all ? text.split(e.old).join(e.new) : text.replace(e.old, () => e.new);
			}
		}
		else if (o.kind === "append_text"){ text = (text ?? "") + o.body; if (!based) clean = false; }
		else if (o.kind === "append_mjs" || o.kind === "append_line"){
			let objs = o.kind === "append_line" ? [json(o.body)] : json(o.body);
			if (!Array.isArray(objs)) objs = objs ? [objs] : null;
			if (!objs || objs.some(x => !x)){ clean = false; continue; }
			const fill = v => v === "NOW" ? o.stamp : Array.isArray(v) ? v.map(fill) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)])) : v;
			const cur = text ?? "";
			text = cur + (cur && !cur.endsWith("\n") ? "\n" : "") + objs.map(x => JSON.stringify(o.stamp ? fill(x) : x)).join("\n") + "\n";
			if (!based) clean = false;   // earlier lines (Servex's assign, hooks) are unknown
		}
		ops++;
	}
	if (text == null) return null;
	const sessions = [...new Set(list.map(o => o.session.slice(0, 8)))];
	return { text, confidence: clean && based ? "exact" : "partial", ops, sessions };
}

// ---- worktrees: every one that holds a copy
function worktrees(){
	const out = execFileSync("git", ["-C", REPO, "worktree", "list", "--porcelain"], { encoding: "utf8", windowsHide: true });
	const list = out.split("\n").filter(l => l.startsWith("worktree ")).map(l => l.slice(9).trim()).filter(p => path.resolve(p) !== path.resolve(REPO));
	const pool = "C:/Code/lew42/worktrees";
	try { for (const d of fs.readdirSync(pool)){ const p = path.join(pool, d); if (fs.existsSync(path.join(p, ".git")) && !list.some(x => path.resolve(x) === path.resolve(p))) list.push(p); } } catch {}
	return list;
}
function listUnder(root, relDir){
	const out = [], base = path.join(root, relDir);
	const walk = (d, r) => { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; } for (const e of es){ const rr = r + e.name; if (e.isDirectory()) walk(path.join(d, e.name), rr + "/"); else out.push(rr); } };
	walk(base, relDir);
	return out;
}

// ---- phase 2: targets, sources, writes
function apply(dry){
	const ops = JSON.parse(fs.readFileSync(path.join(here, "ops.json"), "utf8"));
	const byPath = new Map();
	for (const o of ops){ if (!byPath.has(o.path)) byPath.set(o.path, []); byPath.get(o.path).push(o); }
	const wts = worktrees();

	// targets: file entries, every file a source names under a folder entry, every name a manifest lists
	const targets = new Set([...fileEntries].filter(deleted));
	for (const p of byPath.keys()) targets.add(p);
	const copies = new Map();   // rel -> [{wt, abs, mtime}]
	for (const wt of wts){
		for (const f of fileEntries){ const a = path.join(wt, f); try { const s = fs.statSync(a); if (s.isFile()) (copies.get(f) ?? copies.set(f, []).get(f)).push({ wt, abs: a, mtime: s.mtimeMs }); } catch {} }
		for (const d of dirEntries){ if (!deleted(d)) continue; for (const f of listUnder(wt, d)){ const a = path.join(wt, f); const s = fs.statSync(a); targets.add(f); (copies.get(f) ?? copies.set(f, []).get(f)).push({ wt, abs: a, mtime: s.mtimeMs }); } }
	}
	// manifests: a tracked files.jsonl in a still-existing parent names the files that were in it
	const manifestOnly = new Set();
	for (const d of new Set(entries.map(e => path.posix.dirname(e.replace(/\/$/, ""))))){
		const m = path.join(REPO, d, "files.jsonl");
		if (!fs.existsSync(m)) continue;
		for (const l of fs.readFileSync(m, "utf8").split("\n")){ const f = json(l)?.file; if (!f || f.endsWith("/")) continue; const r = `${d}/${f}`; if (deleted(r) && !targets.has(r)){ targets.add(r); manifestOnly.add(r); } }
	}
	const already = new Set(fs.existsSync(path.join(TASK, "recovered.jsonl")) ? fs.readFileSync(path.join(TASK, "recovered.jsonl"), "utf8").split("\n").map(l => json(l)?.recover?.path).filter(Boolean) : []);
	const list = [...targets].filter(t => skipReason(t) !== "cards-pass" && !already.has(t)).sort(order);
	fs.writeFileSync(path.join(here, "targets.json"), JSON.stringify(list, null, 1));

	const records = [];
	for (const t of list){
		const skip = skipReason(t);
		const abs = path.join(REPO, t);
		if (skip){ records.push({ path: t, source: "rule: server-generated", confidence: "exact", bytes: 0, status: skip }); continue; }
		const r = byPath.has(t) ? replay(byPath.get(t)) : null;
		const wt = (copies.get(t) ?? []).filter(c => c.mtime <= CUTOFF + 60e3).sort((a, b) => b.mtime - a.mtime)[0] ?? (copies.get(t) ?? []).sort((a, b) => b.mtime - a.mtime)[0];
		let pick = null;
		const isLog = t.endsWith(".jsonl");
		if (r && isLog){
			// a log grows by appends the transcripts never saw (Servex, hooks): never "exact"; lines a
			// Read cut at 2,000 characters do not parse and are dropped, never written broken
			const lines = r.text.split(NL).filter(l => l.trim()), good = lines.filter(l => json(l));
			r.dropped = lines.length - good.length; r.text = good.length ? good.join(NL) + NL : ""; r.confidence = "partial";
			if (!good.length) r.text = null;
			if (r.text == null || (wt && fs.statSync(wt.abs).size > Buffer.byteLength(r.text))) r.useWorktree = true;
		}
		if (r && r.text != null && isLog && !r.useWorktree) pick = { buf: Buffer.from(r.text, "utf8"), source: `transcript replay: ${r.ops} ops, sessions ${r.sessions.join(" ")}${r.dropped ? `, ${r.dropped} cut lines dropped` : ""}`, confidence: "partial" };
		else if (isLog && wt) pick = { buf: fs.readFileSync(wt.abs), source: `worktree ${path.basename(wt.wt)}`, confidence: "partial" };
		else if (r && r.confidence === "exact") pick = { buf: Buffer.from(r.text, "utf8"), source: `transcript replay: ${r.ops} ops, sessions ${r.sessions.join(" ")}`, confidence: "exact" };
		else if (wt) pick = { buf: fs.readFileSync(wt.abs), source: `worktree ${path.basename(wt.wt)}`, confidence: wt.mtime <= CUTOFF + 60e3 ? "exact" : "partial" };
		else if (r && r.text != null && !isLog) pick = { buf: Buffer.from(r.text, "utf8"), source: `transcript replay: ${r.ops} ops, sessions ${r.sessions.join(" ")}`, confidence: "partial" };
		if (fs.existsSync(abs)){ records.push({ path: t, source: pick?.source ?? "none", confidence: pick?.confidence ?? "partial", bytes: fs.statSync(abs).size, status: "kept-existing" }); continue; }
		if (!pick){ records.push({ path: t, source: manifestOnly.has(t) ? "named in files.jsonl only" : "none", confidence: "partial", bytes: 0, status: "no-source" }); continue; }
		if (!dry){
			fs.mkdirSync(path.dirname(abs), { recursive: true });
			try { fs.writeFileSync(abs, pick.buf, { flag: "wx" }); }
			catch (e){ if (e.code !== "EEXIST") throw e; records.push({ path: t, source: pick.source, confidence: pick.confidence, bytes: fs.statSync(abs).size, status: "kept-existing" }); continue; }
		}
		records.push({ path: t, source: pick.source, confidence: pick.confidence, bytes: pick.buf.length, status: "restored" });
	}
	const count = {}; for (const r of records) count[r.status + (r.status === "restored" ? "/" + r.confidence : "")] = (count[r.status + (r.status === "restored" ? "/" + r.confidence : "")] ?? 0) + 1;
	fs.writeFileSync(path.join(here, dry ? "dry.json" : "records.json"), JSON.stringify(records, null, 1));
	console.log(dry ? "DRY" : "APPLIED", list.length, "targets", count);
	if (dry) return;
	const tmp = path.join(TEMP, "recover-main-lines.json");
	for (let i = 0; i < records.length; i += 200){
		fs.writeFileSync(tmp, JSON.stringify(records.slice(i, i + 200).map(r => ({ recover: r }))));
		execFileSync("node", [path.join(REPO, ".claude/hooks/append.mjs"), path.join(TASK, "recovered.jsonl"), tmp], { stdio: "inherit", windowsHide: true });
	}
}
// the brief's order: October cards' attachments, today's task dirs, skills + Servex, older dirs, module ai/
function order(a, b){ return rank(a) - rank(b) || a.localeCompare(b); }
function rank(p){
	if (p.startsWith("public/framework/ai/2026/10/")) return 0;
	if (p.startsWith("public/framework/ai/2026-10-01/")) return 1;
	if (p.startsWith(".claude/") || p.startsWith("Servex/")) return 2;
	if (p.startsWith("public/framework/ai/")) return 3;
	return 4;
}

const [cmd] = process.argv.slice(2);
if (cmd === "scan") await scan();
else if (cmd === "apply") apply(process.argv.includes("--dry"));
else console.log("usage: node recover.mjs scan | apply [--dry]");
