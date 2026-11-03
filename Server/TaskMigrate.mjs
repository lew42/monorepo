/* Old session tasks -> module task homes. An old task whose module is CLEAR gets <module>/tasks/<slug>/task.jsonl (its primary home);
 * its old folder only gains one {"home":"<url>"} line, and the home names the old folder in `sessions`. Never deletes, never rewrites.
 *   node Server/TaskMigrate.mjs                    dry run: counts before/after, what each task would do (writes nothing)
 *   node Server/TaskMigrate.mjs --report <file>    dry run, and save the report as markdown
 *   node Server/TaskMigrate.mjs --apply            write, then run the round-trip check
 *   node Server/TaskMigrate.mjs --check            the round-trip check alone
 *   --root <public dir>                            run on a copy instead of ./public
 * Plan and reasons: public/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/plan.md */
import fs from "node:fs";
import path from "node:path";
import LineKey from "../public/framework/core/Item/LineKey.js";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { Task } from "../public/framework/core/Task/Task.js";
import { check as check_line } from "../.claude/hooks/jsonl-schema.mjs";
import { slug_of, PAGE_JS } from "../Servex/agents/page_tools.js";
import TaskHomes from "./TaskHomes.mjs";
import ModuleLog from "./ModuleLog.mjs";

const NL = String.fromCharCode(10);
const DAY = 864e5;

export default class TaskMigrate {
	static PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
	static CATCH_ALL = new Set(["ai", "ext", "core", "ui", "ux"]);
	static QUIET_DAYS = 7;
	// A title prefix that is a label, not a module ("Task: …" was the August habit).
	static PREFIX_WORDS = new Set(["task", "tasks", "fix", "bug", "plan", "brief", "requirements", "research", "audit"]);
	static BY = "task-migrate";
	// Data keys the home's verb line (or line 1) owns; the rest of the replayed data is copied in one {"set"} line.
	static OWN_KEYS = new Set(["id", "state", "completed_at", "stopped_at", "started_at", "ran_ms", "why", "commits", "title", "module", "path", "parent", "tags", "source", "sessions", "home", "waiting_on", "waiting_what", "waiting_since", "verdict", "approved_by", "approved_note"]);

	constructor({ root = TaskMigrate.PUBLIC, now = Date.now(), log = console.log } = {}){
		this.root = path.resolve(root);
		this.framework = path.join(this.root, "framework");
		this.sessions = path.join(this.framework, "ai", "sessions");
		this.ledger = path.join(this.sessions, "task-migrations.jsonl");
		this.now = now;
		this.log = log;
		this._readme = new Map();
	}

	/* ---------- reading ---------- */

	static parse(text){
		const lines = [], bad = [];
		text.split(NL).forEach((l, i) => { if (!l.trim()) return; try { lines.push(LineKey.deep(JSON.parse(l))); } catch { bad.push(i + 1); } });
		return { lines, bad };
	}

	app_path(dir){ return "/" + path.relative(this.root, dir).split(path.sep).join("/") + "/"; }

	// Every folder under ai/sessions/ that holds a task.jsonl.
	scan(){
		const out = [];
		const walk = dir => {
			let ents;
			try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			if (ents.some(e => e.isFile() && e.name === "task.jsonl")) out.push(this.read(dir));
			for (const e of ents) if (e.isDirectory() && e.name !== "node_modules" && !e.name.startsWith(".")) walk(path.join(dir, e.name));
		};
		walk(this.sessions);
		return out;
	}

	read(dir){
		const file = path.join(dir, "task.jsonl"), raw = fs.readFileSync(file, "utf8");
		const { lines, bad } = TaskMigrate.parse(raw);
		const req = path.join(dir, "requirements.md");
		return { dir, file, url: this.app_path(dir), raw, lines, bad, slug: path.basename(dir), requirements: fs.existsSync(req) ? fs.readFileSync(req, "utf8") : null };
	}

	/* ---------- modules ---------- */

