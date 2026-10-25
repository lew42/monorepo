// A child session is a task in its PARENT SESSION's record (doc: public/framework/core/Session/readme.md, "How work gets into a session").
//   node Server/ChildLinks.mjs [--root <repo>] [--registry <registry.json>] [--names <session id>]   dry run: one manifest line per child, then the counts. Writes nothing.
//   node Server/ChildLinks.mjs --apply [...]                                                          appends the lines
//   node Server/ChildLinks.mjs --entries [--names <session id>] [--root <repo>] [--registry <file>] [--list] [--apply]
//       THE SESSION-ENTRIES BACKFILL (core/Session/readme.md, "Session entries"): every folder under the session's day folders, and every child
//       the registry puts under it, becomes an entry on its parent's record; an old plain link to a session's folder gets a later line with the same
//       id that adds type and spawn. Dry run by default (the manifest printed, nothing written); --apply appends the lines and the manifest
//       (public/framework/ai/sessions/session-entries.jsonl). Entries go at the top level: with 100+ open tasks, a guessed cause is often wrong.
// As a module: ChildLinks.link(child_dir, parent_session, agent) is what Agents.open_task calls at spawn; ChildLinks.plan() / apply() are this script.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import SessionRecord from "./SessionRecord.mjs";
import { role_readme_path } from "../Servex/agents/roles.js";

const SELF_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slash = p => String(p).replaceAll("\\", "/");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const E00 = "e00f55c9-bad4-4ee2-899e-d629ea1eede6";

export default class ChildLinks {
	static by = "ChildLinks";
	/** The cached session folders of a root: Map<id | id8, dir>. Rebuilt when a lookup misses and the cache is older than 10 s. */
	static cache = new Map();

	/** Every session folder under `root` keyed by its full id (folder name, or line 1: assign.session_id / session.id) and by its first 8 characters.
	 *  Where one session has folders on several days, the earliest one that holds a record wins. */
	static sessions(root = SELF_ROOT, rows = {}){
		const map = new Map(), rec = new SessionRecord({ root });
		const line1 = f => { try { return JSON.parse(fs.readFileSync(f, "utf8").split("\n", 1)[0]); } catch { return null; } };
		for (const dir of rec.day_children()){
			const f = SessionRecord.file(dir), l = f && line1(f), name = path.basename(dir);
			const id = l?.assign?.session_id ?? l?.session?.id ?? (UUID.test(name) ? name : null);
			const keys = [id, id && id.slice(0, 8), /^session-([0-9a-f]{8})$/.exec(name)?.[1]].filter(Boolean);
			for (const k of keys) if (!map.has(k) || (f && !SessionRecord.file(map.get(k)))) map.set(k, dir);
		}
		// An agent session's own record is its task folder (Agents.open_task), wherever that sits: the registry knows it.
		for (const r of Object.values(rows)) if (r?.session_id && r.task_dir && !map.has(r.session_id) && SessionRecord.file(this.local(r.task_dir, root))) map.set(r.session_id, this.local(r.task_dir, root));
		return map;
	}

	/** A registry task_dir (an absolute path in the main tree or a worktree) as a folder under `root`. */
	static local(dir, root = SELF_ROOT){ const u = this.url_of(dir, root); return u ? path.join(root, "public", u) : path.resolve(dir); }

	/** The folder of session `id` (full id, else its first 8), or null. Looks in the cache first. */
	static session_dir(id, root = SELF_ROOT, map = null){
		if (!id) return null;
		const hit = m => m.get(id) ?? m.get(String(id).slice(0, 8)) ?? null;
		if (map) return hit(map);
		let c = this.cache.get(root), found = c && hit(c.map);
		if (found && SessionRecord.file(found)) return found;
		if (!c || Date.now() - c.at > 10000){ c = { at: Date.now(), map: this.sessions(root) }; this.cache.set(root, c); found = hit(c.map); }
		return found;
	}

	/** The url of a folder under `<root>/public`, "/framework/…/", or null. A path from another tree (a worktree, the main tree) is matched on its `/public/`. */
	static url_of(dir, root = SELF_ROOT){
		const m = slash(dir).match(/\/public\/(.+?)\/?$/);
		return m && "/" + m[1] + "/";
	}

