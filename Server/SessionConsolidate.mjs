#!/usr/bin/env node
// Server/SessionConsolidate.mjs — one session, one folder. Finds every folder that holds one session and folds the others into
// the oldest one (the day it began), with a manifest of every move, append and rewrite. Doc: public/framework/core/Session/doc/identity.md
// ("One session, one folder, one URL").
//
//   node Server/SessionConsolidate.mjs <session uuid> [--repo <path>]                    dry run: prints the plan, writes nothing
//   node Server/SessionConsolidate.mjs <session uuid> --apply --manifest <file.json> [--repo <path>]
//
// What counts as a second folder: a dated session folder (ai/sessions/YYYY/MM/DD/<session-id8 or uuid>/) that says it holds this id
// (DatedFiles.owner), and the old card-tree folder the prompt hook wrote to until 2026-10-25 (ai/YYYY/MM/DD/session-<id8>/).
// What happens to each thing in a second folder:
//   - a subfolder moves into the home folder under the same name (refused if the name is taken); the move is a `task` line in
//     ai/sessions/task-moves.jsonl, the ledger TaskMove.mjs and StoreFolder already read, so its old URL redirects;
//   - a .jsonl file's lines are appended to the home's file of the same name, in order, minus the second folder's line-1 session
//     marker, `{"file"}` lines the home already has, and exact duplicates; its URLs are rewritten to the home's;
//   - any other file moves in under its name (refused if taken);
//   - every original file is first copied aside to %LOCALAPPDATA%/lew42/servex/moved-aside/<run>/ (page.jsonl is gitignored, so git
//     cannot undo it), and the empty second folder is removed (never recursively);
//   - one `redirect` line per second folder maps its old URL to the home.
// Links in .md/.js/.mjs/.html files under public/, Server/, Servex/, .claude/ are rewritten from each second folder's URL to the home's
// (CLAUDE.md is never written). .jsonl history elsewhere keeps the old URL; the redirect answers it.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2), flag = n => args.includes(n), val = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ID = args.find(a => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(a));
const REPO = path.resolve(val("--repo") ?? path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), ".."));
const slash = p => p.split(path.sep).join("/");
const rel = abs => slash(path.relative(REPO, abs));
const url = abs => "/" + slash(path.relative(path.join(REPO, "public"), abs)) + "/";
const sha1 = f => crypto.createHash("sha1").update(fs.readFileSync(f)).digest("hex");
const lines = f => fs.readFileSync(f, "utf8").split("\n").filter(l => l.trim());

export default class SessionConsolidate {
	constructor(id, repo = REPO){ this.id = id; this.repo = repo; }

	async load(){
		const { default: DatedFiles } = await import("./DatedFiles.mjs");   // this checkout's rules, pointed at --repo
		DatedFiles.ROOT = this.repo;
		this.DatedFiles = DatedFiles;
		return this;
	}

	/** Every folder that holds this session, oldest first; the first is the home. */
	folders(){
		const D = this.DatedFiles, id = this.id, short = "session-" + id.slice(0, 8), out = [];
		for (const day of D.sessions.days()) for (const name of [id, short]){
			const dir = path.join(day, name);
			if (fs.existsSync(dir) && (name === id || D.owner(dir) === id)) out.push(dir);
		}
		const cards = path.join(this.repo, "public/framework/ai");
		for (const y of fs.readdirSync(cards).filter(n => /^\d{4}$/.test(n))) for (const m of ls(path.join(cards, y))) for (const d of ls(path.join(cards, y, m))){
			const dir = path.join(cards, y, m, d, short);
			if (fs.existsSync(dir)) out.push(dir);   // the old card tree has no id marker; its name is the hook's own `session-<id8>`
		}
		return out;
	}

