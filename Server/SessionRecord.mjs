// A session folder's one record is session.jsonl (doc: public/framework/ai/sessions/doc/session-record.md).
//   node Server/SessionRecord.mjs --plan [--root <repo>] [--quiet <min>]    print the plan (counts, folders, skips). Writes nothing.
//   node Server/SessionRecord.mjs --apply [--root <repo>] [--quiet <min>]   do it; appends the manifest; stages (never commits) the paths
//   node Server/SessionRecord.mjs --undo <manifest.jsonl> [--run <id>] [--root <repo>]   reverse one run (default: the last)
// As a module: SessionRecord.file(dir) is the record a reader opens (session.jsonl first, task.jsonl while a folder is not moved yet).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SELF_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sha = buf => crypto.createHash("sha256").update(buf).digest("hex");
const nlines = buf => { const s = buf.toString("utf8"); return s === "" ? 0 : s.split("\n").length - (s.endsWith("\n") ? 1 : 0); };
const slash = p => String(p).replaceAll("\\", "/");

export default class SessionRecord {
	static NEW = "session.jsonl";
	static OLD = "task.jsonl";
	static STORE = "public/framework/ai/sessions";
	static MANIFEST = "public/framework/ai/sessions/session-record-moves.jsonl";
	/** The verbs of the digest/record lines that session.jsonl held before the rename (AISession.LINE_TYPES, plus the digest `summary`). */
	static TAG_VERBS = ["tag", "note", "alert", "weight", "closed", "question", "links", "summary"];

	/** The record file a reader opens in a session or task folder: session.jsonl, else task.jsonl, else null. */
	static file(dir){
		for (const n of [this.NEW, this.OLD]){ const f = path.join(dir, n); if (fs.existsSync(f)) return f; }
		return null;
	}
	/** Every record file in the folder, new name first (a folder caught mid-move can hold both). */
	static files(dir){ return [this.NEW, this.OLD].map(n => path.join(dir, n)).filter(f => fs.existsSync(f)); }
	/** The folder's task/session LOG (assign, log, agent… lines), or null: a folder holding only digest tag lines has no log. */
	static log_file(dir){
		for (const n of [this.NEW, this.OLD]){
			const f = path.join(dir, n); if (!fs.existsSync(f)) continue;
			let first = ""; try { const fd = fs.openSync(f, "r"), b = Buffer.alloc(2048), k = fs.readSync(fd, b, 0, 2048, 0); fs.closeSync(fd); first = b.toString("utf8", 0, k).split("\n", 1)[0]; } catch {}
			let o = null; try { o = JSON.parse(first); } catch {}
			if (!(o && this.is_tag_line(o))) return f;
		}
		return null;
	}
	/** The log to read or append to: the one that exists (either name), else the old name for a brand-new folder. */
	static log_or_old(dir){ return this.log_file(dir) ?? path.join(dir, this.OLD); }
	/** A session folder sits directly under a day of the sessions store (YYYY/MM/DD/<name>); a task folder is deeper. */
	static is_session_dir(dir){ return /[\\/]sessions[\\/]\d{4}[\\/]\d\d[\\/]\d\d[\\/][^\\/]+$/.test(path.resolve(dir)); }
	/** The file a line goes to in `dir`: the log or record that exists (either name); else session.jsonl for a NEW session folder
	 *  (`first` is a spawn line {"assign":{"session_id","agent"}} at any depth, a {"session":…} line, or a session_id line directly under a day); else task.jsonl. Writers ask this, never type the name. */
	static start_file(dir, first){
		const have = this.log_file(dir); if (have) return have;
		if (fs.existsSync(path.join(dir, this.NEW)) && !fs.existsSync(path.join(dir, this.OLD))) return path.join(dir, this.NEW);   // a tag-only record: the session's own file
		const a = first?.assign, spawn = a?.session_id && a?.agent, voice = first?.session?.id;   // a spawn line (only open_task writes it) or a cloud-voice line: a session at any depth
		return path.join(dir, spawn || voice || (a?.session_id && this.is_session_dir(dir)) ? this.NEW : this.OLD);
	}
	/** A NEW TASK FOLDER COUNTS AS ITS PARENT'S TASK: under the sessions store, the nearest folder above `dir` that has a log (a task or the
	 *  session itself) gets one {"task":"<url>"} reference line, the same line the item tool writes for a child folder; Session.replay and
	 *  Task.replay read it as a subtask. Never twice, never above the session folder. Returns the parent's log file, or null. */
	static link_parent(dir, by = "TaskDirs"){
		const abs = path.resolve(dir), m = slash(abs).match(/^(.*\/public)\/(framework\/ai\/sessions\/\d{4}\/\d\d\/\d\d\/[^/]+)(\/.+)?$/);
		if (!m || !m[3]) return null;   // not in the store, or a session folder itself
		const url = "/" + slash(path.relative(m[1], abs)) + "/", top = path.join(m[1], m[2]);
		for (let p = path.dirname(abs); p.length >= top.length; p = path.dirname(p)){
			const log = this.log_file(p); if (!log) continue;
			let text = ""; try { text = fs.readFileSync(log, "utf8"); } catch {}
			if (text.includes(`"task":"${url}"`) || text.includes(`"path":"${url}"`)) return log;   // already referenced (also a hand-made tasks.add with this path)
			fs.appendFileSync(log, (text && !text.endsWith("\n") ? "\n" : "") + JSON.stringify({ task: url, by, ts: new Date().toISOString() }) + "\n");
			return log;
		}
		return null;
	}
	/** For a directory walker: is this entry (dir, file name) the folder's log? Counts each folder once, whichever name it holds. */
	static is_log_entry(dir, name){ return this.is_record(name) && this.log_file(dir) === path.join(dir, name); }
	/** The record's name in a url or a path: `…/x/task.jsonl` and `…/x/session.jsonl` are the same record. */
	static is_record(name){ return name === this.NEW || name === this.OLD; }
	/** A tag-file line: a tag, note, alert, weight, closed, question, links or summary line, and nothing a task log holds. */
	static is_tag_line(l){ return l && typeof l === "object" && this.TAG_VERBS.some(v => v in l) && !("assign" in l || "log" in l || "agent" in l || "chat" in l); }
	/** A session folder (not a task) has its own session id on line 1: {"assign":{"session_id":…}}. */
	static own_session(line1){ try { return JSON.parse(line1)?.assign?.session_id ?? null; } catch { return null; } }

