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
		this.days = new Map();   // "YYYY/MM/DD" -> Map(folder name -> id, or null when it names none)
		this.ids = new Map();    // id -> Set of "YYYY/MM/DD/<name>"
	}

	/** Bring the map up to what is on disk: every day's folder names are listed (cheap); only a new name, or one that named no id yet, is read. */
	refresh(){
		const seen = new Set();
		for (const y of dirs(this.root)) if (/^\d{4}$/.test(y)) for (const m of dirs(path.join(this.root, y))) if (/^\d\d$/.test(m)) for (const d of dirs(path.join(this.root, y, m))) if (/^\d\d$/.test(d)){
			const day = `${y}/${m}/${d}`, have = this.days.get(day) ?? new Map(), now = new Set(dirs(path.join(this.root, y, m, d)));
			seen.add(day); this.days.set(day, have);
			for (const [name, id] of have) if (!now.has(name)){ have.delete(name); if (id) this.ids.get(id)?.delete(`${day}/${name}`); }
			for (const name of now) if (!have.has(name) || have.get(name) === null){
				const id = SessionFolders.owner(path.join(this.root, day, name));
				have.set(name, id);
				if (id) (this.ids.get(id) ?? this.ids.set(id, new Set()).get(id)).add(`${day}/${name}`);
			}
		}
		for (const [day, have] of this.days) if (!seen.has(day)){ for (const [name, id] of have) if (id) this.ids.get(id)?.delete(`${day}/${name}`); this.days.delete(day); }
		return this;
	}

	/** The folders the map says hold `id` (relative "YYYY/MM/DD/<name>"), plus any session-<id8> that names no id (an old folder: the caller's). */
	listed(id){
		const out = [...(this.ids.get(id) ?? [])], short = "session-" + id.slice(0, 8);
		for (const [day, have] of this.days) if (have.has(short) && have.get(short) === null) out.push(`${day}/${short}`);
		return out;
	}

	/** Every folder that holds `id` on disk now, the home first: the oldest day (the day the session began), then the most it holds, then the name. */
	all(id){
		if (!UUID.test(id ?? "")) return [];
		const check = () => this.listed(id).map(r => path.join(this.root, r)).filter(dir => { const o = SessionFolders.owner(dir); return o === id || (o === null && ID8.exec(path.basename(dir))?.[1] === id.slice(0, 8)); });
		let found = this.days.size ? check() : [];
		if (!found.length || found.length !== this.listed(id).length){ this.refresh(); found = check(); }   // a miss or a stale entry: read the disk again
		const day = dir => path.relative(this.root, path.dirname(dir)).split(path.sep).join("/");
		const w = new Map(found.map(d => [d, found.length > 1 ? SessionFolders.weight(d) : 0]));
		return found.sort((a, b) => day(a).localeCompare(day(b)) || w.get(b) - w.get(a) || path.basename(a).localeCompare(path.basename(b)));
	}

	/** The session's folder, or null. */
	of(id){ return this.all(id)[0] ?? null; }

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
		for (const [id, set] of this.ids) if (set.size > 1){ const [home, ...others] = this.all(id); if (others.length) out.push({ id, home, others }); }
		return out.sort((a, b) => a.home.localeCompare(b.home));
	}

	/** Every session in the store once, at its home: [{id, dir}]. */
	homes(){
		this.refresh();
		return [...this.ids].filter(([, set]) => set.size).map(([id, set]) => ({ id, dir: set.size === 1 ? path.join(this.root, [...set][0]) : this.of(id) })).filter(r => r.dir);
	}
}
