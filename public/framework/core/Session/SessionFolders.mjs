// SessionFolders — the ONE answer to "which folder holds session X" in a dated store (<root>/YYYY/MM/DD/<folder>/). Node only.
// Every writer asks it: DatedFiles.session_dir (TaskDirs, open_task, the SessionStart hook), Session.locate (AISession.save, the page
// tool, PromptLog), AISessionIndex, ChildLinks, AskIndex, TaskMove, SessionConsolidate. Doc: public/framework/ai/sessions/doc/one-folder.md.
//
//   SessionFolders.at(root)        the finder of one store (one per absolute root, kept for the process)
//   .of(id)                        the session's folder, or null; checked on disk on every call, so a moved or removed folder is never returned
//   .home(id, day, name)           of(id), else where a new one goes: <day>/<name or session-<id8>> (the full uuid when another id holds session-<id8>). Not made.
//   .all(id)                       every folder that holds the id, the home first (more than one is a twin)
//   .twins()                       [{id, home, others}] for every id held by more than one folder
//   SessionFolders.owner(dir)      the id a folder says it holds (the claim rule below), or null
//
// Why it exists (2026-11-01): five finders each had their own rule and their own cache. One knew only <uuid> and session-<id8> names,
// so a session whose folder was a slug got a second one; the others cached a folder and wrote into it after it had moved, making it again.
import fs from "node:fs";
import path from "node:path";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, ID8 = /^session-([0-9a-f]{8})$/;
const mtime = p => { try { return fs.statSync(p).mtimeMs; } catch { return 0; } };
const dirs = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch { return []; } };

export default class SessionFolders {
	static UUID = UUID;
	static stores = new Map();
	static at(root){ root = path.resolve(root); return this.stores.get(root) ?? this.stores.set(root, new this(root)).get(root); }

	/** The id a folder holds, or null. In order: its name when that is a uuid; index.json `id` and the cache.jsonl summary (the session indexer
	 *  writes those only into a session's own folder); line 1 of session.jsonl / task.jsonl as {session:{id}} (a tab, the SessionStart hook,
	 *  TaskDirs) or {assign:{session_id, agent}} (a Servex agent's record, Agents.open_task); line 1 of page.jsonl {session} (the page tool).
	 *  An {assign} with no `agent` is a tab-era task filed flat under the day: it names the session that RAN it, not the folder's own session. */
	static owner(dir){
		const name = path.basename(dir);
		if (UUID.test(name)) return fs.existsSync(dir) ? name : null;   // a folder that is gone holds nothing
		const read = f => { try { return fs.readFileSync(path.join(dir, f), "utf8"); } catch { return ""; } };
		const first = f => { try { return JSON.parse(read(f).split("\n")[0] || "null"); } catch { return null; } };
		let id = null;
		try { id = JSON.parse(read("index.json") || "null")?.id ?? null; } catch {}
		if (!id) try { id = JSON.parse(read("cache.jsonl").split("\n").find(l => l.startsWith('{"summary"')) ?? "null")?.summary?.id ?? null; } catch {}
		for (const f of ["session.jsonl", "task.jsonl"]) if (!id){ const l = first(f); id = l?.session?.id ?? (l?.assign?.agent ? l.assign.session_id : null) ?? null; }
		if (!id){ const l = first("page.jsonl"); id = typeof l?.session === "string" ? l.session : null; }
		return typeof id === "string" && UUID.test(id) ? id : null;
	}