	constructor({ root = SELF_ROOT, quiet = 60, now = Date.now() } = {}){
		this.root = path.resolve(root); this.quiet = quiet; this.now = now;
		this.store = path.join(this.root, SessionRecord.STORE);
		this.manifest = path.join(this.root, SessionRecord.MANIFEST);
	}
	git(...a){ return execFileSync("git", ["-C", this.root, ...a], { encoding: "utf8", windowsHide: true, maxBuffer: 1 << 28 }); }
	rel(p){ return slash(path.relative(this.root, p)); }

	/** Every folder directly under a day (YYYY/MM/DD/<name>/): the only place a session folder can be. */
	*day_children(){
		const dirs = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort(); } catch { return []; } };
		for (const y of dirs(this.store)) if (/^\d{4}$/.test(y))
			for (const m of dirs(path.join(this.store, y))) if (/^\d\d$/.test(m))
				for (const d of dirs(path.join(this.store, y, m))) if (/^\d\d$/.test(d))
					for (const c of dirs(path.join(this.store, y, m, d))) yield path.join(this.store, y, m, d, c);
	}

	/** Task logs below a day child (depth 5+): counted as skipped children, never touched. */
	count_children(dir){
		let n = 0; const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })){
			if (e.isDirectory()){ if (!["node_modules", "screenshots", "transcripts"].includes(e.name)) walk(path.join(d, e.name)); }
			else if (e.name === SessionRecord.OLD) n++; } };
		try { walk(dir); } catch {}
		return n;
	}

	/** Pure reading. Returns { counts, folders: [{dir, action, why?}], children_skipped }. Actions: rename, merge, fold, skip. */
	plan(){
		const folders = [], counts = { rename: 0, merge: 0, fold: 0, skip: 0, already: 0 };
		let children_skipped = 0;
		for (const dir of this.day_children()){
			const T = path.join(dir, SessionRecord.OLD), S = path.join(dir, SessionRecord.NEW), hasT = fs.existsSync(T), hasS = fs.existsSync(S);
			children_skipped += this.count_children(dir) - (hasT ? 1 : 0);
			if (!hasT){ if (hasS) counts.already++; continue; }
			const buf = fs.readFileSync(T), first = buf.toString("utf8").split("\n", 1)[0];
			const sid = SessionRecord.own_session(first) ?? (hasS ? SessionRecord.own_session(fs.readFileSync(S, "utf8").split("\n", 1)[0]) : null);   // fold: a folder moved earlier whose old name a writer reopened
			if (!sid){ let k = "?"; try { k = Object.keys(JSON.parse(first))[0]; } catch {}
				folders.push({ dir, action: "skip", why: `task folder: line 1 is "${k}" with no own session_id` }); counts.skip++; continue; }
			const age = (this.now - fs.statSync(T).mtimeMs) / 60000;
			if (age < this.quiet){ folders.push({ dir, action: "skip", why: `active: task.jsonl changed ${Math.round(age)} min ago (< ${this.quiet}); a later run takes it` }); counts.skip++; continue; }
			let action = "rename";
			if (hasS){
				const ls = fs.readFileSync(S, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } });
				action = ls.every(l => SessionRecord.is_tag_line(l)) ? "merge" : "fold";
			}
			folders.push({ dir, action, session_id: sid }); counts[action]++;
		}
		return { counts, folders, children_skipped };
	}

	/** Do one folder's move. Returns the manifest line. Never deletes a file whose full content is not in the new one. */
	move_one(f, run){
		const T = path.join(f.dir, SessionRecord.OLD), S = path.join(f.dir, SessionRecord.NEW);
		const A = fs.readFileSync(T);
		const line = { run, op: f.action, old: this.rel(T), new: this.rel(S), lines_before: nlines(A), sha_before: sha(A), bytes_before: A.length };
		if (f.action === "rename"){
			if (fs.existsSync(S)) throw new Error("session.jsonl appeared: " + this.rel(S));
			fs.renameSync(T, S);
		} else {
			const B = fs.readFileSync(S);
			Object.assign(line, { tag_old: this.rel(S), tag_lines: nlines(B), tag_sha: sha(B), tag_bytes: B.length });
			// merge: task lines then the tag lines (spec). fold: a writer recreated task.jsonl after an earlier move, so session.jsonl holds the log and the new task lines go on its end.
			const [first, second] = f.action === "merge" ? [A, B] : [B, A];
			const glue = first.length && first[first.length - 1] !== 10 ? Buffer.from("\n") : Buffer.alloc(0);
			const out = Buffer.concat([first, glue, second]);
			line.glue = glue.length;
			if (nlines(out) !== nlines(first) + nlines(second)) throw new Error("line count mismatch " + this.rel(S));
			if (!out.subarray(0, first.length).equals(first) || !out.subarray(first.length + glue.length).equals(second)) throw new Error("byte check failed " + this.rel(S));
			const tmp = S + ".moving"; fs.writeFileSync(tmp, out); fs.renameSync(tmp, S); fs.unlinkSync(T);
		}
		const N = fs.readFileSync(S);
		Object.assign(line, { lines_after: nlines(N), sha_after: sha(N), bytes_after: N.length });
		if (f.action === "rename" && line.sha_after !== line.sha_before) line.grew_during_move = true;   // a writer appended between read and rename: nothing lost, the file is the longer one
		if (fs.existsSync(T)) line.task_recreated = true;                                                   // a writer reopened the old name; a later run folds it in
		return line;
	}

	/** Apply a plan: move each folder, append the manifest, stage the paths in git (`git add -A --`, so renames show as renames). */
	apply({ plan = this.plan() } = {}){
		const run = "run-" + new Date(this.now).toISOString().replace(/[-:.TZ]/g, "").slice(0, 14) + "-" + crypto.randomBytes(2).toString("hex");
		const lines = [], paths = [], errors = [];
		for (const f of plan.folders){
			if (f.action === "skip") continue;
			try { const l = this.move_one(f, run); lines.push(l); paths.push(l.old, l.new); if (l.tag_old) paths.push(l.tag_old); }
			catch (e){ errors.push({ dir: this.rel(f.dir), error: String(e.message) }); }
		}
		const head = { run, header: true, at: new Date(this.now).toISOString(), counts: plan.counts, children_skipped: plan.children_skipped, moved: lines.length, errors: errors.length };
		fs.mkdirSync(path.dirname(this.manifest), { recursive: true });
		fs.appendFileSync(this.manifest, [head, ...lines].map(l => JSON.stringify(l)).join("\n") + "\n");
		this.stage([...paths, this.rel(this.manifest)]);
		return { run, moved: lines.length, errors, manifest: this.rel(this.manifest) };
	}

	/** `git add -A` for these paths, those git knows or that exist (a path git never saw and that is gone is not an error). */
	stage(paths){
		const tracked = new Set(this.git("ls-files", "-z", "--", SessionRecord.STORE).split("\0").filter(Boolean));
		const list = [...new Set(paths)].filter(p => tracked.has(p) || fs.existsSync(path.join(this.root, p)));
		if (!list.length) return;
		const spec = path.join(this.root, ".git-session-record-paths"); fs.writeFileSync(spec, list.join("\0"));
		try { this.git("add", "-A", "--pathspec-from-file=" + spec, "--pathspec-file-nul"); } finally { fs.unlinkSync(spec); }
	}

	/** Reverse one run from a manifest: rename back, or split a merge back into its two files. Lines written after the move stay (they go to task.jsonl). */
	undo(manifest = this.manifest, run = null){
		const all = fs.readFileSync(manifest, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
		const heads = all.filter(l => l.header); run ??= heads[heads.length - 1]?.run;
		const mine = all.filter(l => l.run === run && !l.header).reverse(), done = [], paths = [];
		if (!mine.length) throw new Error("no lines for run " + run);
		for (const l of mine){
			const T = path.join(this.root, l.old), S = path.join(this.root, l.new);
			if (l.op === "rename"){
				if (fs.existsSync(T)) throw new Error("task.jsonl exists again, will not overwrite: " + l.old);
				fs.renameSync(S, T);
			} else {
				const cur = fs.readFileSync(S), text = cur.toString("utf8");
				const parts = text.split("\n"); if (parts[parts.length - 1] === "") parts.pop();
				const nA = l.lines_before, nB = l.tag_lines;
				const ls = l.op === "merge"
					? { task: [...parts.slice(0, nA), ...parts.slice(nA + nB)], tags: parts.slice(nA, nA + nB) }
					: { tags: parts.slice(0, nB), task: parts.slice(nB) };      // fold: session.jsonl = its own lines, then the recreated task lines
				if (fs.existsSync(T)) throw new Error("task.jsonl exists again, will not overwrite: " + l.old);
				// (merge: the original session.jsonl was the tag file; fold: the original session.jsonl was the log; the manifest names which)
				const [fileT, fileS] = [ls.task, ls.tags];
				const w = (p, arr) => fs.writeFileSync(p, arr.length ? arr.join("\n") + "\n" : "");
				w(T, fileT); w(S, fileS);
				// byte-exact unless a glue newline was added; the sha check below says which
			}
			const back = fs.readFileSync(T);
			done.push({ old: l.old, new: l.new, sha_back: sha(back), same_as_before: sha(back) === l.sha_before });
			paths.push(l.old, l.new);
		}
		this.stage(paths);
		return { run, restored: done.length, exact: done.filter(d => d.same_as_before).length, differs: done.filter(d => !d.same_as_before).map(d => d.old) };
	}
}

