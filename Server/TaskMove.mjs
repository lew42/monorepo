#!/usr/bin/env node
// Server/TaskMove.mjs — move every flat day folder public/framework/ai/YYYY-MM-DD/ into the sessions store.
// Decision: public/framework/ai/doc/task-folders.md. Brief: public/framework/ai/sessions/2026/10/12/session-e456f109/task-folders/move-script.md
// Reuses TaskDirs.files() (Server/TaskDirs.mjs) for snapshots, and core/Session/Session.js's scan() for id -> folder
// (never a second session-folder scanner). Both are loaded against the CHOSEN --repo (not necessarily this script's
// own checkout): TaskDirs via LEDGER_ROOT + a cache-busted re-import, Session.js by file URL into that repo's copy.
//
//   node Server/TaskMove.mjs [--repo <path>]                                  dry run: plan + counts, writes the plan file (default)
//   node Server/TaskMove.mjs --apply [--only Y-M-D,...] [--skip slug,...] [--repo <path>]
//   node Server/TaskMove.mjs --apply --manifest <dry-run.json> --ledger card-moves [--repo <path>]   a dry run's moves as written
//        (the one-tree card move, 2026-10-13: ai/YYYY/MM/DD/<card>/ -> ai/sessions/YYYY/MM/DD/cards/<card>/); every verb takes --ledger
//   node Server/TaskMove.mjs --verify [--run <stamp>|last] [--repo <path>]
//   node Server/TaskMove.mjs --undo   [--run <stamp> | --all] [--repo <path>]  the last apply only, unless told
//   node Server/TaskMove.mjs --relink [--dry] [--plan | --run <stamp>|last | --all] [--repo <path>]   default: the last apply's moves
//   node Server/TaskMove.mjs --redirects [--repo <path>]
//   node Server/TaskMove.mjs --pages     [--repo <path>]                      ai/sessions/task-pages.json: moved tasks with their own page.js
//
// A second writer (2026-10-22): the item tool's move_home (Servex/agents/page_tools.js) appends one kind "task" line when a
// process moves from its session to <module>/tasks/<slug>/ (core/Task/doc/process.md); TaskDirs redirects it like any other.
// The ledger is two files, both repo-relative/forward-slash, so the browser can fetch the small one to redirect an
// old URL without ever loading a snapshot: ai/sessions/task-moves.jsonl ({at,kind,from,to,session}, one line per
// move — kinds task/rename/stub/dayfile are physical moves, "redirect" is a virtual line only, mapping a 10-10-era
// stub's day/slug address straight to its FINAL dir) and ai/sessions/task-moves-files.jsonl ({from,to,files}, the
// per-file snapshot, used only by --verify/--undo here). An undo appends a matching {..., undone:true} line rather
// than rewriting anything (jsonl is append-only); TaskDirs.map() simply skips an undone line when it builds its
// redirect map, and this script computes its OWN "still active" set the same way (see #active below) so a round
// trip (apply -> undo -> apply) stays correct even though nothing is ever rewritten.
//
// --repo defaults to this script's own repo. Passed explicitly (e.g. to preview against another checkout), the
// plan file (step 3) is written to the OS temp dir instead of into that repo's tree, so a dry run against someone
// else's checkout never writes anything there. Pass --plan-out to choose the path yourself.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

import CardDir from "../public/framework/ai/cards/CardDir.js";   // the card tree's one rule (cardSub)

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = n => argv.includes(n);
const val = n => flag(n) ? argv[argv.indexOf(n) + 1] : undefined;   // undefined, never argv[0], when the flag is absent

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const STUB = "moved.json";

const dirs = p => { try { return fs.readdirSync(p, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name); } catch { return []; } };
const slash = p => p.split(path.sep).join("/");
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const jsonl = p => { try { return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)); } catch { return []; } };

/** TaskDirs (Server/TaskDirs.mjs), re-imported with LEDGER_ROOT pointed at `repo` so its file reads/writes land there. */
async function loadTaskDirs(repo){
	process.env.LEDGER_ROOT = repo;
	const mod = await import(`./TaskDirs.mjs?root=${encodeURIComponent(repo)}`);
	return mod.default;
}
/** core/Session/Session.js from INSIDE the target repo (not this script's own copy), so --repo reads that repo's store. */
async function loadSession(repo){
	const file = path.join(repo, "public", "framework", "core", "Session", "Session.js");
	const mod = await import(pathToFileURL(file).href);
	return mod.default;
}