	/** THE WRITE: the child's folder becomes a task on its parent SESSION's record, when it does not already sit inside that session's folder
	 *  (SessionRecord.link_parent has it then). One {"task":url,"as":agent} line, never twice (add_ref). Returns
	 *  { why } when nothing was written (no-session, no-record, inside, no-folder, self), else { log, wrote: bool }.
	 *  With `entry` (a spawn's {type, spawn, cause}) the line is a Session entry, and its id is the folder name: an agent id is reused across
	 *  spawns, and two entries with one id replace each other on replay (the agent id is kept in spawn.agent). */
	static link(child_dir, parent_session, agent, { root = process.cwd(), by = this.by, map = null, parent_dir = null, entry = null } = {}){
		const abs = path.resolve(root, child_dir), url = this.url_of(abs, root);
		if (!url) return { why: "no-folder" };
		let top = this.session_dir(parent_session, path.resolve(root), map);
		// An agent parent keeps its record in its task folder: Agents.open_task passes it as parent_dir, and it counts when line 1 says it is that session.
		if (!top && parent_dir){ const f = SessionRecord.file(path.resolve(root, parent_dir)); try { if (f && JSON.parse(fs.readFileSync(f, "utf8").split("\n", 1)[0]).assign?.session_id === parent_session) top = path.resolve(root, parent_dir); } catch {} }
		if (!top) return { why: "no-session" };
		if (path.resolve(abs).toLowerCase() === path.resolve(top).toLowerCase()) return { why: "self" };
		if ((path.resolve(abs) + path.sep).toLowerCase().startsWith((path.resolve(top) + path.sep).toLowerCase())) return { why: "inside" };
		const log = SessionRecord.file(top);
		if (!log) return { why: "no-record" };
		const before = fs.statSync(log).size;
		SessionRecord.add_ref(log, url, by, entry ? undefined : agent, entry);
		return { log, url, wrote: fs.statSync(log).size !== before };
	}

	/** Which parent session each registry row belongs to: its recorded `parent_session`; or, for a row from before spawns carried one, the
	 *  parent's name inside `names_session`'s span (the rule of Agents.agents_under), and then anything whose parent is such a child. */
	// `until` = Agents.NAMES_UNTIL: from then on every spawn carries parent_session, so a row is never matched by its parent's name.
	static parents(rows, { names_session = E00, until = "2026-10-25T06:00:00.000Z", since = null } = {}){
		const names = new Set([names_session, ...Object.entries(rows).filter(([, r]) => r?.session_id === names_session).map(([id]) => id)]), out = new Map();
		for (const [id, r] of Object.entries(rows)){
			if (!r) continue;
			if (r.parent_session) out.set(id, r.parent_session);
			else if (names.has(r.parent) && !names.has(id) && (!since || String(r.started_at ?? "") >= since) && String(r.started_at ?? "") < until) out.set(id, names_session);
		}
		for (let grew = true; grew;){ grew = false; for (const [id, r] of Object.entries(rows)) if (r && !out.has(id) && !names.has(id) && out.has(r.parent) && rows[r.parent]?.session_id) { out.set(id, rows[r.parent].session_id); grew = true; } }
		return out;
	}

	/** The manifest: one row per child with a parent session: { agent, session, url, why|"append" }. A dry run; writes nothing. */
	static plan(rows, root = SELF_ROOT, opts = {}){
		const map = this.sessions(root, rows), out = [], seen = new Set();
		const e00 = map.get(opts.names_session ?? E00), first = e00 && SessionRecord.file(e00);
		let since = null; try { since = JSON.parse(fs.readFileSync(first, "utf8").split("\n", 1)[0]).session?.at ?? null; } catch {}
		for (const [agent, session] of this.parents(rows, { ...opts, since })){
			const r = rows[agent], dir = r.task_dir && path.resolve(r.task_dir);
			const row = { agent, session: String(session).slice(0, 8), session_id: session, url: null, why: "append" };
			out.push(row);
			if (!dir) { row.why = "no-folder"; continue; }
			row.url = this.url_of(dir, root);
			if (!row.url || !fs.existsSync(path.join(root, "public", row.url))) { row.why = "no-folder"; continue; }
			const top = this.session_dir(session, root, map), log = top && SessionRecord.file(top);
			if (!top) { row.why = "no-session"; continue; }
			if (!log) { row.why = "no-record"; continue; }
			const abs = path.join(root, "public", row.url);
			if (path.resolve(abs).toLowerCase() === path.resolve(top).toLowerCase()) { row.why = "self"; continue; }
			if ((path.resolve(abs) + path.sep).toLowerCase().startsWith((path.resolve(top) + path.sep).toLowerCase())) { row.why = "inside"; continue; }
			const text = fs.readFileSync(log, "utf8");
			if (text.includes(`"task":"${row.url}"`) || text.includes(`"path":"${row.url}"`) || seen.has(log + row.url)) { row.why = "referenced"; continue; }
			seen.add(log + row.url);
			row.log = slash(path.relative(root, log));
		}
		return out;
	}

	static ENTRIES = "public/framework/ai/sessions/session-entries.jsonl";   // what `--entries --apply` wrote, one row per line, so it can be undone