// ---- command line -------------------------------------------------------------------------------------
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), opt = n => { const i = argv.indexOf(n); return i < 0 ? null : argv[i + 1]; };
	const sr = new SessionRecord({ root: opt("--root") ?? SELF_ROOT, quiet: Number(opt("--quiet") ?? 60) });
	if (argv.includes("--undo")){
		console.log(JSON.stringify(sr.undo(path.resolve(opt("--undo")), opt("--run")), null, 1));
	} else if (argv.includes("--apply")){
		const plan = sr.plan(); console.log("plan:", JSON.stringify(plan.counts), "children skipped:", plan.children_skipped);
		console.log(JSON.stringify(sr.apply({ plan }), null, 1));
	} else {
		const plan = sr.plan();
		console.log("counts:", JSON.stringify(plan.counts), "| folders holding only session.jsonl (already moved, or digest tags; nothing to do):", plan.counts.already, "| child task logs (depth 5+) skipped:", plan.children_skipped);
		const by = {}; for (const f of plan.folders) if (f.action === "skip") (by[f.why.replace(/changed \d+ min ago/, "changed N min ago").replace(/line 1 is "[^"]*"/, 'line 1 is "<verb>"')] ??= []).push(sr.rel(f.dir));
		for (const [why, list] of Object.entries(by)) console.log(`skip ${list.length}: ${why}\n   e.g. ${list.slice(0, 3).join("  ")}`);
		if (argv.includes("--list")) for (const f of plan.folders) console.log(f.action, sr.rel(f.dir), f.why ?? "");
	}
}