export default class TaskMove {
	static STUB = STUB;

	static ai(repo){ return path.join(repo, "public", "framework", "ai"); }
	static sessStore(repo){ return path.join(this.ai(repo), "sessions"); }
	// the ledger's name: "task-moves" (task folders, the default) or "card-moves" (Inbox cards into the store, one tree 2026-10-13); --ledger
	static LEDGER = "task-moves";
	static PHYSICAL = ["task", "rename", "stub", "dayfile", "card", "cardfile"];
	static isFile(m){ return m.kind === "dayfile" || m.kind === "cardfile"; }   // a single loose file, not a folder
	static ledger(repo){ return path.join(this.sessStore(repo), `${this.LEDGER}.jsonl`); }
	static filesLedger(repo){ return path.join(this.sessStore(repo), `${this.LEDGER}-files.jsonl`); }
	static planFile(repo){ return path.join(this.sessStore(repo), "task-moves.plan.json"); }

	/** id -> abs session dir, and id8 -> abs session dir. Reuses core/Session/Session.js's own scan() — one scanner, not two. */
	static async sessions(repo){
		const Session = await loadSession(repo);
		Session.days = new Map(); Session.slugs = new Map(); Session.scanned = false;   // a fresh scan for THIS repo, even if the module was cached
		await Session.scan();
		const byId = new Map(), by8 = new Map();
		for (const [id, day] of Session.days){
			const dir = fileURLToPath(Session.dir_url(id, day)).replace(/[\\/]$/, "");
			byId.set(id, dir); by8.set(id.slice(0, 8), dir);
		}
		return { byId, by8 };
	}

	// ---- plan: pure reading, the manifest ----
	static async plan(repo){
		const AI = this.ai(repo), { byId, by8 } = await this.sessions(repo);
		const rel = p => slash(path.relative(repo, p));
		const used = new Set();
		const taken = to => fs.existsSync(to) || used.has(rel(to));
		const dedupe = to => { const dir = path.dirname(to), base = path.basename(to); let n = 2, c = to; while (taken(c)) c = path.join(dir, `${base}-${n++}`); return c; };
		const claim = to => used.add(rel(to));

		const moves = [], counts = { task: 0, rename: 0, stub: 0, dayfile: 0, collisions: 0, joined: 0, unjoined: 0 };
		for (const day of dirs(AI).filter(n => DAY.test(n)).sort()){
			const dayDir = path.join(AI, day), [Y, M, D] = day.split("-"), sessDay = path.join(AI, "sessions", Y, M, D);
			for (const name of fs.readdirSync(dayDir)){
				const full = path.join(dayDir, name);
				if (!fs.statSync(full).isDirectory()){
					let to = path.join(sessDay, name), why = "loose day file";
					if (taken(to)){ to = dedupe(path.join(sessDay, "day-" + name)); why += " (collision)"; counts.collisions++; }
					claim(to);
					moves.push({ kind: "dayfile", from: rel(full), to: rel(to), session: null, day, slug: name, why });
					counts.dayfile++;
					continue;
				}
				const entries = fs.readdirSync(full);
				const isStub = entries.includes(STUB) && entries.every(e => e === STUB || e === "files.jsonl");
				if (isStub){
					let stub; try { stub = JSON.parse(fs.readFileSync(path.join(full, STUB), "utf8")); } catch { stub = {}; }
					const movedTo = stub.moved_to ? path.join(repo, stub.moved_to) : null;
					if (movedTo && fs.existsSync(movedTo)){
						const sessionDir = path.dirname(movedTo);
						let to = path.join(sessionDir, name), why = "stub from the 10-10 pass: rename its task folder to the slug";
						if (taken(to)){ to = dedupe(to); why += " (collision)"; counts.collisions++; }
						claim(to);
						moves.push({ kind: "rename", from: rel(movedTo), to: rel(to), session: stub.session ?? null, day, slug: name, why });
						counts.rename++;
						// a virtual line: the old public/framework/ai/<day>/<slug> address, straight to the FINAL dir (no hop through the 10-10 task/ folder)
						moves.push({ kind: "redirect", from: `public/framework/ai/${day}/${name}`, to: rel(to), session: stub.session ?? null, day, slug: name, why: "old day address -> final dir, bypassing the 10-10 task/ hop" });
					}
					const archiveTo = path.join(AI, "archive", "task-stubs", day, name);
					moves.push({ kind: "stub", from: rel(full), to: rel(archiveTo), session: stub.session ?? null, day, slug: name, why: "stub folder archived, never deleted" });
					counts.stub++;
					continue;
				}
				let sessionId = null;
				try { sessionId = /"session_id":"([0-9a-f-]{36})"/.exec(fs.readFileSync(path.join(full, "task.jsonl"), "utf8"))?.[1] ?? null; } catch {}
				const sessionDir = sessionId ? (byId.get(sessionId) ?? by8.get(sessionId.slice(0, 8)) ?? null) : null;
				let to, why;
				if (sessionDir){ to = path.join(sessionDir, name); why = "joined to session " + sessionId; counts.joined++; }
				else { to = path.join(sessDay, name); why = sessionId ? "session " + sessionId + " not in the store" : "no session_id in task.jsonl"; counts.unjoined++; }
				if (taken(to)){ to = dedupe(to); why += " (collision)"; counts.collisions++; }
				claim(to);
				moves.push({ kind: "task", from: rel(full), to: rel(to), session: sessionId, day, slug: name, why });
				counts.task++;
			}
		}
		return { moves, counts };
	}