	/** How much a folder holds, to pick the home among folders on one day: a subfolder (a task) 8, a record 4, index.json 2, cache.jsonl 1. */
	static weight(dir){
		let w = 0, es; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return -1; }
		for (const e of es){
			if (e.isDirectory()) w |= 8;
			else if (["session.jsonl", "task.jsonl", "page.jsonl"].includes(e.name)) w |= 4;
			else if (e.name === "index.json") w |= 2;
			else if (e.name === "cache.jsonl") w |= 1;
		}
		return w;
	}

	constructor(root){
		this.root = root;
		this.days = new Map();   // "YYYY/MM/DD" -> { mt: the day folder's mtime when read, names: Map(folder name -> id, or null when it names none) }
		this.ids = new Map();    // id -> Set of "YYYY/MM/DD/<name>"
		this.quiet = new Map();  // "YYYY/MM/DD/<name>" of a folder that names no id -> its mtime when read (a claim arrives as a new file, which moves it)
		this.file = path.join(root, "session-folders.json");   // what was read, so a one-shot process (the SessionStart hook, TaskDirs --new) need not read every folder again
	}

	/** Bring the map up to what is on disk. Every day's folder names are listed every time: that is the part correctness rests on (a folder
	 *  added, removed or renamed is seen at once). What a folder says it holds is read again only when it is new, when it named no id and
	 *  has changed since, or when its day folder's mtime moved (a folder removed and made again under the same name). */
	refresh(){
		if (!this.days.size) this.load();
		const seen = new Set(); let changed = false;
		const forget = (day, name, id) => { this.quiet.delete(`${day}/${name}`); if (id) this.ids.get(id)?.delete(`${day}/${name}`); };
		for (const y of dirs(this.root)) if (/^\d{4}$/.test(y)) for (const m of dirs(path.join(this.root, y))) if (/^\d\d$/.test(m)) for (const d of dirs(path.join(this.root, y, m))) if (/^\d\d$/.test(d)){
			const day = `${y}/${m}/${d}`, dd = path.join(this.root, y, m, d), mt = mtime(dd), rec = this.days.get(day) ?? { mt: null, names: new Map() };
			const same = rec.mt === mt, have = rec.names, now = new Set(dirs(dd));
			seen.add(day); this.days.set(day, rec);
			for (const [name, id] of have) if (!now.has(name)){ have.delete(name); forget(day, name, id); changed = true; }
			for (const name of now){
				const key = `${day}/${name}`, dir = path.join(dd, name), was = have.get(name);
				if (same && have.has(name) && (was !== null || this.quiet.get(key) === mtime(dir))) continue;
				const id = SessionFolders.owner(dir);
				if (have.has(name) && was === id && id !== null) continue;
				forget(day, name, was); have.set(name, id); changed = true;
				if (id) (this.ids.get(id) ?? this.ids.set(id, new Set()).get(id)).add(key); else this.quiet.set(key, mtime(dir));
			}
			if (rec.mt !== mt){ rec.mt = mt; changed = true; }
		}
		for (const [day, rec] of this.days) if (!seen.has(day)){ for (const [name, id] of rec.names) forget(day, name, id); this.days.delete(day); changed = true; }
		if (changed) this.save();
		return this;
	}

	/** The saved map (session-folders.json, gitignored machine state). Only a starting point: refresh() checks it against the folders. */
	load(){
		let j = null; try { j = JSON.parse(fs.readFileSync(this.file, "utf8")); } catch { return; }
		if (j?.v !== 1) return;
		for (const [day, { mt, names }] of Object.entries(j.days ?? {})){
			const rec = { mt, names: new Map(Object.entries(names)) };
			this.days.set(day, rec);
			for (const [name, id] of rec.names) if (id) (this.ids.get(id) ?? this.ids.set(id, new Set()).get(id)).add(`${day}/${name}`);
		}
		for (const [key, mt] of Object.entries(j.quiet ?? {})) this.quiet.set(key, mt);
	}
	save(){
		const days = {}; for (const [day, rec] of this.days) days[day] = { mt: rec.mt, names: Object.fromEntries(rec.names) };
		const tmp = `${this.file}.${process.pid}.tmp`;
		try { fs.writeFileSync(tmp, JSON.stringify({ v: 1, at: new Date().toISOString(), days, quiet: Object.fromEntries(this.quiet) })); fs.renameSync(tmp, this.file); }
		catch { try { fs.rmSync(tmp, { force: true }); } catch {} }   // a cache: another process writing it at the same moment is fine
	}

	/** The folders the map says hold `id` (relative "YYYY/MM/DD/<name>"), plus any session-<id8> that names no id (an old folder: the caller's). */
	listed(id){
		const out = [...(this.ids.get(id) ?? [])], short = "session-" + id.slice(0, 8);
		for (const [day, { names }] of this.days) if (names.has(short) && names.get(short) === null) out.push(`${day}/${short}`);
		return out;
	}

	/** The folders that hold `id`, checked on disk, the home first: the oldest day (the day the session began), then the most it holds, then the name. */
	found(id){
		const out = this.listed(id).map(r => path.join(this.root, r)).filter(dir => { const o = SessionFolders.owner(dir); return o === id || (o === null && ID8.exec(path.basename(dir))?.[1] === id.slice(0, 8)); });
		const day = dir => path.relative(this.root, path.dirname(dir)).split(path.sep).join("/");
		const w = new Map(out.map(d => [d, out.length > 1 ? SessionFolders.weight(d) : 0]));
		return out.sort((a, b) => day(a).localeCompare(day(b)) || w.get(b) - w.get(a) || path.basename(a).localeCompare(path.basename(b)));
	}

	/** Every folder that holds `id` on disk now, the home first. Reads the disk first (a folder made since the last read is in it). */
	all(id){ return UUID.test(id ?? "") ? this.refresh().found(id) : []; }

	/** The session's folder, or null. Fast: what the map knows, each answer checked on disk; the disk is read again on a miss, or when a known
	 *  folder has gone. (A second folder made since the last read is not looked for here: every writer still gets the same, oldest known home,
	 *  and the twin check finds the second one.) */
	of(id){
		if (!UUID.test(id ?? "")) return null;
		const known = this.days.size ? this.listed(id).length : 0, found = known ? this.found(id) : [];
		return (found.length && found.length === known ? found : this.refresh().found(id))[0] ?? null;
	}

	/** of(id), else where a new folder goes on `day` ("YYYY/MM/DD" or an absolute day folder): `name` if given, else session-<id8>, else (when
	 *  another id holds session-<id8> that day: two ids can share their first 8 hex) the full uuid. Absolute; never made here. */
	home(id, day, name = null){
		const found = this.of(id); if (found) return found;
		const dd = path.isAbsolute(day) ? day : path.join(this.root, ...String(day).split("/")), short = path.join(dd, "session-" + id.slice(0, 8));
		if (name) return path.join(dd, name);
		return fs.existsSync(short) ? path.join(dd, id) : short;   // of() found nothing, so an existing session-<id8> belongs to another id
	}

	/** Every id held by more than one folder: [{id, home, others}], absolute paths, the home as all() picks it. */
	twins(){
		this.refresh();
		const out = [];
		for (const [id, set] of this.ids) if (set.size > 1){ const [home, ...others] = this.found(id); if (others.length) out.push({ id, home, others }); }
		return out.sort((a, b) => a.home.localeCompare(b.home));
	}

	/** Every session in the store once, at its home: [{id, dir}]. */
	homes(){
		this.refresh();
		return [...this.ids].filter(([, set]) => set.size).map(([id, set]) => ({ id, dir: set.size === 1 ? path.join(this.root, [...set][0]) : this.found(id)[0] })).filter(r => r.dir);
	}
}
