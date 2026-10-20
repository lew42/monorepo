#!/usr/bin/env node
// ProjectMove: moves a project folder (one holding project.jsonl) from its session into a module, and indexes the move itself.
//   node Server/ProjectMove.mjs <folder> <module>            dry run: prints where it would go (default)
//   node Server/ProjectMove.mjs <folder> <module> --apply    git mv to public/framework/<module>/projects/YYYY/MM/DD/<slug>/
//   node Server/ProjectMove.mjs --undo [--run <id>]          put the last (or named) move back
// <folder> is a repo path or a site path; <module> is "core/Task" (public/framework/<module>/ must exist).
// One apply does four things: moves the folder (git mv when tracked), appends a `project` line to the day stream (ai/sessions/YYYY/MM/DD/index.jsonl)
// of the project's start day AND of today, leaves a one-line `log` pointer in the owning session's session.jsonl, and appends the move to the manifest.
// Undo reverses the folder and appends a mirror line to each of them; nothing is rewritten. Door for agents: the Servex tool `move_project`. Doc: public/framework/ai/tasks/doc/projects.md
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import AIIndexStream from "./AIIndexStream.mjs";
import SessionRecord from "./SessionRecord.mjs";
import Day from "../public/framework/core/Session/Day.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const slash = p => p.split(path.sep).join("/");

export default class ProjectMove {
	static ROOT = path.resolve(HERE, "..");                      // a test points this at a scratch repo
	static MANIFEST = "public/framework/ai/sessions/project-moves.jsonl";