	/** The plan: no write. */
	plan(){
		const [home, ...dups] = this.folders();
		if (!home) throw new Error(`no folder holds ${this.id}`);
		const steps = [], seen = new Set();
		for (const dup of dups){
			const from_url = url(dup), to_url = url(home);
			for (const e of fs.readdirSync(dup, { withFileTypes: true })){
				const src = path.join(dup, e.name), dst = path.join(home, e.name);
				if (e.isDirectory()){
					if (fs.existsSync(dst) || seen.has(dst)) throw new Error(`refused: ${rel(dst)} already exists; rename ${rel(src)} first`);
					steps.push({ do: "move", kind: "task", from: rel(src), to: rel(dst) }); seen.add(dst);
				} else if (e.name.endsWith(".jsonl")){
					const have = fs.existsSync(dst) ? new Set(lines(dst)) : new Set();
					const keep = [], skipped = { marker: 0, file: 0, duplicate: 0 };
					lines(src).forEach((l, i) => {
						const out = l.split(from_url).join(to_url);
						if (i === 0 && /^\{"session":/.test(l)) return skipped.marker++;
						if (/^\{"file":/.test(l) && have.has(out)) return skipped.file++;
						if (have.has(out)) return skipped.duplicate++;
						have.add(out); keep.push(out);
					});
					steps.push({ do: "append", from: rel(src), to: rel(dst), lines: lines(src).length, appended: keep.length, skipped, sha1: sha1(src), keep });
				} else {
					if (fs.existsSync(dst) || seen.has(dst)) throw new Error(`refused: ${rel(dst)} already exists; rename ${rel(src)} first`);
					steps.push({ do: "move", kind: "file", from: rel(src), to: rel(dst) }); seen.add(dst);
				}
			}
			steps.push({ do: "redirect", from: rel(dup), to: rel(home) });
			steps.push({ do: "relink", from: from_url, to: to_url });
		}
		return { session: this.id, home: rel(home), duplicates: dups.map(rel), steps };
	}

	/** Do the plan; returns the manifest (the plan with what happened). */
	apply(plan){
		const run = new Date().toISOString(), aside = path.join(process.env.LOCALAPPDATA || os.tmpdir(), "lew42/servex/moved-aside", run.replace(/[:.]/g, "-"));
		const ledger = path.join(this.repo, "public/framework/ai/sessions/task-moves.jsonl"), at = () => new Date().toISOString();
		const abs = r => path.join(this.repo, r);
		for (const dup of plan.duplicates){   // a full copy first: the one undo for gitignored files
			fs.cpSync(abs(dup), path.join(aside, dup), { recursive: true });
		}
		for (const s of plan.steps){
			if (s.do === "move"){
				fs.renameSync(abs(s.from), abs(s.to));
				if (s.kind === "task") fs.appendFileSync(ledger, JSON.stringify({ at: at(), run, kind: "task", from: s.from, to: s.to, session: this.id }) + "\n");
				for (const f of walk(abs(s.to)).filter(f => f.endsWith(".jsonl"))){   // a moved task's own records name its old address
					const from_url = "/" + s.from.replace(/^public\//, "") + "/", to_url = "/" + s.to.replace(/^public\//, "") + "/", t = fs.readFileSync(f, "utf8");
					if (t.includes(from_url)) fs.writeFileSync(f, t.split(from_url).join(to_url));
				}
			}
			else if (s.do === "append"){
				if (s.keep.length) fs.appendFileSync(abs(s.to), s.keep.join("\n") + "\n");
				fs.rmSync(abs(s.from));   // its copy is in moved-aside
			}
			else if (s.do === "redirect"){
				fs.appendFileSync(ledger, JSON.stringify({ at: at(), run, kind: "redirect", from: s.from, to: s.to, session: this.id }) + "\n");
				try { fs.rmdirSync(abs(s.from)); } catch (e){ s.left = e.code; }   // never recursive: anything left behind stays and is reported
			}
			else if (s.do === "relink") s.files = this.relink(s.from, s.to);
		}
		for (const s of plan.steps) delete s.keep;
		return { ...plan, run, moved_aside: aside };
	}

	/** Rewrite one URL to another in the repo's .md/.js/.mjs/.html files (CLAUDE.md never). Returns the files changed. */
	relink(from, to){
		const changed = [];
		for (const d of ["public", "Server", "Servex", ".claude"]) for (const f of walk(path.join(this.repo, d), [".md", ".js", ".mjs", ".html"])){
			const t = fs.readFileSync(f, "utf8");
			if (t.includes(from)){ fs.writeFileSync(f, t.split(from).join(to)); changed.push(rel(f)); }
		}
		return changed;
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
	if (!ID) { console.error("usage: node Server/SessionConsolidate.mjs <session uuid> [--apply --manifest <file.json>] [--repo <path>]"); process.exit(1); }
	const c = await new SessionConsolidate(ID).load(), plan = c.plan();
	const brief = s => s.do === "append" ? `append ${s.appended} of ${s.lines} lines  ${s.from} → ${s.to}  (skipped ${JSON.stringify(s.skipped)})` : s.do === "relink" ? `relink ${s.from} → ${s.to}` : `${s.do} ${s.from} → ${s.to}`;
	console.log(`home: ${plan.home}\nsecond folders: ${plan.duplicates.join(", ") || "none"}\n` + plan.steps.map(s => "  " + brief(s)).join("\n"));
	if (flag("--apply")){
		const out = val("--manifest"); if (!out) { console.error("--apply needs --manifest <file.json>"); process.exit(1); }
		const manifest = c.apply(plan);
		fs.writeFileSync(out, JSON.stringify(manifest, null, 1));
		console.log(`applied; manifest ${out}; originals copied to ${manifest.moved_aside}`);
	} else console.log("dry run: nothing written. Add --apply --manifest <file.json>.");
}