	// Exact-case: Windows matches `Servex` to `servex`, so each segment is checked against its parent's listing.
	is_module(rel){
		if (!rel || /(^|\/)(sessions|tasks)(\/|$)/.test(rel) || /^ai\/\d{4}/.test(rel)) return false;
		if (this._readme.has(rel)) return this._readme.get(rel);
		let dir = this.framework, ok = true;
		for (const seg of rel.split("/")){
			let names;
			try { names = fs.readdirSync(dir); } catch { ok = false; break; }
			if (!names.includes(seg)){ ok = false; break; }
			dir = path.join(dir, seg);
		}
		ok = ok && fs.existsSync(path.join(dir, "readme.md")) && fs.statSync(dir).isDirectory();
		this._readme.set(rel, ok);
		return ok;
	}

	// The nearest module above a framework-relative path (a file or a folder).
	module_of(rel){
		if (/^\/?ai\/(sessions|\d{4})(\/|$)/.test(String(rel ?? ""))) return "";   // a session's own files say nothing about a module
		const parts = String(rel ?? "").replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
		for (; parts.length; parts.pop()) if (this.is_module(parts.join("/"))) return parts.join("/");
		return "";
	}

	// "public/framework/x/y", "/framework/x/y", "framework/x/y" -> "x/y"; anything else -> "".
	static framework_rel(p){
		const m = /(?:^|\/)framework\/([^\s"'`)\]]+)/.exec(String(p ?? "").replace(/\\/g, "/"));
		return m ? m[1].replace(/[.,;:]+$/, "") : "";
	}

	// Every module, by its last segment (lowercase), for a title prefix like "Page:" -> core/Page.
	module_names(){
		if (this._names) return this._names;
		const names = new Map();
		const walk = (dir, rel, depth) => {
			if (depth > 3) return;
			let ents;
			try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of ents){
				if (!e.isDirectory() || e.name.startsWith(".") || e.name === "node_modules") continue;
				const r = rel ? `${rel}/${e.name}` : e.name;
				if (this.is_module(r)){ const k = e.name.toLowerCase(); names.set(k, [...(names.get(k) ?? []), r]); }
				if (!/^(sessions|tasks)$/.test(e.name) && !/^\d{4}/.test(e.name)) walk(path.join(dir, e.name), r, depth + 1);
			}
		};
		walk(this.framework, "", 1);
		return this._names = names;
	}

	prefix_module(title){
		const m = /^\s*([A-Za-z][A-Za-z0-9_\/-]*)\s*:\s/.exec(String(title ?? ""));
		if (!m) return "";
		const name = m[1].replace(/^\/+|\/+$/g, "");
		if (TaskMigrate.PREFIX_WORDS.has(name.toLowerCase())) return "";
		if (name.includes("/")) return this.is_module(name) ? name : "";
		const hits = this.module_names().get(name.toLowerCase()) ?? [];
		return hits.length === 1 ? hits[0] : "";   // ambiguous names give no signal
	}

	// The most-named module, a deep one before a catch-all; a tie gives no signal.
	static top(counts){
		const deep = [...counts].filter(([m]) => !TaskMigrate.CATCH_ALL.has(m));
		const sorted = (deep.length ? deep : [...counts]).sort((a, b) => b[1] - a[1]);
		return sorted.length && (sorted.length === 1 || sorted[0][1] > sorted[1][1]) ? sorted[0][0] : "";
	}

	/* ---------- one task ---------- */

	static title_of(t, a){
		const h1 = /^#\s+(.+)$/m.exec(t.requirements ?? "")?.[1];
		const req = typeof a.request === "string" ? a.request.split(NL)[0] : "";
		return [a.title, h1, req].find(s => typeof s === "string" && s.trim())?.trim().slice(0, 200) ?? t.slug.replace(/-/g, " ");
	}

	// The newest time any line names: when the task last did something.
	static last_time(lines){
		let best = 0;
		const see = v => { const n = typeof v === "string" ? Date.parse(v) : NaN; if (n > best) best = n; };
		for (const l of lines){
			see(l.at); see(l.ts);
			for (const v of Object.values(l)) if (v && typeof v === "object" && !Array.isArray(v)){ see(v.at); see(v.ts); see(v.landed_at); see(v.requested_at); see(v.closed_at); }
		}
		return best || null;
	}

	classify(t){
		const a = Object.assign({}, ...t.lines.filter(l => l.assign && typeof l.assign === "object").map(l => l.assign));
		const title = TaskMigrate.title_of(t, a);
		const signals = {};
		const prefix = this.prefix_module(a.title ?? /^#\s+(.+)$/m.exec(t.requirements ?? "")?.[1]);
		if (prefix) signals.prefix = prefix;
		const brief = TaskMigrate.framework_rel(a.brief);
		if (brief && !/^ai\/(sessions|\d{4})/.test(brief)){ const m = this.module_of(brief); if (m) signals.brief = m; }
		const files = new Map();
		for (const l of t.lines) for (const f of [].concat(l.action?.files ?? [])){
			const m = this.module_of(TaskMigrate.framework_rel(f));
			if (m) files.set(m, (files.get(m) ?? 0) + 1);
		}
		if (TaskMigrate.top(files)) signals.files = TaskMigrate.top(files);
		const req = new Map();
		for (const hit of (t.requirements ?? "").match(/(?:public\/)?\/?framework\/[A-Za-z0-9_\/.-]+/g) ?? []){
			const m = this.module_of(TaskMigrate.framework_rel(hit));
			if (m) req.set(m, (req.get(m) ?? 0) + 1);
		}
		if (TaskMigrate.top(req)) signals.reqpath = TaskMigrate.top(req);

		const deep = m => m && !TaskMigrate.CATCH_ALL.has(m);
		let module = "", by = "";
		if (deep(signals.prefix)) [module, by] = [signals.prefix, "prefix"];
		else if (deep(signals.brief)) [module, by] = [signals.brief, "brief"];
		else if (deep(signals.files) && signals.files === signals.reqpath) [module, by] = [signals.files, "files+reqpath"];
		else if (deep(signals.files) && files.size === 1 && !signals.reqpath) [module, by] = [signals.files, "files only, one module"];
		let unclear = "";
		if (!module){
			const vals = Object.values(signals);
			if (!vals.length) unclear = "no signal";
			else if (!vals.some(deep)) unclear = "catch-all only";
			else if (vals.filter(deep).length === 1 && new Set(vals.filter(deep)).size === 1) unclear = "one signal";
			else unclear = "signals disagree";
		}
		const tags = [...new Set(Object.values(signals).filter(m => m && m !== module))];
		return { assign: a, title, signals, module, by, unclear, tags };
	}

	// What to do with one old task: move | done | stay (with a reason).
	decide(t){
		const c = this.classify(t);
		const base = { old: t.url, slug: t.slug, title: c.title, signals: c.signals, module: c.module, by: c.by, tags: c.tags };
		const home_line = t.lines.find(l => typeof l.home === "string");
		if (t.bad.length) return { ...base, action: "stay", reason: "malformed lines" };
		if (typeof t.lines[0]?.id === "string" && typeof t.lines[0]?.path === "string") return { ...base, action: "stay", reason: "already new format" };
		if (t.lines.some(l => typeof l.task === "string" || (l.tasks && typeof l.tasks === "object") || typeof l.file === "string")) return { ...base, action: "stay", reason: "has subtask lines" };
		if (!c.module) return { ...base, action: "stay", reason: `unclear: ${c.unclear}` };
		const slug = slug_of(t.slug);
		const list_dir = path.join(this.framework, ...c.module.split("/"), "tasks");
		const dir = path.join(list_dir, slug);
		const plan = { ...base, slug, dir, list_dir, url: this.app_path(dir), list: this.app_path(list_dir) };
		if (home_line && home_line.home !== plan.url) return { ...plan, action: "stay", reason: `points to another home ${home_line.home}` };
		const own = this.home_line1(dir);
		if (own){
			if (own.sessions?.some?.(s => s?.task === t.url)) return { ...plan, action: "done" };
			return { ...plan, action: "stay", reason: "slug clash: home exists" };
		}
		if (fs.existsSync(dir)) return { ...plan, action: "stay", reason: "slug clash: folder exists" };
		const last = TaskMigrate.last_time(t.lines);
		if (last && this.now - last < TaskMigrate.QUIET_DAYS * DAY) return { ...plan, action: "stay", reason: "active in the last 7 days" };
		return { ...plan, action: "move", last };
	}

	home_line1(dir){
		const f = path.join(dir, "task.jsonl");
		if (!fs.existsSync(f)) return null;
		return TaskMigrate.parse(fs.readFileSync(f, "utf8")).lines[0] ?? null;
	}

	// All decisions; two old tasks aiming at one home are both refused.
	plan(tasks = this.scan()){
		const rows = tasks.map(t => ({ t, d: this.decide(t) }));
		const want = new Map();
		for (const { d } of rows) if (d.action === "move") want.set(d.url, (want.get(d.url) ?? 0) + 1);
		for (const { d } of rows) if (d.action === "move" && want.get(d.url) > 1) Object.assign(d, { action: "stay", reason: "slug clash: two old tasks want this home" });
		return rows;
	}

	/* ---------- writing ---------- */

	// The new home's lines, from the old task's own replay: line 1, the copied data, commits, then one verb with the original time.
	home_lines(t, d){
		const old = Task.replay(t.lines);
		const data = { ...old.data };
		const brief = TaskMigrate.framework_rel(d.signals.brief ? data.brief : "") || (t.requirements != null ? path.relative(this.framework, path.join(t.dir, "requirements.md")).split(path.sep).join("/") : "");
		// No `source`: it now means WHO asked (task-system step 3d). The brief's path goes in data.brief; an old doc-path `source` too; an old who-asked name stays `source`.
		const line1 = {
			id: d.slug, path: d.url, parent: d.list, title: d.title, module: d.module,
			...(d.tags.length ? { tags: d.tags } : {}),
			sessions: [{ id: old.session ?? null, task: t.url }],
			by: TaskMigrate.BY, ts: new Date(this.now).toISOString(),
		};
		const set = Object.fromEntries(Object.entries(data).filter(([k]) => !TaskMigrate.OWN_KEYS.has(k)));
		if (brief) set.brief = `/framework/${brief}`;
		else if (typeof data.source === "string" && data.source.includes("/")) set.brief = data.source;
		if (typeof data.source === "string" && !data.source.includes("/")) line1.source = data.source;   // already a who-asked name: keep it
		const out = [line1];
		if (Object.keys(set).length) out.push({ set });
		const hashes = [...old.commits];
		for (const l of t.lines) if (l.commit && typeof l.commit === "object" && typeof l.commit.hash === "string") hashes.push(l.commit.hash);
		for (const h of [...new Set(hashes.map(s => String(s).trim()).filter(Boolean))]) out.push({ commit: h });
		const verb = this.verb_for(old, d);
		if (verb) out.push(verb);
		return { lines: out, old };
	}

	verb_for(old, d){
		const s = old.state;
		if (s === "complete") return { complete: { at: old.data.completed_at ?? old.data.landed_at } };
		if (s === "stopped") return { stop: { at: old.data.stopped_at ?? new Date(d.last ?? this.now).toISOString(), why: old.data.why ?? old.data.closed_why ?? null } };
		if (s === "idle") return null;
		const when = d.last ? new Date(d.last).toISOString() : null;
		return { stop: { at: when, why: `migrated: never landed or closed; last line ${when ? when.slice(0, 10) : "unknown"}` } };
	}

	static sha(text){ return crypto.createHash("sha256").update(text).digest("hex"); }

	static append(file, line){
		const text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.appendFileSync(file, (text && !text.endsWith(NL) ? NL : "") + JSON.stringify(line) + NL);
	}

	// One task, every step checked first, so a rerun (or a crash halfway) repairs instead of doubling.
	write(t, d){
		const did = [];
		const home_file = path.join(d.dir, "task.jsonl");
		const before = { sha: TaskMigrate.sha(t.raw), bytes: Buffer.byteLength(t.raw), lines: t.lines.length };
		if (!fs.existsSync(home_file)){
			const { lines } = this.home_lines(t, d);
			fs.mkdirSync(d.dir, { recursive: true });
			const tmp = home_file + ".tmp";
			fs.writeFileSync(tmp, lines.map(l => JSON.stringify(l)).join(NL) + NL);
			fs.renameSync(tmp, home_file);
			did.push("home");
		}
		const page = path.join(d.dir, "page.js");
		if (!fs.existsSync(page)){ fs.writeFileSync(page, PAGE_JS); did.push("page.js"); }
		const list_file = path.join(d.list_dir, "task.jsonl");
		if (!fs.existsSync(list_file)){
			TaskMigrate.append(list_file, { id: "tasks", path: d.list, title: `${d.module} tasks`, mode: "parallel" });
			did.push("list");
		}
		const refs = TaskMigrate.parse(fs.readFileSync(list_file, "utf8")).lines;
		if (!refs.some(l => l.task === d.url)){ TaskMigrate.append(list_file, { task: d.url, by: TaskMigrate.BY, ts: new Date(this.now).toISOString() }); did.push("list ref"); }
		if (ModuleLog.record(d.list_dir, `${d.slug}/page.js`)) did.push("tasks/files.jsonl");
		if (ModuleLog.record(path.dirname(d.list_dir), "tasks/")) did.push("module files.jsonl");
		this.with_index(() => { if (TaskHomes.add(d.list, TaskMigrate.BY)) did.push("/tasks/ index"); });
		const old_now = fs.readFileSync(t.file, "utf8");
		if (!TaskMigrate.parse(old_now).lines.some(l => l.home === d.url)){
			const line = { home: d.url };
			const why = check_line(t.file, line);
			if (why) throw new Error(`${t.url}: the home line was refused: ${why}`);
			TaskMigrate.append(t.file, line);
			did.push("old home line");
		}
		if (!this.ledger_lines().some(l => l.old === t.url && l.home === d.url)){
			TaskMigrate.append(this.ledger, { at: new Date(this.now).toISOString(), old: t.url, home: d.url, module: d.module, by: d.by, signals: d.signals, before, who: TaskMigrate.BY });
			did.push("ledger");
		}
		return did;
	}

	// TaskHomes keeps its index path statically; point it at this root for the call.
	with_index(fn){
		const keep = [TaskHomes.PUBLIC, TaskHomes.INDEX];
		TaskHomes.PUBLIC = this.root; TaskHomes.INDEX = path.join(this.root, "tasks", "task.jsonl");
		try { return fn(); } finally { [TaskHomes.PUBLIC, TaskHomes.INDEX] = keep; }
	}

	ledger_lines(){ return fs.existsSync(this.ledger) ? TaskMigrate.parse(fs.readFileSync(this.ledger, "utf8")).lines : []; }

	apply(rows = this.plan()){
		const moved = [];
		for (const { t, d } of rows) if (d.action === "move" || d.action === "done"){
			const did = this.write(t, d);
			if (did.length) moved.push({ old: t.url, home: d.url, did });
		}
		return moved;
	}

	/* ---------- the round trip ---------- */

	// Every ledger line: old -> home and home -> old both resolve, the old file only grew, and both replays tell the same story.
	check(){
		const problems = [], ledger = this.ledger_lines();
		const dir_of = url => path.join(this.root, ...url.split("/").filter(Boolean));
		for (const e of ledger){
			const old_file = path.join(dir_of(e.old), "task.jsonl"), home_file = path.join(dir_of(e.home), "task.jsonl");
			const say = why => problems.push({ old: e.old, home: e.home, why });
			if (!fs.existsSync(old_file)){ say("old task.jsonl is gone"); continue; }
			if (!fs.existsSync(home_file)){ say("home task.jsonl is missing"); continue; }
			const old_raw = fs.readFileSync(old_file, "utf8");
			const head = Buffer.from(old_raw).subarray(0, e.before.bytes).toString("utf8");
			if (TaskMigrate.sha(head) !== e.before.sha) say("old file changed (not a pure append)");
			const old_lines = TaskMigrate.parse(old_raw).lines, home_lines = TaskMigrate.parse(fs.readFileSync(home_file, "utf8")).lines;
			if (!old_lines.some(l => l.home === e.home)) say("old folder has no home line");
			if (!home_lines[0]?.sessions?.some?.(s => s?.task === e.old)) say("home does not name the old folder in sessions");
			const list = path.join(path.dirname(path.dirname(home_file)), "task.jsonl");
			if (!fs.existsSync(list) || !TaskMigrate.parse(fs.readFileSync(list, "utf8")).lines.some(l => l.task === e.home)) say("module list does not reference the home");
			if (!fs.existsSync(path.join(path.dirname(home_file), "page.js"))) say("home has no page.js");
			const was = Task.replay(old_lines.filter(l => typeof l.home !== "string")), now = Task.replay(home_lines);
			const same = (k, a, b) => { if (JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)) say(`${k} differs: ${JSON.stringify(a)?.slice(0, 80)} vs ${JSON.stringify(b)?.slice(0, 80)}`); };
			const stale = was.state !== "complete" && was.state !== "stopped" && now.state === "stopped" && /^migrated: never landed/.test(now.data.why ?? "");
			if (!stale){ same("state", was.state, now.state); same("completion", was.completion, now.completion); }
			if (was.state === "complete") same("completed_at", was.data.completed_at, now.data.completed_at);
			same("outcome", was.data.outcome, now.data.outcome);
			same("session", was.session, now.session);
			const missing = was.commits.filter(h => !now.commits.includes(h));
			if (missing.length) say(`commits missing: ${missing.join(" ")}`);
		}
		// The other direction: every old folder that says it has a home is in the ledger.
		const listed = new Set(ledger.map(e => e.old));
		const tasks = this.scan();
		for (const t of tasks) for (const l of t.lines) if (typeof l.home === "string" && !listed.has(t.url)) problems.push({ old: t.url, home: l.home, why: "home line with no ledger entry" });
		return { checked: ledger.length, old_tasks: tasks.length, problems };
	}

	/* ---------- counts and the report ---------- */

	counts(tasks){
		const homes = this.with_index(() => TaskHomes.scan());
		const listed = this.with_index(() => TaskHomes.listed());
		let module_tasks = 0;
		const walk = dir => { let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of ents) if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules"){
				const sub = path.join(dir, e.name);
				if (e.name === "sessions" && dir === path.join(this.framework, "ai")) continue;
				if (path.basename(dir) === "tasks" && fs.existsSync(path.join(sub, "task.jsonl"))) module_tasks++;
				walk(sub);
			} };
		walk(this.framework);
		const lines = tasks.reduce((n, t) => n + t.lines.length, 0);
		return { old_tasks: tasks.length, old_lines: lines, module_tasks, homes_in_index: listed.size, homes_found: homes.length };
	}

	report(rows, before){
		const by = f => { const m = new Map(); for (const r of rows){ const k = f(r); if (k != null) m.set(k, (m.get(k) ?? 0) + 1); } return [...m].sort((a, b) => b[1] - a[1]); };
		const move = rows.filter(r => r.d.action === "move"), done = rows.filter(r => r.d.action === "done");
		const new_lists = new Set(move.filter(r => !fs.existsSync(path.join(r.d.list_dir, "task.jsonl"))).map(r => r.d.list));
		const after = { ...before, old_lines: before.old_lines + move.length, module_tasks: before.module_tasks + move.length, homes_in_index: before.homes_in_index + new_lists.size };
		const row = (k, b, a) => `| ${k} | ${b} | ${a} |`;
		const L = [
			`# Task migration: ${this.applied ? "applied" : "dry run"}, ${new Date(this.now).toISOString().slice(0, 16).replace("T", " ")} UTC`, "",
			`Root: \`${this.root}\`. Script: [Server/TaskMigrate.mjs](/Server/TaskMigrate.mjs). Plan: [plan.md](plan.md).`, "",
			`**${move.length} old tasks would get a module home** (${done.length} already have one); ${rows.length - move.length - done.length} stay in their session folder, each for the reason below. Nothing is deleted; each moved old file gains one line.`, "",
			"## Before and after", "", "| | before | after |", "|---|---|---|",
			row("old tasks (ai/sessions task.jsonl)", before.old_tasks, before.old_tasks),
			row("old task lines", before.old_lines, after.old_lines + " (+1 `home` line per move)"),
			row("module task folders (`<module>/tasks/<slug>/`)", before.module_tasks, after.module_tasks),
			row("homes in /tasks/ index", before.homes_in_index, after.homes_in_index),
			"", "## What happens to each old task", "", "| action | tasks |", "|---|---|",
			...by(r => r.d.action === "stay" ? `stay: ${r.d.reason.replace(/ \/framework.*$/, "")}` : r.d.action).map(([k, n]) => `| ${k} | ${n} |`),
			"", "## Moves by module", "", "| module | tasks | how the module was found |", "|---|---|---|",
			...by(r => r.d.action === "move" ? r.d.module : null).map(([m, n]) => `| [${m}](/framework/${m}/) | ${n} | ${by(r => r.d.action === "move" && r.d.module === m ? r.d.by : null).map(([b, c]) => `${b} ${c}`).join(", ")} |`),
			"", "## Moves by state in the new home", "", "| state | tasks |", "|---|---|",
			...by(r => r.d.action === "move" ? this.state_label(r) : null).map(([k, n]) => `| ${k} | ${n} |`),
			"", `## New module lists (${new_lists.size})`, "", [...new_lists].sort().map(u => `\`${u}\``).join(" · ") || "none",
			"", "## Refused: slug clashes", "",
			...(rows.filter(r => /slug clash|another home/.test(r.d.reason ?? "")).map(r => `- [${r.d.old}](${r.d.old}) → \`${r.d.url}\`: ${r.d.reason}`)), "",
			"## Sample moves (first 25)", "", "| old folder | new home | title | signals |", "|---|---|---|---|",
			...move.slice(0, 25).map(r => `| [${r.d.old.split("/").slice(-3, -1).join("/")}](${r.d.old}) | [${r.d.module}/tasks/${r.d.slug}](${r.d.url}) | ${String(r.d.title).replace(/\|/g, "/").slice(0, 70)} | ${Object.entries(r.d.signals).map(([k, v]) => `${k}=${v}`).join(", ")} |`),
			"", "## Unclear, sample (stay; a later run or a person decides)", "", "| old folder | reason | signals |", "|---|---|---|",
			...rows.filter(r => /^unclear: (one signal|signals disagree)/.test(r.d.reason ?? "")).slice(0, 20).map(r => `| [${r.d.old.split("/").slice(-3, -1).join("/")}](${r.d.old}) | ${r.d.reason} | ${Object.entries(r.d.signals).map(([k, v]) => `${k}=${v}`).join(", ")} |`),
		];
		return L.join(NL) + NL;
	}

	state_label({ t }){
		const s = Task.replay(t.lines).state;
		return s === "complete" ? "complete (landed)" : s === "stopped" ? "stopped (closed)" : s === "idle" ? "idle" : `stopped: migrated, never landed (was ${s})`;
	}

	static async main(argv = process.argv.slice(2)){
		const arg = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
		const m = new TaskMigrate({ root: arg("--root") ?? TaskMigrate.PUBLIC });
		if (argv.includes("--check")){ const c = m.check(); console.log(JSON.stringify(c, null, 1)); return c.problems.length ? 1 : 0; }
		const tasks = m.scan(), before = m.counts(tasks), rows = m.plan(tasks);
		if (argv.includes("--apply")){
			const moved = m.apply(rows);
			m.applied = true;
			const c = m.check(), after = m.counts(m.scan());
			console.log(`applied: ${moved.length} tasks written; before ${JSON.stringify(before)}; after ${JSON.stringify(after)}; check: ${c.checked} checked, ${c.problems.length} problems`);
			for (const p of c.problems.slice(0, 20)) console.log(`  ${p.old} -> ${p.home}: ${p.why}`);
			return c.problems.length ? 1 : 0;
		}
		const text = m.report(rows, before);
		if (arg("--report")) fs.writeFileSync(arg("--report"), text);
		console.log(text.split(NL).slice(0, 40).join(NL));
		return 0;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await TaskMigrate.main();