	// ---- apply: snapshot, log (small line + files line), move ----
	// manifest: a dry run's file ({moves: [{kind, from, to}]}, e.g. the one-tree card move) applied as written, instead of plan()
	static async apply(repo, { only, skip, manifest } = {}){
		const TaskDirs = await loadTaskDirs(repo);
		const { moves } = manifest ? JSON.parse(fs.readFileSync(manifest, "utf8")) : await this.plan(repo);
		const wanted = m => manifest ? fs.existsSync(path.join(repo, m.from)) : (!only || only.includes(m.day)) && (!skip || !skip.includes(m.slug));
		const man = this.ledger(repo), filesMan = this.filesLedger(repo);
		fs.mkdirSync(path.dirname(man), { recursive: true });
		let moved = 0;
		const run = new Date().toISOString();   // every line of this apply carries it, so --undo reverses THIS run only (one-store, 2026-10-13)
		for (const m of moves){
			if (!wanted(m)) continue;
			if (m.kind === "redirect"){   // virtual: no fs action, just the small line so old URLs resolve straight to the final dir
				fs.appendFileSync(man, JSON.stringify({ at: new Date().toISOString(), run, kind: m.kind, from: m.from, to: m.to, session: m.session }) + "\n");
				continue;
			}
			const from = path.join(repo, m.from), to = path.join(repo, m.to);
			if (fs.existsSync(to)) throw new Error("target exists: " + m.to);
			// a "dayfile" move is a single loose file, not a folder: TaskDirs.files() walks a directory, so snapshot the one file directly
			const files = this.isFile(m)
				? [{ p: path.basename(from), size: fs.statSync(from).size, sha1: crypto.createHash("sha1").update(fs.readFileSync(from)).digest("hex") }]
				: TaskDirs.files(from);   // the snapshot: taken before the folder moves
			fs.appendFileSync(filesMan, JSON.stringify({ run, from: m.from, to: m.to, files }) + "\n");   // recorded first, so an interrupted run can still be undone
			fs.mkdirSync(path.dirname(to), { recursive: true });
			for (let n = 0; ; n++){   // Windows: a watcher or reader can hold a handle for a moment (EPERM/EBUSY); retry, then give up loudly
				try { fs.renameSync(from, to); break; }
				catch (e){ if (n >= 20 || !["EPERM", "EBUSY", "EACCES"].includes(e.code)) throw e; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250); }
			}
			fs.appendFileSync(man, JSON.stringify({ at: new Date().toISOString(), run, kind: m.kind, from: m.from, to: m.to, session: m.session }) + "\n");   // after the rename: the log never claims a move that did not happen
			moved++;
		}
		// a day folder that is now empty goes away (never recursive: a non-empty one throws here and is left alone)
		for (const day of dirs(this.ai(repo)).filter(n => DAY.test(n))){
			const d = path.join(this.ai(repo), day);
			try { if (fs.readdirSync(d).length === 0) fs.rmdirSync(d); } catch {}
		}
		// the old card tree's year/month/day folders, now empty, go too (bottom-up, never recursive)
		const prune = d => { for (const n of dirs(d)) prune(path.join(d, n)); try { if (fs.readdirSync(d).length === 0) fs.rmdirSync(d); } catch {} };
		if (manifest) for (const y of dirs(this.ai(repo)).filter(n => /^\d{4}$/.test(n))) prune(path.join(this.ai(repo), y));
		return { moved, run };
	}

	/** The physical (non-redirect) moves still in effect: a later {undone:true} line whose to/from is the exact reverse cancels one. */
	static #active(repo){
		// in ledger order: an undo cancels the move it reverses, and a later re-apply of the same pair is active again
		const on = new Map();
		for (const l of jsonl(this.ledger(repo))){
			if (l.undone) on.delete(`${l.to}|${l.from}`);
			else if (this.PHYSICAL.includes(l.kind)) on.set(`${l.from}|${l.to}`, l);
		}
		return [...on.values()];
	}
	static #snapshot(repo, from, to){ return jsonl(this.filesLedger(repo)).find(f => f.from === from && f.to === to)?.files ?? []; }

	/** Every snapshot file of every still-active move must exist at its new path with the same size and sha1. */
	static verify(repo, { run } = {}){
		const active = this.#active(repo).filter(l => !run || l.run === run), bad = [];
		let files = 0, bytes = 0;
		for (const m of active){
			const to = path.join(repo, m.to);
			for (const f of this.#snapshot(repo, m.from, m.to)){
				files++; bytes += f.size;
				// a "dayfile" move's `to` is the file itself, not a folder containing it
				const file = this.isFile(m) ? to : path.join(to, f.p);
				const label = this.isFile(m) ? m.to : m.to + "/" + f.p;
				if (!fs.existsSync(file)) bad.push({ missing: label });
				else if (crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex") !== f.sha1) bad.push({ changed: label });
			}
		}
		return { folders: active.length, files, bytes, bad };
	}

	/** Move a run's still-active physical moves back, in reverse order; append {undone:true} lines rather than rewrite anything.
	 *  Default: the LAST run only (its `run` stamp). `run` names another; `all` reverses every move ever made, the 10-12 ones too. */
	static undo(repo, { run, all } = {}){
		let active = this.#active(repo);
		const man = this.ledger(repo);
		if (!all){
			run ??= active.map(l => l.run).filter(Boolean).sort().at(-1);
			if (!run) throw new Error("no run-stamped move to undo (moves before 2026-10-13 have no run); --all reverses every move");
			active = active.filter(l => l.run === run);
		}
		let n = 0;
		for (const m of [...active].reverse()){
			const from = path.join(repo, m.from), to = path.join(repo, m.to);
			if (!fs.existsSync(to)) continue;
			fs.mkdirSync(path.dirname(from), { recursive: true });
			if (fs.existsSync(from)) throw new Error("undo target occupied: " + m.from);
			fs.renameSync(to, from);
			fs.appendFileSync(man, JSON.stringify({ at: new Date().toISOString(), run: m.run, kind: m.kind, from: m.to, to: m.from, session: m.session, undone: true }) + "\n");
			n++;
		}
		return n;
	}

	// ---- relink: rewrite links and import specifiers from the ledger (or, pre-apply, from the plan) ----
	static *walkFiles(repo){
		const exts = new Set([".md", ".js", ".mjs", ".html"]);   // not .json: data records and the generated directory.json keep their history; old URLs redirect
		const skipDirs = new Set(["node_modules", ".git"]);
		function* walk(dir){
			let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of entries){
				const full = path.join(dir, e.name);
				const relp = slash(path.relative(repo, full));
				if (e.isDirectory()){
					if (skipDirs.has(e.name)) continue;
					if (relp === ".claude/worktrees" || relp.startsWith(".claude/worktrees/")) continue;
					yield* walk(full);
				} else {
					if (e.name.endsWith(".jsonl")) continue;
					if (!exts.has(path.extname(e.name))) continue;
					yield full;
				}
			}
		}
		for (const d of ["public", "Server", "Servex", ".claude"]){
			const full = path.join(repo, d);
			if (fs.existsSync(full)) yield* walk(full);
		}
		const readme = path.join(repo, "readme.md"); if (fs.existsSync(readme)) yield readme;
		const claudemd = path.join(repo, "CLAUDE.md"); if (fs.existsSync(claudemd)) yield claudemd;   // off limits: counted below, never written
	}

	/** {day, slug} of a move, from its own day/slug fields (plan().moves) or, for the ledger's slim lines, parsed
	 *  back out of its old `public/framework/ai/YYYY-MM-DD/<slug>` address. null for a same-level "rename" (no day address of its own — its paired "redirect" line carries it). */
	static dayslug(m){
		if (m.day && m.slug) return { day: m.day, slug: m.slug };
		const mm = /public\/framework\/ai\/(\d{4}-\d{2}-\d{2})\/([^/]+)/.exec(m.from);
		return mm ? { day: mm[1], slug: mm[2] } : null;
	}

	/** moves: the ledger's lines (or, pre-apply, plan().moves) — each {kind, from, to}, day/slug derived via dayslug(). */
	static relink(repo, moves, { dry = false } = {}){
		const addr = new Map(), days = new Set();   // "day/slug" -> new repo-relative path
		for (const m of moves){
			if (!["task", "rename", "dayfile", "redirect"].includes(m.kind)) continue;
			const ds = this.dayslug(m); if (!ds) continue;
			days.add(ds.day);
			addr.set(`${ds.day}/${ds.slug}`, m.to);
		}
		const subs = [];
		for (const [key, to] of addr){
			const day = key.slice(0, 10), slug = key.slice(11);
			const pub = to, sl = "/" + to.slice("public/".length), bare = to.slice("public/framework/".length);
			subs.push({ re: new RegExp(esc(`public/framework/ai/${day}/${slug}`) + String.raw`(?=[\/"'\)\s,]|$)`, "g"), to: pub });
			subs.push({ re: new RegExp(esc(`/framework/ai/${day}/${slug}`) + String.raw`(?=[\/"'\)\s,]|$)`, "g"), to: sl });
			subs.push({ re: new RegExp(esc(`ai/${day}/${slug}`) + String.raw`(?=[\/"'\)\s,]|$)`, "g"), to: bare });
		}
		for (const day of days){
			const [Y, M, D] = day.split("-");
			subs.push({ re: new RegExp(esc(`/framework/ai/${day}/`) + String.raw`(?=["'\)\s,]|$)`, "g"), to: `/framework/ai/sessions/${Y}/${M}/${D}/` });   // the day page only: a skipped (live) task under it keeps its old address
		}
		if (moves.some(m => m.kind === "card" || m.kind === "cardfile")) subs.push(this.cardSub(repo));   // the card tree: one rule, not one regex per card
		// folder moves only (not the virtual "redirect" line) — a moved file's own relative references resolve against these
		const movesByFrom = moves.filter(m => m.kind === "task" || m.kind === "rename" || m.kind === "card").map(m => ({ from: path.join(repo, m.from), to: path.join(repo, m.to) }));
		const resolveRef = (file, mv, link) => {
			const oldDir = path.join(mv.from, path.relative(mv.to, path.dirname(file)));
			const oldAbs = path.resolve(oldDir, link);
			if (!path.relative(mv.from, oldAbs).startsWith("..")) return null;   // still inside the moved folder: unaffected
			const inner = movesByFrom.find(m2 => oldAbs === m2.from || oldAbs.startsWith(m2.from + path.sep));
			const targetAbs = inner ? path.join(inner.to, path.relative(inner.from, oldAbs)) : oldAbs;
			let newLink = slash(path.relative(path.dirname(file), targetAbs));
			if (!newLink.startsWith(".")) newLink = "./" + newLink;
			return newLink === link ? null : newLink;
		};

		let files = 0, hits = 0, importHits = 0, claudeMdHits = 0; const samples = [];
		for (const file of this.walkFiles(repo)){
			let text; try { text = fs.readFileSync(file, "utf8"); } catch { continue; }
			let out = text, n = 0, importN = 0, sampleBefore = null, sampleAfter = null;
			const sample = (before, after) => { if (sampleBefore === null){ sampleBefore = before; sampleAfter = after; } };
			for (const s of subs) out = out.replace(s.re, (...a) => { const to = typeof s.to === "function" ? s.to(...a) : s.to; if (to !== a[0]){ n++; sample(a[0], to); } return to; });

			const mv = movesByFrom.find(m => file === m.to || file.startsWith(m.to + path.sep));
			if (mv){
				// markdown links: [text](../rel/path)
				out = out.replace(/\]\((\.\.?\/[^)]+)\)/g, (whole, link) => {
					const fixed = resolveRef(file, mv, link); if (!fixed) return whole;
					n++; sample(link, fixed); return `](${fixed})`;
				});
				// import specifiers / new URL(..., import.meta.url) / fetch(...): a relative string literal after from/import(/new URL(/fetch(
				out = out.replace(/(from\s+|import\s*\(\s*|new\s+URL\(\s*|fetch\(\s*)(["'])(\.\.?\/[^"']+)\2/g, (whole, lead, q, link) => {
					const fixed = resolveRef(file, mv, link); if (!fixed) return whole;
					n++; importN++; sample(link, fixed); return `${lead}${q}${fixed}${q}`;
				});
			}
			if (n === 0) continue;
			const isClaudeMd = path.basename(file) === "CLAUDE.md" && path.dirname(file) === repo;
			if (isClaudeMd){ claudeMdHits += n; continue; }
			files++; hits += n; importHits += importN;
			if (samples.length < 20) samples.push({ file: slash(path.relative(repo, file)), hits: n, imports: importN, before: sampleBefore, after: sampleAfter });
			if (!dry) fs.writeFileSync(file, out);
		}
		return { files, hits, importHits, claudeMdHits, samples };
	}

	/** ONE substitution for the whole card tree (one tree, 2026-10-13): a path into ai/YYYY/… becomes its path in the store
	 *  (CardDir.rel), only when that file or folder really moved (new exists, old does not). A page url /framework/ai/<id>/ is
	 *  the Inbox route and stays as it is; a file under it, a public/… path and a bare ai/… path are rewritten. */
	static cardSub(repo){
		const ai = this.ai(repo), has = r => fs.existsSync(path.join(ai, ...r.split("/")));
		return { re: /((?:public)?\/framework\/ai\/|(?<![\w\/.-])ai\/)(\d{4}(?![\w-])(?:\/[\w.-]+)*)/g, to: (m, lead, p) => {
			const dots = /\.+$/.exec(p)?.[0] ?? "", at = p.slice(0, p.length - dots.length);
			const file = /\.[a-z0-9]+$/i.test(at.split("/").at(-1));
			if (lead === "/framework/ai/" && !file) return m;   // a card's page: the Inbox route, unchanged
			if (at.split("/").length < 3) return m;   // a bare ai/2026 or ai/2026/10 in prose names the old tree, not an index file
			const now = CardDir.rel(at);
			return now !== at && has(now) && !has(at) ? lead + now + dots : m;
		} };
	}

	/** ai/sessions/task-pages.json: the moved task folders that carry their own page.js, as site urls. StoreFolder.js reads it so
	 *  routing a moved task never probes (a 404 probe is a console error the smoke gate counts). Regenerate after every --apply. */
	static pages(repo){
		const live = this.#active(repo).filter(m => m.kind === "task" || m.kind === "rename");
		const urls = [...new Set(live.map(m => m.to))].filter(to => fs.existsSync(path.join(repo, to, "page.js"))).map(to => "/" + to.slice("public/".length) + "/").sort();
		const out = path.join(this.sessStore(repo), "task-pages.json");
		fs.writeFileSync(out, JSON.stringify({ note: "moved task folders with their own page.js; written by node Server/TaskMove.mjs --pages", pages: urls }, null, "\t") + "\n");
		return { count: urls.length, out: slash(path.relative(repo, out)) };
	}

	// ---- redirects: public/_redirects lines for Cloudflare ----
	static redirects(repo, moves){
		const seen = new Set(), lines = [];
		for (const m of moves){
			if (!["task", "rename", "dayfile", "redirect"].includes(m.kind)) continue;
			const ds = this.dayslug(m); if (!ds) continue;
			const key = `${ds.day}/${ds.slug}`; if (seen.has(key)) continue; seen.add(key);
			lines.push(`/framework/ai/${ds.day}/${ds.slug}/* /${m.to.slice("public/".length)}/:splat 301`);
		}
		const out = path.join(this.sessStore(repo), "task-redirects.txt");
		fs.mkdirSync(path.dirname(out), { recursive: true });
		fs.writeFileSync(out, lines.join("\n") + (lines.length ? "\n" : ""));
		const redirectsFile = path.join(repo, "public", "_redirects");
		return { count: lines.length, out: slash(path.relative(repo, out)), redirectsFileExists: fs.existsSync(redirectsFile), redirectsFile: slash(path.relative(repo, redirectsFile)) };
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const repoGiven = flag("--repo");
	const REPO = path.resolve(val("--repo") ?? path.join(here, ".."));
	if (val("--ledger")){ if (!/^[\w-]+$/.test(val("--ledger"))) throw new Error("--ledger is a name, e.g. card-moves"); TaskMove.LEDGER = val("--ledger"); }
	const only = val("--only")?.split(",").filter(Boolean);
	const skip = val("--skip")?.split(",").filter(Boolean);
	const planOut = val("--plan-out") ?? (repoGiven ? path.join(os.tmpdir(), "task-moves.plan.json") : TaskMove.planFile(REPO));

	if (flag("--undo")) console.log(`moved back ${TaskMove.undo(REPO, { run: val("--run"), all: flag("--all") })} folders`);
	else if (flag("--verify")){
		const r = TaskMove.verify(REPO, { run: val("--run") === "last" ? jsonl(TaskMove.ledger(REPO)).map(l => l.run).filter(Boolean).sort().at(-1) : val("--run") });
		console.log(`${r.folders} folders, ${r.files} files, ${r.bytes} bytes checked: ${r.bad.length} missing/changed`);
		if (r.bad.length){ console.log(r.bad.slice(0, 20)); process.exit(1); }
	}
	else if (flag("--relink")){
		const dry = flag("--dry");
		// a real move line, not the file's own placeholder "note" line (ai/sessions/task-moves.jsonl declares its own shape before anything moves)
		// ONE run's moves (default: the last apply), never a replay of the whole ledger: a replay re-deepens relative links
		// the earlier relink already fixed (found 2026-10-13). --plan: from the dry-run plan, before any apply; --all: every move.
		const real = jsonl(TaskMove.ledger(REPO)).filter(l => !l.undone && [...TaskMove.PHYSICAL, "redirect"].includes(l.kind));
		const run = val("--run") && val("--run") !== "last" ? val("--run") : real.map(l => l.run).filter(Boolean).sort().at(-1);
		const moves = flag("--plan") || !real.length ? (await TaskMove.plan(REPO)).moves : flag("--all") ? real : real.filter(l => l.run && l.run === run);
		if (!moves.length){ console.log("nothing to relink: no run-stamped move (--plan before an apply, --all for every move)"); process.exit(1); }
		const r = TaskMove.relink(REPO, moves, { dry });
		console.log(`files: ${r.files}, hits: ${r.hits} (of which import/URL specifiers: ${r.importHits}), CLAUDE.md hits (listed, not edited): ${r.claudeMdHits}`);
		console.log(r.samples.slice(0, 20));
		console.log(dry ? "(dry run: nothing was changed)" : "written.");
	}
	else if (flag("--pages")) console.log(TaskMove.pages(REPO));
	else if (flag("--redirects")){
		const real = jsonl(TaskMove.ledger(REPO)).filter(l => ["task", "rename", "stub", "dayfile", "redirect"].includes(l.kind));
		const moves = real.length ? real : (await TaskMove.plan(REPO)).moves;
		console.log(TaskMove.redirects(REPO, moves));
	}
	else if (flag("--apply")) console.log(await TaskMove.apply(REPO, { only, skip, manifest: val("--manifest") && path.resolve(val("--manifest")) }));
	else {
		const { moves, counts } = await TaskMove.plan(REPO);
		fs.mkdirSync(path.dirname(planOut), { recursive: true });
		fs.writeFileSync(planOut, JSON.stringify({ at: new Date().toISOString(), repo: REPO, moves, counts }, null, 1));
		console.log(`task:${counts.task} rename:${counts.rename} stub:${counts.stub} dayfile:${counts.dayfile} collisions:${counts.collisions} joined:${counts.joined} unjoined:${counts.unjoined}`);
		console.log("plan written to", planOut);
		console.log("(dry run: nothing else was changed)");
	}
}
