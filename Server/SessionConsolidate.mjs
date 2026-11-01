#!/usr/bin/env node
// Server/SessionConsolidate.mjs — one session, one folder. Finds every folder that holds one session and folds the others into its home,
// with a manifest of every move, append and rewrite; and checks the whole store for a session held twice. Doc: public/framework/ai/sessions/doc/one-folder.md.
//
//   node Server/SessionConsolidate.mjs <session uuid> [--repo <path>]                     dry run: prints the plan, writes nothing
//   node Server/SessionConsolidate.mjs <session uuid> --apply --manifest <file.json>
//   node Server/SessionConsolidate.mjs --all [--repo <path>]                              dry run for every session held twice: counts, and what is held
//   node Server/SessionConsolidate.mjs --all --apply --manifest <file.json>               fold every group that is not held
//   node Server/SessionConsolidate.mjs --check [--write] [--json]                         the twin check: exit 1 when any session is held twice;
//                                                                                          --write keeps the list in sessions/session-twins.json and says which ids are new
//
// Which folders hold a session, and which is the home, is the store's one finder (core/Session/SessionFolders.mjs): any day folder that
// says it holds the id (its uuid name, index.json, the cache summary, line 1 {session} or {assign} with an agent, page.jsonl), the home
// being the oldest day, then the folder that holds the most. Plus the old card-tree folder the prompt hook wrote to until 2026-10-25
// (ai/YYYY/MM/DD/session-<id8>/). What happens to each thing in a second folder:
//   - a subfolder moves into the home under the same name (held if the name is taken); a `task` line in ai/sessions/task-moves.jsonl
//     (the ledger TaskMove.mjs and StoreFolder read) so its old URL redirects;
//   - index.json and cache.jsonl are machine state the session indexer rebuilds from the transcript (gitignored): the FRESHER copy stays
//     (cache: newest summary by last_at, then messages; index: last_activity, then mtime), and every line of the other must be in it or be
//     an older summary, else the group is held. (The rule move-ai2.mjs used for the 2026-11-01 cleanup, ai2-retire/move-report.md.)
//   - any other .jsonl file's lines are appended to the home's file of the same name, in order, minus the second folder's line-1 session
//     marker, `{"file"}` lines the home already has, and exact duplicates; its URLs are rewritten to the home's;
//   - any other file moves in under its name; one already there is dropped when byte-identical, else the group is held;
//   - every original file is first copied aside to %LOCALAPPDATA%/lew42/servex/moved-aside/<run>/ (index.json, cache.jsonl and page.jsonl
//     are gitignored, so git cannot undo them), the home's own replaced copies too; the empty second folder is removed (never recursively);
//   - one `redirect` line per second folder maps its old URL to the home.
// Links in .md/.js/.mjs/.html files under public/, Server/, Servex/, .claude/ are rewritten from each second folder's URL to the home's,
// in one pass for the whole run (CLAUDE.md is never written). .jsonl history elsewhere keeps the old URL; the redirect answers it.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const args = process.argv.slice(2), flag = n => args.includes(n), val = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ID = args.find(a => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(a));
const REPO = path.resolve(val("--repo") ?? path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), ".."));
const slash = p => p.split(path.sep).join("/");
const sha1 = f => crypto.createHash("sha1").update(fs.readFileSync(f)).digest("hex");
const lines = f => fs.readFileSync(f, "utf8").split("\n").map(l => l.replace(/\r$/, "")).filter(l => l.trim());
const STORE = "public/framework/ai/sessions";

export default class SessionConsolidate {
	static REGEN = { "index.json": "AISessionIndex rebuilds it from the transcript", "cache.jsonl": "AISession.save() rebuilds its summary from the transcript" };

	constructor(id, repo = REPO){ this.id = id; this.repo = path.resolve(repo); }
	rel(abs){ return slash(path.relative(this.repo, abs)); }
	url(abs){ return "/" + slash(path.relative(path.join(this.repo, "public"), abs)) + "/"; }

	async load(){
		const { default: SessionFolders } = await import("../public/framework/core/Session/SessionFolders.mjs");
		this.store = SessionFolders.at(path.join(this.repo, STORE));
		return this;
	}

	/** Every folder that holds this session, the home first. */
	folders(){
		const out = this.store.all(this.id), short = "session-" + this.id.slice(0, 8);
		const cards = path.join(this.repo, "public/framework/ai");
		for (const y of fs.readdirSync(cards).filter(n => /^\d{4}$/.test(n))) for (const m of ls(path.join(cards, y))) for (const d of ls(path.join(cards, y, m))){
			const dir = path.join(cards, y, m, d, short);
			if (fs.existsSync(dir)) out.push(dir);   // the old card tree has no id marker; its name is the hook's own `session-<id8>`
		}
		return out;
	}