	static abs(rel){ return path.join(this.ROOT, rel); }
	static rel(abs){ return slash(path.relative(this.ROOT, abs)); }
	static url(rel){ return "/" + rel.replace(/^public\//, "").replace(/\/?$/, "/"); }
	static lines(file){
		try { return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(l => l.startsWith("{")).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }
		catch { return []; }
	}
	static append(file, obj){ fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, JSON.stringify(obj) + "\n"); }
	static git(...args){ return execFileSync("git", args, { cwd: this.ROOT, encoding: "utf8", windowsHide: true }).trim(); }
	static tracked(rel){ try { return !!this.git("ls-files", "--", rel); } catch { return false; } }

	/** The project's own facts, replayed through core/Task/Project.js: title, state, completion (0..1). */
	static async read(dir){
		const lines = this.lines(path.join(dir, "project.jsonl"));
		if (!lines.length) throw new Error(`no project.jsonl in ${this.rel(dir)}`);
		const { default: Project } = await import(pathToFileURL(path.join(this.ROOT, "public/framework/core/Task/Project.js")).href);
		const p = Project.from_lines(lines);
		const at = lines.map(l => Object.values(l).find(v => v && typeof v === "object")?.at ?? l.at).find(Boolean);
		return { title: p.get_one("title") ?? path.basename(dir), state: p.state, completion: p.completion, at };
	}

	/** Which day the project started: the YYYY/MM/DD in its session path, else the first line's time, else today. */
	static start_day(rel, at){
		const m = rel.match(/sessions\/(\d{4})\/(\d{2})\/(\d{2})\//);
		return m ? `${m[1]}-${m[2]}-${m[3]}` : (Day.of(at) || Day.of());
	}

	/** The session folder that owns a project: the nearest ancestor holding a session.jsonl (or an old task.jsonl). */
	static session_of(dir){
		for (let d = path.dirname(dir); d.startsWith(this.ROOT) && d !== this.ROOT; d = path.dirname(d)) if (SessionRecord.file(d)) return d;
		return null;
	}

	static async plan({ from, module }){
		const rel = from.startsWith("/framework/") ? "public" + from.replace(/\/$/, "") : slash(path.relative(this.ROOT, path.resolve(this.ROOT, from)));
		const dir = this.abs(rel);
		if (!fs.existsSync(path.join(dir, "project.jsonl"))) throw new Error(`${rel} has no project.jsonl; only a project folder moves`);
		if (rel.includes("/projects/")) throw new Error(`${rel} is already in a module's projects/ folder`);
		const home = `public/framework/${module.replace(/^\/|\/$/g, "")}`;
		if (!fs.existsSync(this.abs(home))) throw new Error(`module ${module} does not exist (${home})`);
		const facts = await this.read(dir), slug = path.basename(dir), day = this.start_day(rel, facts.at);
		const to = `${home}/projects/${day.replaceAll("-", "/")}/${slug}`;
		if (fs.existsSync(this.abs(to))) throw new Error(`${to} already exists`);
		const session = this.session_of(dir);
		return { from: rel, to, module, slug, day, ...facts, session: session && this.rel(session) };
	}

	/** Dry run unless `apply`. Returns the plan, plus the run id and the lines written when applied. */
	static async move({ from, module, apply = false }){
		const plan = await this.plan({ from, module });
		if (!apply) return { dry_run: true, ...plan };
		const store = this.abs("public/framework/ai/sessions"), now = new Date().toISOString();
		fs.mkdirSync(path.dirname(this.abs(plan.to)), { recursive: true });
		if (this.tracked(plan.from)) this.git("mv", plan.from, plan.to); else fs.renameSync(this.abs(plan.from), this.abs(plan.to));
		const row = { id: plan.slug, path: plan.to, url: this.url(plan.to), title: plan.title, state: plan.state, completion: plan.completion, moved_from: plan.from };
		AIIndexStream.append(store, "project", row, `${plan.day}T00:00:00`);   // the start day's stream now points at the new home
		AIIndexStream.append(store, "project", { ...row, moved: true }, now);   // today's stream shows the move
		if (plan.session) this.append(SessionRecord.file(this.abs(plan.session)), { log: { at: now, msg: `project ${plan.slug} moved to ${this.url(plan.to)} (was ${plan.from})` } });
		const run = now.replace(/\D/g, "").slice(0, 14);
		this.append(this.abs(this.MANIFEST), { run, at: now, from: plan.from, to: plan.to, module, slug: plan.slug, day: plan.day, session: plan.session });
		return { dry_run: false, run, ...plan };
	}

	/** Reverses one move (the last that is not undone, or `run`): the folder goes back and each stream gets a mirror line. */
	static async undo({ run } = {}){
		const all = this.lines(this.abs(this.MANIFEST)), undone = new Set(all.filter(l => l.undone).map(l => l.undone));
		const m = all.filter(l => l.to && !undone.has(l.run)).filter(l => !run || l.run === run).pop();
		if (!m) throw new Error("no move to undo");
		if (!fs.existsSync(this.abs(m.to))) throw new Error(`${m.to} is gone; nothing to put back`);
		if (fs.existsSync(this.abs(m.from))) throw new Error(`${m.from} already exists; will not overwrite`);
		const store = this.abs("public/framework/ai/sessions"), now = new Date().toISOString(), facts = await this.read(this.abs(m.to));
		fs.mkdirSync(path.dirname(this.abs(m.from)), { recursive: true });
		if (this.tracked(m.to)) this.git("mv", m.to, m.from); else fs.renameSync(this.abs(m.to), this.abs(m.from));
		for (let d = path.dirname(this.abs(m.to)); d.includes(`${path.sep}projects${path.sep}`); d = path.dirname(d)) { try { fs.rmdirSync(d); } catch { break; } }
		const row = { id: m.slug, path: m.from, url: this.url(m.from), title: facts.title, state: facts.state, completion: facts.completion };
		AIIndexStream.append(store, "project", row, `${m.day}T00:00:00`);
		AIIndexStream.append(store, "project", { ...row, moved_back: true }, now);
		if (m.session && SessionRecord.file(this.abs(m.session))) this.append(SessionRecord.file(this.abs(m.session)), { log: { at: now, msg: `project ${m.slug} moved back to ${m.from}` } });
		this.append(this.abs(this.MANIFEST), { at: now, undone: m.run, from: m.to, to: m.from });
		return { undone: m.run, from: m.to, to: m.from };
	}

	/** The Servex MCP door (registered in Servex.js): `move_project`. Dry run unless apply; undo reverses the last move. */
	static tool(){
		return {
			name: "move_project",
			description: "Move a project folder (one holding project.jsonl) from its session into a module: git mv to <module>/projects/YYYY/MM/DD/<slug>/ and it indexes itself (both days' index.jsonl, a one-line pointer in the session's session.jsonl). Dry run unless apply is true. {undo:true} puts the last move back. Doc: /framework/ai/tasks/doc/projects.md",
			inputSchema: { type: "object", properties: {
				from: { type: "string", description: "The project folder: a repo path or a site path (/framework/ai/sessions/…/<slug>/)." },
				module: { type: "string", description: 'The module that takes it, e.g. "core/Task".' },
				apply: { type: "boolean", description: "Do it. Omitted = dry run." },
				undo: { type: "boolean", description: "Reverse the last move (then from/module are ignored)." } } },
			handler: async a => JSON.stringify(a.undo ? await this.undo() : await this.move(a), null, 2)
		};
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), flag = n => argv.includes(n), pos = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--run");
	try {
		const r = flag("--undo") ? await ProjectMove.undo({ run: flag("--run") ? argv[argv.indexOf("--run") + 1] : undefined }) : await ProjectMove.move({ from: pos[0], module: pos[1], apply: flag("--apply") });
		console.log(JSON.stringify(r, null, 2));
		if (r.dry_run) console.log("dry run: add --apply to move it");
	} catch (e){ console.error("ProjectMove: " + e.message); process.exit(1); }
}
