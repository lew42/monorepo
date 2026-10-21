#!/usr/bin/env node
// Server/SessionDayMove.mjs — re-file session and task folders that sit under the wrong day (2026-10-18).
// Date rules live in the sessions collection (Server/DatedFiles.mjs: start, misfiled); this file keeps the manifest, apply and undo.
// The rule is ONE: a folder lives under ai/sessions/YYYY/MM/DD/ of the owner's LOCAL start day (TaskDirs.day -> Day.js), like State.day.
// Folders made before 2026-10-18 were filed by the UTC day, so an evening start (after 19:00 local) sits one day too late.
//   node Server/SessionDayMove.mjs --plan [--since YYYY-MM-DD]   write the manifest ai/sessions/session-day-moves.jsonl (old, new, reason, source), print counts
//   node Server/SessionDayMove.mjs --apply [--quiet-min N]       git mv each planned folder (fs rename when untracked), patch the day fields in the index.json files,
//                                                                 commit the moves; a folder written in the last N minutes (default 10) is left for the next run
//   node Server/SessionDayMove.mjs --undo                        reverse every applied move from the manifest (git mv back, day fields back)
// Never a copy, never a delete. TaskDirs.follow() reads the applied lines, so an old path still resolves. Doc: ai/doc/task-folders.md
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import TaskDirs from "./TaskDirs.mjs";
import SessionRecord from "./SessionRecord.mjs";
import DatedFiles from "./DatedFiles.mjs";

const { REPO, SESS } = TaskDirs, SESSIONS = DatedFiles.sessions;
const MANIFEST = path.join(SESS, "session-day-moves.jsonl");
const slash = p => p.split(path.sep).join("/"), rel = p => slash(path.relative(REPO, p));
const ls = (d, dirs = true) => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => !dirs || e.isDirectory()).map(e => e.name); } catch { return []; } };
const git = (...a) => execFileSync("git", a, { cwd: REPO, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });

export default class SessionDayMove {
	static MANIFEST = MANIFEST;

	/** Where each misfiled folder should go, decided by the sessions collection (DatedFiles.sessions.misfiled): [{old, new, reason, source, start}] + skipped. */
	static plan({ since = "0000-00-00" } = {}){ return SESSIONS.misfiled({ since }); }
	static start(dir){ return SESSIONS.start(dir); }

	/** Manifest lines -> the moves that are in force: planned, done and not undone. */
	static read(){
		const rows = []; try { for (const l of fs.readFileSync(MANIFEST, "utf8").split("\n")) if (l.startsWith("{")) try { rows.push(JSON.parse(l)); } catch {} } catch {}
		const done = new Set(), undone = new Set();
		for (const r of rows){ if (r.done) done.add(r.done); if (r.undone){ undone.add(r.undone); done.delete(r.undone); } }
		return { rows, planned: rows.filter(r => r.old && r.new), done };
	}
	static log(line){ fs.appendFileSync(MANIFEST, JSON.stringify({ at: new Date().toISOString(), ...line }) + "\n"); }

	static tracked(dir){ try { return git("ls-files", "--", rel(dir)).trim().length > 0; } catch { return false; } }
	static move(from, to){
		fs.mkdirSync(path.dirname(to), { recursive: true });
		if (this.tracked(from)){ git("mv", rel(from), rel(to)); return true; }
		fs.renameSync(from, to); return false;
	}

	/** The `day` field ("YYYY/MM/DD") in the folder's own index.json and in both day roll-ups that list its snapshot. Returns the files changed. */
	static patch_day(folder_abs, id_dir_name, from_day, to_day){
		const changed = [];
		const fix = (file, each) => { try { const j = JSON.parse(fs.readFileSync(file, "utf8")); if (each(j)){ fs.writeFileSync(file, JSON.stringify(j) + (fs.readFileSync(file, "utf8").endsWith("\n") ? "\n" : "")); changed.push(rel(file)); } } catch {} };
		fix(path.join(folder_abs, "index.json"), j => j && j.day === from_day ? (j.day = to_day, true) : false);
		for (const day of [from_day, to_day]) fix(path.join(SESS, ...day.split("/"), "index.json"), j => {
			let hit = false; for (const s of j?.snapshots ?? []) if (s.folder === id_dir_name && s.day === from_day){ s.day = to_day; hit = true; } return hit; });
		return changed;
	}