	/** A folder's kind from its record: "session" (a {session} line 1, or a spawn's {assign} line anywhere: a queued brief writes its own assign first),
	 *  "project" ({class:"Project"}), else "task". The same rule as Task.from_ref. */
	static kind(lines){
		const line1 = lines[0];
		if (line1?.session && typeof line1.session === "object") return "session";
		if (lines.some(l => l?.assign?.session_id && l.assign.agent)) return "session";
		return line1?.class === "Project" || line1?.type === "Project" ? "project" : "task";
	}
	/** The spawn line of a session folder's record: the first {assign} with a session_id and an agent, else line 1. */
	static spawn_line(lines){ return lines.find(l => l?.assign?.session_id && l.assign.agent) ?? lines[0]; }
	/** The spawn configuration of a session folder, from its own line 1 and the registry row: what a Session entry carries. */
	static spawn_of(line1, rows = {}){
		const a = line1?.assign ?? {}, r = rows[a.agent] ?? {};
		const out = { role: a.role ?? r.role, model: a.model ?? r.model, effort: a.effort ?? r.effort, role_readme: a.role_readme ?? (a.role || r.role ? role_readme_path(a.role ?? r.role) : null),
			brief: a.brief, session_id: a.session_id ?? line1?.session?.id, agent: a.agent, at: a.requested_at ?? line1?.session?.at, placed: "backfill" };
		return Object.fromEntries(Object.entries(out).filter(([, v]) => v != null));
	}
	/** The lines of a log that point at `url`: [{cause, as, typed}] (a reference at the top, or nested one level under a cause, or a tasks.add with this path). */
	static refs_in(lines, url){
		const out = [];
		for (const l of lines){
			if (l?.task === url) out.push({ cause: null, as: l.as ?? null, typed: l.type === "Session" });
			for (const [k, v] of Object.entries(l ?? {})) if (v && typeof v === "object" && v.task === url) out.push({ cause: k, as: v.as ?? null, typed: v.type === "Session" });
			for (const a of [].concat(l?.tasks?.add ?? [])) if (a?.path === url) out.push({ cause: null, as: a.id ?? null, typed: a.type === "Session", inline: true });
		}
		return out;
	}

