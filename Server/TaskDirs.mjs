#!/usr/bin/env node
// Server/TaskDirs.mjs — a finished task lives INSIDE the session that ran it: ai/sessions/YYYY/MM/DD/<session>/task/
// (owner, 2026-10-10: "if tasks belong to sessions, put them within the session folder"). Brief: ai/2026-10-10/tasks-into-sessions/requirements.md
//
//   node Server/TaskDirs.mjs                dry run: what would move, what stays and why (the default; changes nothing)
//   node Server/TaskDirs.mjs --apply        write the snapshot (every file, size, sha1), move the folders, leave a stub, write the manifest
//   node Server/TaskDirs.mjs --verify       prove every snapshot file sits at its new path with the same sha1 (zero missing, zero changed)
//   node Server/TaskDirs.mjs --undo         move every folder back using the manifest
//
// The old folder ai/<date>/<task>/ is never gone: a stub `moved.json` {to, session} stays there, so day listings still see the task,
// and `TaskDirs.follow(dir)` / `TaskDirs.alias(url)` turn the old address into the new one (the dev server serves old URLs through `alias`).
// Only a task that is landed, quiet for QUIET_MIN minutes, and joined to a session in the store moves; everything else stays where it is.
// The manifest `ai/sessions/task-manifest.json` is the record: old -> new for every folder, plus each file's size and sha1.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, ".."), AI = path.join(REPO, "public", "framework", "ai"), SESS = path.join(AI, "sessions");
const MANIFEST = path.join(SESS, "task-manifest.json"), STUB = "moved.json", QUIET_MIN = 240;
const slash = p => p.split(path.sep).join("/"), rel = p => slash(path.relative(REPO, p));

export default class TaskDirs {
	static MANIFEST = MANIFEST;
	static STUB = STUB;
	static #cache = { mtime: 0, map: new Map() };

	/** old repo-relative dir -> {to, session}, read from the manifest (cached until its mtime changes). */
	static map(){
		let m = 0; try { m = fs.statSync(MANIFEST).mtimeMs; } catch { return new Map(); }
		if (m !== this.#cache.mtime){
			const map = new Map();
			try { for (const e of JSON.parse(fs.readFileSync(MANIFEST, "utf8")).moves) map.set(e.from, e); } catch {}
			this.#cache = { mtime: m, map };
		}
		return this.#cache.map;
	}

	/** An absolute task dir that may have moved -> where it lives now (itself when it never moved). */
	static follow(dir){
		const e = this.map().get(rel(path.resolve(dir)));
		return e ? path.join(REPO, e.to) : dir;
	}

	/** A site URL under an old task dir (/framework/ai/<date>/<task>/<rest>) -> the absolute file it now is, or null. */
	static alias(url){
		const m = /^\/framework\/ai\/(\d{4}-\d{2}-\d{2}\/[^/]+)\/(.+)$/.exec(url);
		if (!m) return null;
		const e = this.map().get("public/framework/ai/" + m[1]);
		if (!e) return null;
		const file = path.join(REPO, e.to, decodeURIComponent(m[2]));
		return file.startsWith(path.join(REPO, e.to)) ? file : null;
	}

	// ---- reading the tree ----
	static files(dir, base = dir, out = []){
		for (const e of fs.readdirSync(dir, { withFileTypes: true })){
			const f = path.join(dir, e.name);
			if (e.isDirectory()) this.files(f, base, out);
			else out.push({ p: slash(path.relative(base, f)), size: fs.statSync(f).size, sha1: crypto.createHash("sha1").update(fs.readFileSync(f)).digest("hex") });
		}
		return out;
	}
	static newest(dir){ let t = 0; for (const e of fs.readdirSync(dir, { withFileTypes: true })){ const f = path.join(dir, e.name); t = Math.max(t, e.isDirectory() ? this.newest(f) : fs.statSync(f).mtimeMs); } return t; }