	/** > 0 when copy a of a machine-state file is fresher than copy b. */
	static fresher(a, b, base){
		const key = p => {
			if (base === "cache.jsonl") return lines(p).filter(l => l.startsWith('{"summary"')).map(l => { try { const j = JSON.parse(l); return [j.summary?.last_at ?? "", String(j.summary?.messages ?? 0).padStart(9, "0"), j.at ?? ""].join("|"); } catch { return ""; } }).sort().pop() ?? "";
			let j = {}; try { j = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
			return (j.last_activity ?? "") + "|" + String(Math.round(fs.statSync(p).mtimeMs)).padStart(15, "0");
		};
		const ka = key(a), kb = key(b); return ka > kb ? 1 : ka < kb ? -1 : 0;
	}

	/** The plan: no write. `held` lists why a group cannot be folded without losing something; a held plan is never applied. */
	plan(){
		const [home, ...dups] = this.folders(), held = [];
		if (!home) throw new Error(`no folder holds ${this.id}`);
		const steps = [], seen = new Set();
		for (const dup of dups){
			const from_url = this.url(dup), to_url = this.url(home);
			for (const e of fs.readdirSync(dup, { withFileTypes: true })){
				const src = path.join(dup, e.name), dst = path.join(home, e.name), there = fs.existsSync(dst) || seen.has(dst);
				if (e.isDirectory()){
					if (there){ held.push(`${this.rel(dst)} already exists; rename ${this.rel(src)} first`); continue; }
					steps.push({ do: "move", kind: "task", from: this.rel(src), to: this.rel(dst) }); seen.add(dst);
				} else if (SessionConsolidate.REGEN[e.name] && there){
					const win_is_src = SessionConsolidate.fresher(src, dst, e.name) > 0, win = win_is_src ? src : dst, lose = win_is_src ? dst : src;
					const keep = new Set(lines(win)), lost = e.name.endsWith(".jsonl") ? lines(lose).filter(l => !keep.has(l)) : [];
					if (lost.some(l => !l.startsWith('{"summary"'))){ held.push(`${this.rel(lose)}: lines the fresher copy lacks`); continue; }
					steps.push(win_is_src ? { do: "replace", from: this.rel(src), to: this.rel(dst), why: "fresher; " + SessionConsolidate.REGEN[e.name] }
						: { do: "drop", from: this.rel(src), why: "staler than " + this.rel(dst) + "; " + SessionConsolidate.REGEN[e.name] });
				} else if (e.name.endsWith(".jsonl")){
					const have = fs.existsSync(dst) ? new Set(lines(dst)) : new Set();
					const keep = [], skipped = { marker: 0, file: 0, duplicate: 0 };
					lines(src).forEach((l, i) => {
						const out = l.split(from_url).join(to_url);
						if (i === 0 && /^\{"session":/.test(l) && fs.existsSync(dst)) return skipped.marker++;
						if (/^\{"file":/.test(l) && have.has(out)) return skipped.file++;
						if (have.has(out)) return skipped.duplicate++;
						have.add(out); keep.push(out);
					});
					steps.push({ do: "append", from: this.rel(src), to: this.rel(dst), lines: lines(src).length, appended: keep.length, skipped, sha1: sha1(src), keep });
				} else if (there){
					if (fs.existsSync(dst) && fs.readFileSync(src).equals(fs.readFileSync(dst))) steps.push({ do: "drop", from: this.rel(src), why: "byte-identical to " + this.rel(dst) });
					else held.push(`${this.rel(src)} differs from ${this.rel(dst)} and is not a log`);
				} else { steps.push({ do: "move", kind: "file", from: this.rel(src), to: this.rel(dst) }); seen.add(dst); }
			}
			steps.push({ do: "redirect", from: this.rel(dup), to: this.rel(home) });
			steps.push({ do: "relink", from: from_url, to: to_url });
		}
		return { session: this.id, home: this.rel(home), duplicates: dups.map(d => this.rel(d)), held, steps };
	}

	/** Do the plan; returns the manifest (the plan with what happened). Relinks unless `relink: false` (the batch relinks once for all). */
	apply(plan, { run = new Date().toISOString(), relink = true } = {}){
		if (plan.held?.length) throw new Error(`refused: ${plan.session} is held (${plan.held.join("; ")})`);
		const aside = path.join(process.env.LOCALAPPDATA || os.tmpdir(), "lew42/servex/moved-aside", run.replace(/[:.]/g, "-"));
		const ledger = path.join(this.repo, STORE, "task-moves.jsonl"), at = () => new Date().toISOString();
		const abs = r => path.join(this.repo, r), keep_aside = r => fs.cpSync(abs(r), path.join(aside, r), { recursive: true });
		for (const dup of plan.duplicates) keep_aside(dup);   // a full copy first: the one undo for gitignored files
		for (const s of plan.steps){
			if (s.do === "move"){
				fs.renameSync(abs(s.from), abs(s.to));
				if (s.kind === "task") fs.appendFileSync(ledger, JSON.stringify({ at: at(), run, kind: "task", from: s.from, to: s.to, session: this.id }) + "\n");
				for (const f of walk(abs(s.to)).filter(f => f.endsWith(".jsonl"))){   // a moved task's own records name its old address
					const from_url = "/" + s.from.replace(/^public\//, "") + "/", to_url = "/" + s.to.replace(/^public\//, "") + "/", t = fs.readFileSync(f, "utf8");
					if (t.includes(from_url)) fs.writeFileSync(f, t.split(from_url).join(to_url));
				}
			}
			else if (s.do === "replace"){ keep_aside(s.to); fs.renameSync(abs(s.from), abs(s.to)); }   // the home's staler copy goes aside too
			else if (s.do === "drop") fs.rmSync(abs(s.from));   // its copy is in moved-aside
			else if (s.do === "append"){
				if (s.keep.length) fs.appendFileSync(abs(s.to), s.keep.join("\n") + "\n");
				fs.rmSync(abs(s.from));
			}
			else if (s.do === "redirect"){
				fs.appendFileSync(ledger, JSON.stringify({ at: at(), run, kind: "redirect", from: s.from, to: s.to, session: this.id }) + "\n");
				try { fs.rmdirSync(abs(s.from)); } catch (e){ s.left = e.code; }   // never recursive: anything left behind stays and is reported
			}
			else if (s.do === "relink" && relink) s.files = SessionConsolidate.relink(this.repo, [[s.from, s.to]]);
		}
		for (const s of plan.steps) delete s.keep;
		return { ...plan, run, moved_aside: aside };
	}

	/** Rewrite each [from, to] URL pair in the repo's .md/.js/.mjs/.html files (CLAUDE.md never), in one walk. Returns the files changed. */
	static relink(repo, pairs){
		const changed = [];
		if (!pairs.length) return changed;
		for (const d of ["public", "Server", "Servex", ".claude"]) for (const f of walk(path.join(repo, d), [".md", ".js", ".mjs", ".html"])){
			if (path.basename(f) === "CLAUDE.md") continue;
			let t = fs.readFileSync(f, "utf8"), was = t;
			for (const [from, to] of pairs) if (t.includes(from)) t = t.split(from).join(to);
			if (t !== was){ fs.writeFileSync(f, t); changed.push(slash(path.relative(repo, f))); }
		}
		return changed;
	}

	/** Every session held by more than one folder, with its plan: {groups, foldable, held}. No write. */
	static async all(repo = REPO){
		const { default: SessionFolders } = await import("../public/framework/core/Session/SessionFolders.mjs");
		const twins = SessionFolders.at(path.join(repo, STORE)).twins(), plans = [];
		for (const t of twins){
			const c = await new SessionConsolidate(t.id, repo).load();
			try { plans.push(c.plan()); } catch (e){ plans.push({ session: t.id, home: c.rel(t.home), duplicates: t.others.map(d => c.rel(d)), held: [e.message], steps: [] }); }
		}
		return { groups: plans.length, foldable: plans.filter(p => !p.held.length), held: plans.filter(p => p.held.length) };
	}

	/** Fold every foldable group of all(); relinks once at the end. Returns the manifest. */
	static async apply_all(repo = REPO){
		const { foldable, held } = await this.all(repo), run = new Date().toISOString(), done = [], pairs = [];
		for (const p of foldable){
			const c = await new SessionConsolidate(p.session, repo).load();
			done.push(c.apply(p, { run, relink: false }));
			for (const s of p.steps) if (s.do === "relink") pairs.push([s.from, s.to]);
		}
		const relinked = this.relink(repo, pairs);
		return { run, folded: done.length, held: held.map(h => ({ session: h.session, why: h.held })), relinked, groups: done };
	}

	/** The twin check: every session held twice now, and the ids not in the last list (sessions/session-twins.json, kept with `write`).
	 *  With no last list yet (`first`), nothing counts as new: the twins found then are the ones from before the check existed. */
	static async check(repo = REPO, { write = false } = {}){
		const { default: SessionFolders } = await import("../public/framework/core/Session/SessionFolders.mjs");
		const file = path.join(repo, STORE, "session-twins.json"), twins = SessionFolders.at(path.join(repo, STORE)).twins();
		let last = null; try { last = JSON.parse(fs.readFileSync(file, "utf8")).ids ?? []; } catch {}
		const first = last === null, was = new Set(last ?? []), ids = twins.map(t => t.id), fresh = first ? [] : twins.filter(t => !was.has(t.id));
		const rel = p => slash(path.relative(path.join(repo, STORE), p));
		if (write) fs.writeFileSync(file, JSON.stringify({ at: new Date().toISOString(), count: ids.length, ids }) + "\n");
		return { ok: !ids.length, first, count: ids.length, new: fresh.length, examples: fresh.concat(twins).slice(0, 5).map(t => ({ id: t.id, home: rel(t.home), others: t.others.map(rel) })) };
	}
}

function ls(d){ try { return fs.readdirSync(d).filter(n => /^\d{2}$/.test(n)); } catch { return []; } }
function walk(dir, exts = null){
	const out = [];
	const go = d => { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
		for (const e of es){ if (e.name === "node_modules" || e.name === ".git" || e.name === "worktrees") continue;
			const f = path.join(d, e.name); if (e.isDirectory()) go(f); else if (!exts || exts.includes(path.extname(e.name))) out.push(f); } };
	go(dir); return out;
}

if (process.argv[1] && path.resolve(process.argv[1]).endsWith(path.join("Server", "SessionConsolidate.mjs"))){
	const out = val("--manifest"), write_manifest = m => { fs.writeFileSync(out, JSON.stringify(m, null, 1)); console.log(`manifest ${out}`); };
	if (flag("--check")){
		const r = await SessionConsolidate.check(REPO, { write: flag("--write") });
		if (flag("--json")) console.log(JSON.stringify(r));
		else console.log(r.ok ? "ok: every session has one folder" : `${r.count} sessions are held by more than one folder (${r.first ? "the first check: none counted as new" : r.new + " new since the last check"}). Fold them: node Server/SessionConsolidate.mjs --all, then --all --apply --manifest <file.json>\n` + r.examples.map(e => `  ${e.id}  ${e.home}  +  ${e.others.join(", ")}`).join("\n"));
		process.exit(r.ok ? 0 : 1);
	}
	if (flag("--all")){
		if (flag("--apply")){
			if (!out) { console.error("--apply needs --manifest <file.json>"); process.exit(1); }
			const m = await SessionConsolidate.apply_all(REPO);
			console.log(`folded ${m.folded} sessions into one folder each; ${m.held.length} held; ${m.relinked.length} files relinked`);
			write_manifest(m);
		} else {
			const r = await SessionConsolidate.all(REPO), count = (op) => r.foldable.reduce((n, p) => n + p.steps.filter(s => s.do === op).length, 0);
			console.log(`${r.groups} sessions held twice: ${r.foldable.length} can be folded, ${r.held.length} held.\n  steps: ${["move", "replace", "drop", "append", "redirect"].map(op => `${count(op)} ${op}`).join(", ")}`);
			for (const h of r.held.slice(0, 20)) console.log(`  HELD ${h.session}: ${h.held.join("; ")}`);
			if (out) write_manifest({ dry_run: true, ...r });
			console.log("dry run: nothing written. Add --apply --manifest <file.json>.");
		}
		process.exit(0);
	}
	if (!ID) { console.error("usage: node Server/SessionConsolidate.mjs <session uuid> | --all | --check  [--apply --manifest <file.json>] [--repo <path>]"); process.exit(1); }
	const c = await new SessionConsolidate(ID).load(), plan = c.plan();
	const brief = s => s.do === "append" ? `append ${s.appended} of ${s.lines} lines  ${s.from} → ${s.to}  (skipped ${JSON.stringify(s.skipped)})` : s.do === "relink" ? `relink ${s.from} → ${s.to}` : s.do === "drop" ? `drop ${s.from} (${s.why})` : `${s.do} ${s.from} → ${s.to}`;
	console.log(`home: ${plan.home}\nsecond folders: ${plan.duplicates.join(", ") || "none"}\n` + plan.steps.map(s => "  " + brief(s)).join("\n") + (plan.held.length ? `\nHELD: ${plan.held.join("; ")}` : ""));
	if (flag("--apply")){
		if (!out) { console.error("--apply needs --manifest <file.json>"); process.exit(1); }
		const manifest = c.apply(plan);
		write_manifest(manifest);
		console.log(`applied; originals copied to ${manifest.moved_aside}`);
	} else console.log("dry run: nothing written. Add --apply --manifest <file.json>.");
}