	/** The backfill's dry run for one session: every folder below its day folders (by the parent_log rule), then the registry's children outside
	 *  them. Returns { rows: [{url, log, kind, action, line?}], counts }. action: add (no reference yet), upgrade (a plain reference to a session
	 *  folder), entry (already a Session entry), ref (a task or project folder already referenced), registry rows as ChildLinks.plan has them. */
	static entries_plan(rows = {}, root = SELF_ROOT, { names_session = E00 } = {}){
		const rec = new SessionRecord({ root }), id8 = names_session.slice(0, 8), out = [], texts = new Map(), seen = new Set();
		const lines_of = f => { if (!texts.has(f)) texts.set(f, fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } })); return texts.get(f); };
		const line1 = f => lines_of(f)[0] ?? null;
		const url_of = d => "/" + slash(path.relative(path.join(root, "public"), d)) + "/";
		const by = "ChildLinks --entries", ts = new Date().toISOString();
		const consider = (dir, log) => {
			const own = SessionRecord.log_file(dir); if (!own || !log) return;
			const url = url_of(dir), all = lines_of(own), l1 = this.spawn_line(all), kind = this.kind(all);
			if (seen.has(url)) return; seen.add(url);   // a folder is planned once, on the first log that is its parent (the walk comes before the registry)
			const refs = this.refs_in(lines_of(log), url), row = { url, log: slash(path.relative(root, log)), kind };
			const spawn = kind === "session" ? this.spawn_of(l1, rows) : null;
			if (!refs.length){
				row.action = "add";
				row.line = kind === "session" ? { task: url, type: "Session", spawn, by, ts } : { task: url, by, ts };
			} else if (kind === "session" && !refs.some(r => r.typed)){
				const r = refs.at(-1), body = { task: url, ...(r.as ? { as: r.as } : {}), type: "Session", spawn };
				row.action = "upgrade";
				row.line = r.cause ? { [r.cause]: body, by, ts } : { ...body, by, ts };   // the same id (and the same cause) as the line it upgrades: a later reference replaces the earlier
			} else row.action = refs.some(r => r.typed) ? "entry" : "ref";
			out.push(row);
		};
		const tops = [...rec.day_children()].filter(d => path.basename(d) === "session-" + id8 || path.basename(d) === names_session);
		const walk = dir => { for (const e of fs.readdirSync(dir, { withFileTypes: true })){
			if (!e.isDirectory() || ["node_modules", "screenshots", "transcripts"].includes(e.name)) continue;
			const c = path.join(dir, e.name), own = SessionRecord.log_file(c);
			if (own){ const all = lines_of(own), a = (this.spawn_line(all) ?? all[0])?.assign ?? {}; consider(c, SessionRecord.parent_log(c, { parent: a.parent_task && path.resolve(root, a.parent_task) })); }
			walk(c);
		} };
		for (const top of tops) walk(top);
		// The registry's children whose folder is outside the session's folders (core/Page/tasks/…, spawned/…): an entry on the session's own record.
		const map = this.sessions(root, rows);
		for (const p of this.plan(rows, root, { names_session })){
			if (!p.url || ["no-folder", "no-session", "no-record", "self", "inside"].includes(p.why)) continue;
			const top = this.session_dir(p.session_id, root, map), log = top && SessionRecord.file(top);
			if (log) consider(path.join(root, "public", p.url), log);
		}
		const counts = {}; for (const r of out){ counts[r.action] = (counts[r.action] ?? 0) + 1; counts["kind:" + r.kind] = (counts["kind:" + r.kind] ?? 0) + 1; }
		return { rows: out, counts, session_folders: tops.map(d => slash(path.relative(root, d))) };
	}
	/** Append each planned line (add, upgrade) to its log, and the manifest. Never twice: a row whose url is already a Session entry is skipped. Returns the number written. */
	static entries_apply(plan, root = SELF_ROOT){
		const run = new Date().toISOString(), manifest = [{ run, kind: "session-entries", counts: plan.counts }];
		let n = 0;
		for (const r of plan.rows){
			if (!r.line) continue;
			const log = path.join(root, r.log), text = fs.readFileSync(log, "utf8");
			if (this.refs_in(text.split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }), r.url).some(x => x.typed)) continue;
			fs.appendFileSync(log, (text && !text.endsWith("\n") ? "\n" : "") + JSON.stringify(r.line) + "\n");
			manifest.push({ run, log: r.log, url: r.url, action: r.action, line: r.line }); n++;
		}
		const mf = path.join(root, this.ENTRIES); fs.mkdirSync(path.dirname(mf), { recursive: true });
		fs.appendFileSync(mf, manifest.map(l => JSON.stringify(l)).join("\n") + "\n");
		return n;
	}

	/** Append the lines the plan says (`why: "append"`). Returns the number written. */
	static apply(plan, root = SELF_ROOT, rows = {}){
		const map = this.sessions(root, rows);
		let n = 0;
		for (const row of plan) if (row.why === "append" && this.link(path.join(root, "public", row.url), row.session_id, row.agent, { root, by: "ChildLinks --apply", map }).wrote) n++;
		return n;
	}
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href){
	const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
	const root = path.resolve(arg("--root") ?? SELF_ROOT);
	let regfile = arg("--registry");
	if (!regfile){ const { place } = await import("../Servex/home.js"); regfile = place("registry.json"); }
	const rows = JSON.parse(fs.readFileSync(regfile, "utf8"));
	if (process.argv.includes("--entries")){
		const plan = ChildLinks.entries_plan(rows, root, arg("--names") ? { names_session: arg("--names") } : {});
		console.log("session folders:", plan.session_folders.join("  "));
		for (const r of plan.rows) if (process.argv.includes("--list") || r.line) console.log(`${r.action.padEnd(8)} ${r.kind.padEnd(8)} ${r.url}  -> ${r.log}`);
		console.log("counts:", JSON.stringify(plan.counts));
		const stray = plan.rows.filter(r => r.kind === "task");
		console.log(`item 33 check: ${stray.length} folder(s) are neither a session nor a project (a task that should have been a line)` + (stray.length ? ": " + stray.slice(0, 8).map(r => r.url).join("  ") + (stray.length > 8 ? " …" : "") : ""));
		if (process.argv.includes("--apply")) console.log(`appended ${ChildLinks.entries_apply(plan, root)} line(s); manifest ${ChildLinks.ENTRIES}`);
		else console.log(`dry run: --apply would append ${plan.rows.filter(r => r.line).length} line(s)`);
		process.exit(0);
	}
	const plan = ChildLinks.plan(rows, root, arg("--names") ? { names_session: arg("--names") } : {});
	for (const r of plan) console.log(`${r.session}  ${r.url ?? "-"}  ${r.agent}  ${r.why}`);
	const by = {}; for (const r of plan) by[r.why] = (by[r.why] ?? 0) + 1;
	console.log(`children with a parent session: ${plan.length}; ` + Object.entries(by).map(([k, v]) => `${k} ${v}`).join(", "));
	if (process.argv.includes("--apply")) console.log(`appended ${ChildLinks.apply(plan, root, rows)} line(s)`);
	else console.log(`dry run: --apply would append ${by.append ?? 0} line(s)`);
}