	/** Decide every move. Pure reading. Uses session-migrate's join (task.jsonl session_id -> session folder in the store). */
	static async plan(){
		const { plan } = await import("./session-migrate.mjs");
		const p = plan(), moves = [], stay = [], now = Date.now();
		for (const s of p.sessions.values()){
			let n = 0;
			for (const t of s.tasks){
				const log = fs.readFileSync(path.join(t, "task.jsonl"), "utf8");
				const why = !/"landed_at"/.test(log) ? "not landed" : (now - this.newest(t)) / 6e4 < QUIET_MIN ? "written in the last " + QUIET_MIN + " min" : s.day === "unknown" || !/sessions[\\/]\d{4}[\\/]\d\d[\\/]\d\d[\\/]/.test(s.dir) ? "session not in the dated store" : "";
				if (why){ stay.push({ dir: rel(t), why }); continue; }
				moves.push({ id: s.id, from: rel(t), to: rel(path.join(s.dir, n++ ? `task-${n}` : "task")) });
			}
		}
		return { moves, stay, orphans: p.task_orphans.length, multi: p.multi_session.length };
	}

	// ---- acting ----
	static async apply(){
		const { moves, stay } = await this.plan();
		const done = [], at = new Date().toISOString();
		const write = () => fs.writeFileSync(MANIFEST, JSON.stringify({ at, moves: done }, null, 1));
		for (const m of moves){
			const from = path.join(REPO, m.from), to = path.join(REPO, m.to);
			if (fs.existsSync(to)) throw new Error("target exists: " + m.to);
			const files = this.files(from);   // the snapshot: taken before the folder moves
			done.push({ ...m, files });
			write();                          // recorded first, so an interrupted run can still be undone
			fs.mkdirSync(path.dirname(to), { recursive: true });
			fs.renameSync(from, to);
			fs.mkdirSync(from, { recursive: true });
			fs.writeFileSync(path.join(from, STUB), JSON.stringify({ moved_to: m.to, session: m.id, at }) + "\n");
		}
		write();
		return { moved: done.length, stay: stay.length };
	}

	/** Every snapshot file must exist at the new path with the same size and sha1; the stub must point at the folder. */
	static verify(){
		const man = JSON.parse(fs.readFileSync(MANIFEST, "utf8")), bad = [];
		let files = 0, bytes = 0;
		for (const m of man.moves){
			const to = path.join(REPO, m.to);
			for (const f of m.files){
				files++; bytes += f.size;
				const file = path.join(to, f.p);
				if (!fs.existsSync(file)) bad.push({ missing: m.to + "/" + f.p });
				else if (crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex") !== f.sha1) bad.push({ changed: m.to + "/" + f.p });
			}
			try { if (JSON.parse(fs.readFileSync(path.join(REPO, m.from, STUB), "utf8")).moved_to !== m.to) bad.push({ stub: m.from }); } catch { bad.push({ stub: m.from }); }
		}
		return { folders: man.moves.length, files, bytes, bad };
	}

	static undo(){
		const man = JSON.parse(fs.readFileSync(MANIFEST, "utf8")); let n = 0;
		for (const m of [...man.moves].reverse()){
			const from = path.join(REPO, m.from), to = path.join(REPO, m.to);
			if (!fs.existsSync(to)) continue;
			// the stub folder may hold only the stub and the dev server's regenerated files.jsonl listing (the real one moved with the task)
			for (const e of fs.readdirSync(from)) if (e === STUB || e === "files.jsonl") fs.unlinkSync(path.join(from, e));
			try { fs.rmdirSync(from); } catch { throw new Error("old folder holds more than a stub: " + m.from); }
			fs.renameSync(to, from); n++;
		}
		fs.renameSync(MANIFEST, MANIFEST.replace(".json", `-undone-${Date.now()}.json`));
		return n;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const flag = n => process.argv.includes(n);
	if (flag("--undo")) console.log(`moved back ${TaskDirs.undo()} folders`);
	else if (flag("--verify")){ const r = TaskDirs.verify(); console.log(`${r.folders} folders, ${r.files} files, ${r.bytes} bytes checked: ${r.bad.length} missing/changed`); if (r.bad.length){ console.log(r.bad.slice(0, 20)); process.exit(1); } }
	else if (flag("--apply")) console.log(await TaskDirs.apply());
	else {
		const p = await TaskDirs.plan();
		const why = {}; p.stay.forEach(s => why[s.why] = (why[s.why] || 0) + 1);
		console.log(`move: ${p.moves.length}; stay (joined but held back): ${p.stay.length} ${JSON.stringify(why)}; no session in the store (stay): ${p.orphans}; name more than one session (move with the first): ${p.multi}`);
		for (const s of p.stay) console.log("  stays:", s.dir, "-", s.why);
		console.log("(dry run: nothing was changed)");
	}
}