	static plan_cli(since, dry){
		const { moves, skipped } = this.plan({ since });
		if (!dry && this.read().done.size) throw new Error("refused: " + this.read().done.size + " moves are applied; --undo first, so the manifest keeps its history");
		if (!dry) fs.writeFileSync(MANIFEST, JSON.stringify({ kind: "note", text: "Session-day moves: one line per folder {old, new, reason, source, start}; `done`/`undone` lines record --apply/--undo. Written by Server/SessionDayMove.mjs; read by TaskDirs.follow().", planned_at: new Date().toISOString(), since: since ?? null }) + "\n" + moves.map(m => JSON.stringify(m)).join("\n") + (moves.length ? "\n" : ""));
		const by = {}; for (const m of moves) by[m.source] = (by[m.source] ?? 0) + 1;
		console.log(`plan${dry ? " (dry, nothing written)" : ""}: ${moves.length} folders to move (${skipped.length} skipped: target exists). start time from: ${JSON.stringify(by)}`);
		for (const s of skipped.slice(0, 5)) console.log("  skipped", s.old, s.why);
		return moves;
	}

	static apply_cli(quiet_min = 10){
		const { planned, done } = this.read(), now = Date.now(), moved = [], left = [];
		for (const m of planned){
			if (done.has(m.old)) continue;
			const from = path.join(REPO, m.old), to = path.join(REPO, m.new);
			if (!fs.existsSync(from)){ left.push([m.old, "gone"]); continue; }
			if (fs.existsSync(to)){ left.push([m.old, "target exists"]); continue; }
			if ((now - TaskDirs.newest(from)) / 6e4 < quiet_min){ left.push([m.old, `written in the last ${quiet_min} min`]); continue; }
			try {
				const tracked = this.move(from, to);
				const fd = m.old.split("/").slice(-4, -1).join("/"), td = m.new.split("/").slice(-4, -1).join("/");
				const patched = this.patch_day(to, path.basename(to), fd, td);
				this.log({ done: m.old, new: m.new, patched }); moved.push({ ...m, tracked });
			} catch (e){ left.push([m.old, e.message.split("\n")[0]]); }
		}
		console.log(`apply: moved ${moved.length}, left ${left.length}`); for (const l of left.slice(0, 10)) console.log("  left", l.join(" — "));
		if (moved.length) this.commit(moved);
		return { moved, left };
	}

	/** Commit the applied moves (exact paths only; the tree is shared). `moved` defaults to every applied line of the manifest. */
	static commit(moved){
		moved ??= this.read().planned.filter(m => this.read().done.has(m.old)).map(m => ({ ...m, tracked: this.in_head(m.old) }));
		const ignored = f => { try { git("check-ignore", "-q", "--", f); return true; } catch { return false; } };
		const idx = moved.flatMap(m => [m.old, m.new].map(f => f.split("/").slice(0, -1).join("/") + "/index.json")).filter(f => fs.existsSync(path.join(REPO, f)));
		const paths = [...new Set([...moved.map(m => m.new), ...moved.filter(m => m.tracked).map(m => m.old), rel(MANIFEST), ...idx])].filter(f => this.in_head(f) || this.tracked(path.join(REPO, f))).filter(f => !ignored(f));   // ignored session folders are on disk only; git never sees them
		try { git("add", "-A", "--", ...paths.filter(f => fs.existsSync(path.join(REPO, f))));
			git("commit", "-q", "-m", `Re-file ${moved.length} session folders under their local start day (Server/SessionDayMove.mjs --apply)

Co-Authored-By: Claude Code <noreply@anthropic.com>`, "--", ...paths); console.log("committed"); }
		catch (e){ console.log("commit failed (moves are on disk, run --commit):", String(e.stderr || e.message).slice(0, 300)); }
	}
	static in_head(f){ try { return git("ls-tree", "-r", "--name-only", "HEAD", "--", f).trim().length > 0; } catch { return false; } }

	static undo_cli(){
		const { planned, done } = this.read(); let n = 0;
		for (const m of planned.reverse()){
			if (!done.has(m.old)) continue;
			const from = path.join(REPO, m.new), to = path.join(REPO, m.old);
			if (!fs.existsSync(from) || fs.existsSync(to)){ console.log("cannot undo", m.new); continue; }
			this.move(from, to);
			this.patch_day(to, path.basename(to), m.new.split("/").slice(-4, -1).join("/"), m.old.split("/").slice(-4, -1).join("/"));
			this.log({ undone: m.old }); n++;
		}
		console.log(`undo: moved ${n} folders back`);
	}
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/")}`){
	const a = process.argv.slice(2), arg = k => a.includes(k) ? a[a.indexOf(k) + 1] : undefined;
	if (a.includes("--plan")) SessionDayMove.plan_cli(arg("--since"), a.includes("--dry"));
	else if (a.includes("--apply")) SessionDayMove.apply_cli(arg("--quiet-min") === undefined ? 10 : Number(arg("--quiet-min")));
	else if (a.includes("--commit")) SessionDayMove.commit();
	else if (a.includes("--undo")) SessionDayMove.undo_cli();
	else console.log("usage: node Server/SessionDayMove.mjs --plan [--since YYYY-MM-DD] [--dry] | --apply [--quiet-min N] | --commit | --undo");
}
