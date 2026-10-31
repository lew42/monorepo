#!/usr/bin/env node
// Server/ModuleMove.mjs — move one module folder to a new home and relink every path that points into it.
// A module is a folder or a single file. Dry run by default: prints the plan and writes the manifest only with --apply. Undo replays the manifest backwards (it checks every file first, then writes).
// All or nothing: if the move itself fails, every rewritten file is put back and the manifest says "rolled_back"; an undo that fails half-way does the same.
// `git mv` is used when git tracks the folder; otherwise (a new or git-ignored folder, or no repository) a plain rename. Also used by the dev server's Files tab (Server/plugins/SocketServer/Files.js), which stores its manifests in Server/moves/.
// Why and the rule for which folders get rewritten: public/framework/ai/doc/module-homes.md.
//
//   node Server/ModuleMove.mjs <from> <to> [--repo <path>]                      dry run: what would change, per file
//   node Server/ModuleMove.mjs <from> <to> --apply --manifest <file> [--repo <path>]
//   node Server/ModuleMove.mjs --undo <manifest> [--repo <path>]
//   <from>/<to> are repo-relative folders, e.g. public/framework/ai/AITask public/framework/ai/AITask
//
// What is rewritten (a token is a path-like run of characters):
//   - inside the moved module: a relative path that resolves OUTSIDE it is re-aimed from the new place;
//   - everywhere else: a relative path that resolves INTO it, and any absolute url (/framework/...) or repo path
//     (public/framework/...) naming it, when the text before it is nothing, "public" or this site (localhost, lew42.com): so
//     "Servex/notes/trip", "https://example.com/notes/trip" and "/home/me/notes/trip" are left alone. In live docs and code also the bare
//     name ("ai/AITask"), but only when that path really exists.
//   - .jsonl pages: only the value of a "class":"/…" key (the page's class url), and not in dated records.
//   - records (dated session/task folders) are history: only their import paths change, so old pages keep loading; their prose and
//     logs keep the old name, and a pointer page at the old url says where it went.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

class ModuleMove {
	static SCAN = ["public", "Server", "Servex", ".claude"];
	static SKIP = /(^|\/)(node_modules|\.git|scratch|screenshots|recordings|shots)(\/|$)/;
	static CODE = /\.(m?js|css|html)$/;
	static DOC = /\.md$/;
	static DATA = /\.jsonl$/;   // scanned for "class":"/…" values only
	static CLASS = /"class"\s*:\s*"(\/[^"\\]*)"/g;
	static SITE = /^(?:https?:\/\/(?:localhost|127\.0\.0\.1|(?:[a-z0-9-]+\.)*lew42\.(?:com|workers\.dev))(?::\d+)?|public)?$/i;   // what may stand before /notes/trip in a token
	static HISTORY = /^public\/framework\/ai\/(sessions\/\d{4}|\d{4})/;   // dated records: never rewrite their prose
	static TOKEN = /(?:https?:\/\/[A-Za-z0-9.-]+(?::\d+)?)?[A-Za-z0-9_.~\/-]*[A-Za-z0-9_]/g;   // a path-like run, with a http(s) host in front when it has one

	constructor(repo, from, to){
		this.repo = repo;
		this.from = from.replace(/\\/g, "/").replace(/\/$/, "");
		this.to = to.replace(/\\/g, "/").replace(/\/$/, "");
		const short = p => p.replace(/^public\/framework\//, "").replace(/^public\//, "");
		this.names = [[`/${this.from.replace(/^public\//, "")}`, `/${this.to.replace(/^public\//, "")}`], [this.from, this.to], [short(this.from), short(this.to)]];
	}

	rel(abs){ return path.relative(this.repo, abs).split(path.sep).join("/"); }
	inside(r, dir){ return r === dir || r.startsWith(dir + "/"); }
	exists(r){ return fs.existsSync(path.join(this.repo, r)); }

	files(){
		const out = [];
		const walk = dir => {
			let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of list){
				const p = path.join(dir, e.name), r = this.rel(p);
				if (ModuleMove.SKIP.test(r)) continue;
				if (e.isDirectory()) walk(p);
				else if (ModuleMove.CODE.test(e.name) || ModuleMove.DOC.test(e.name) || ModuleMove.DATA.test(e.name)) out.push(r);
			}
		};
		for (const s of ModuleMove.SCAN) walk(path.join(this.repo, s));
		return out;
	}

	// One token -> its replacement, or null. `file` is the file's repo path BEFORE the move.
	relink(token, file, { moved, history, code }){
		const dir = path.posix.dirname(file);
		if (token.startsWith("./") || token.startsWith("../")){
			const target = path.posix.normalize(path.posix.join(dir, token.replace(/[?#].*$/, "")));
			if (!this.exists(target)) return null;
			const newFile = moved ? this.to + file.slice(this.from.length) : file;
			let aim;
			if (moved && !this.inside(target, this.from)) aim = target;
			else if (!moved && this.inside(target, this.from)) aim = this.to + target.slice(this.from.length);
			else return null;
			let r = path.posix.relative(path.posix.dirname(newFile), aim) || ".";
			if (!r.startsWith(".")) r = "./" + r;
			if (token.endsWith("/") && !r.endsWith("/")) r += "/";
			return r === token ? null : r;
		}
		if (token.startsWith(".")) return null;   // a relative path that does not resolve into the module
		const [url, , bare] = this.names;
		const at = (name, i) => {
			const end = token[i + name[0].length];
			return i >= 0 && (end === undefined || end === "/") ? token.slice(0, i) + name[1] + token.slice(i + name[0].length) : null;
		};
		// "/framework/ai/AITask/…" (also public/… and http://localhost/…): always; it is a link or an import. Only a site, "public" or nothing may come before it.
		const i = token.indexOf(url[0]);
		if (i >= 0 && ModuleMove.SITE.test(token.slice(0, i))){ const u = at(url, i); if (u) return u; }
		// "ai/AITask" or "framework/ai/AITask" as a name in prose: live files only, and only a path that is really there.
		if (history) return null;
		const i0 = token.startsWith(bare[0]) ? 0 : token.startsWith("framework/" + bare[0]) ? "framework/".length : -1;
		if (i0 < 0 || !(this.exists(token) || this.exists("public/framework/" + token) || this.exists("public/" + token))) return null;
		return at(bare, i0);
	}

	plan(){
		const changes = [];
		for (const file of this.files()){
			const moved = this.inside(file, this.from);
			const history = ModuleMove.HISTORY.test(file) && !moved;
			const code = ModuleMove.CODE.test(file), data = ModuleMove.DATA.test(file);
			if (history && !code) continue;   // a dated record's prose and logs keep the name they had
			const text = fs.readFileSync(path.join(this.repo, file), "utf8");
			if (data && !text.includes('"class"')) continue;
			const lines = text.split("\n"), edits = [];
			lines.forEach((line, n) => {
				const found = data ? [...line.matchAll(ModuleMove.CLASS)].map(m => ({ index: m.index + m[0].length - 1 - m[1].length, tok: m[1] }))
					: [...line.matchAll(ModuleMove.TOKEN)].filter(m => m[0].includes("/")).map(m => ({ index: m.index, tok: m[0] }));
				let out = "", last = 0;
				for (const { index, tok } of found){
					const r = this.relink(tok, file, { moved, history: history || data, code });
					if (r == null) continue;
					out += line.slice(last, index);
					edits.push({ line: n, col: out.length, from: tok, to: r });
					out += r; last = index + tok.length;
				}
				if (last) lines[n] = out + line.slice(last);
			});
			if (edits.length) changes.push({ file, moved, edits, before: text, text: lines.join("\n") });
		}
		return changes;
	}

	git(...args){ return execFileSync("git", args, { cwd: this.repo, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }); }

	// Move a folder or file: `git mv` when git tracks it (so the rename shows in the index), else a plain rename. `git mv` fails on something git does
	// not know yet (a page made a minute ago, anything git-ignored) and outside a repository, so that is not an error here. Returns "git" or "rename".
	// A rename that changes only capitals (Trip -> trip) goes through a temp name: a disk that ignores capitals (Windows, macOS) says the new name is already taken.
	relocate(from, to){
		fs.mkdirSync(path.dirname(path.join(this.repo, to)), { recursive: true });
		if (from.toLowerCase() !== to.toLowerCase()) return this.step(from, to);
		const tmp = `${from}.moving-${process.pid}`;
		this.step(from, tmp);
		try { return this.step(tmp, to); }
		catch (e){ try { this.step(tmp, from); } catch {} throw e; }
	}

	step(from, to){
		try { this.git("mv", from, to); return "git"; }
		catch { fs.renameSync(path.join(this.repo, from), path.join(this.repo, to)); return "rename"; }
	}

	// Is there an entry with exactly this name (capitals as written)? A plain exists() cannot tell Trip from trip on Windows.
	named(r){ try { return fs.readdirSync(path.dirname(path.join(this.repo, r))).includes(path.basename(r)); } catch { return false; } }

	// The refusals a move must pass; the dry run asks this too, so it never promises what apply would refuse. Throws a sentence.
	check(){
		if (!this.exists(this.from)) throw new Error(`${this.from} does not exist`);
		const case_only = this.from !== this.to && this.from.toLowerCase() === this.to.toLowerCase();
		if (case_only ? this.named(this.to) : this.exists(this.to)) throw new Error(`${this.to} already exists`);
	}

	// What a person is shown before agreeing: how many files and paths change, how many of them are links in OTHER files (data_links: of those, in .jsonl pages), and a few examples.
	summary(changes = this.plan()){
		const all = changes.flatMap(c => c.edits.map(e => ({ file: c.file, outside: !c.moved, ...e })));
		return { files: changes.length, paths: all.length, links: all.filter(e => e.outside).length,
			data_links: all.filter(e => e.outside && ModuleMove.DATA.test(e.file)).length,
			outside_files: new Set(all.filter(e => e.outside).map(e => e.file)).size,
			sample: all.slice(0, 6).map(({ file, from, to }) => ({ file, from, to })) };
	}

	// `extra` is stored in the manifest as it is (the caller's own notes for its undo). `changes` is the plan the caller already made (a scan is slow; do it once).
	// The manifest is written BEFORE anything changes (status "moving"), so a crash half-way still leaves the record of every old path. All or nothing: if a write or
	// the move itself throws, every file already rewritten is put back, the manifest says "rolled_back", and the error is thrown. Returns the manifest, with
	// `warnings` (not stored) for anything that went wrong after the move worked.
	apply(manifestFile, extra, changes = this.plan()){
		this.check();
		const manifest = { at: new Date().toISOString(), kind: fs.statSync(path.join(this.repo, this.from)).isDirectory() ? "folder" : "file", from: this.from, to: this.to, status: "moving",
			files: changes.map(c => ({ file: c.file, now: c.moved ? this.to + c.file.slice(this.from.length) : c.file, edits: c.edits.map(({ line, col, from, to }) => ({ line, col, from, to })) })) };
		if (extra) manifest.extra = extra;
		const save = () => fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, "\t") + "\n");
		fs.mkdirSync(path.dirname(manifestFile), { recursive: true });
		save();
		const written = [];
		try {
			for (const c of changes){ written.push(c); fs.writeFileSync(path.join(this.repo, c.file), c.text); }
			manifest.how = this.relocate(this.from, this.to);
		} catch (e){
			const stuck = [];
			for (const c of written.reverse()) try { fs.writeFileSync(path.join(this.repo, c.file), c.before); } catch { stuck.push(c.file); }
			manifest.status = "rolled_back";
			if (stuck.length) manifest.not_restored = stuck;
			try { save(); } catch {}
			throw Object.assign(new Error(e.message + (stuck.length ? `. These files could not be put back and still point at the new place: ${stuck.join(", ")}` : ". Nothing was changed.")), { code: e.code });
		}
		manifest.status = "done";
		try { save(); } catch (e){ manifest.warnings = [`the move worked, but its record could not be finished (${e.message})`]; }
		return manifest;
	}

	// Where each edit now sits, if the file changed since the move: the same place, else the nearest whole-token match of what the move wrote (a line added above is fine).
	static locate(lines, e){
		if (lines[e.line]?.slice(e.col, e.col + e.to.length) === e.to) return { line: e.line, col: e.col };
		const pattern = new RegExp(`(?<![A-Za-z0-9_.~/-])${e.to.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_]|[./~-][A-Za-z0-9_])`, "g");
		let best = null;
		lines.forEach((text, line) => { for (const m of text.matchAll(pattern)){ const d = Math.abs(line - e.line) * 1e6 + Math.abs(m.index - e.col); if (!best || d < best.d) best = { d, line, col: m.index }; } });
		return best;
	}

	// Two passes: first work out every restored file and stop if any link can no longer be found, then write. A changed file therefore stops the undo before anything
	// is touched. An edit elsewhere in a touched file is fine (ModuleMove.locate); a link that was deleted or rewritten is not, and the error names it.
	// If the write or the move back throws, the files already restored are put back as the move left them. Works from where things are on disk, so it also undoes
	// a move that crashed after rewriting links but before moving the folder.
	static undo(repo, manifestFile){
		const m = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
		if (m.status === "rolled_back") throw new Error("that move failed and was rolled back when it happened, so there is nothing to undo");
		const mover = new this(repo, m.from, m.to);
		const [at_new, at_old] = [mover.named(m.to), mover.named(m.from)];
		if (at_new === at_old) throw new Error(at_new ? `${m.to} and ${m.from} both exist` : `neither ${m.to} nor ${m.from} is there`);
		const restored = (m.files ?? []).map(f => {
			const abs = path.join(repo, at_new ? f.now : f.file), before = fs.readFileSync(abs, "utf8"), lines = before.split("\n");
			for (const e of [...f.edits].reverse()){   // right to left, so each col is still where the forward pass put it
				const where = ModuleMove.locate(lines, e);
				if (!where) throw new Error(`${at_new ? f.now : f.file} no longer holds ${e.to} (it was on line ${e.line + 1}), so the move was not undone and nothing was changed. Put that link back by hand, or rename the folder back as a new move.`);
				lines[where.line] = lines[where.line].slice(0, where.col) + e.from + lines[where.line].slice(where.col + e.to.length);
			}
			return { abs, before, text: lines.join("\n") };
		});
		const done = [];
		try {
			for (const r of restored){ done.push(r); fs.writeFileSync(r.abs, r.text); }
			if (at_new) mover.relocate(m.to, m.from);
		} catch (e){
			for (const r of done.reverse()) try { fs.writeFileSync(r.abs, r.before); } catch {}
			throw e;
		}
		return m;
	}

	static main(argv){
		const val = n => argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined;
		const repo = path.resolve(val("--repo") || path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
		if (val("--undo")){ const m = ModuleMove.undo(repo, val("--undo")); console.log(`undone: ${m.to} -> ${m.from}, ${m.files.length} files restored`); return; }
		const [from, to] = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
		if (!from || !to) { console.error("usage: node Server/ModuleMove.mjs <from> <to> [--apply --manifest <file>] | --undo <manifest>"); process.exit(2); }
		const mover = new ModuleMove(repo, from, to);
		if (argv.includes("--apply")){
			if (!val("--manifest")) { console.error("--apply needs --manifest <file>"); process.exit(2); }
			const m = mover.apply(path.resolve(val("--manifest")));
			console.log(`moved ${from} -> ${to}; ${m.files.length} files relinked, ${m.files.reduce((s, f) => s + f.edits.length, 0)} paths; manifest ${val("--manifest")}`);
			return;
		}
		const plan = mover.plan();
		for (const c of plan){
			console.log(`${c.moved ? "M" : " "} ${c.file}`);
			for (const e of c.edits.slice(0, 4)) console.log(`     ${e.line + 1}: ${e.from}  ->  ${e.to}`);
			if (c.edits.length > 4) console.log(`     … ${c.edits.length - 4} more`);
		}
		console.log(`dry run: ${plan.length} files, ${plan.reduce((s, c) => s + c.edits.length, 0)} paths. Nothing written; add --apply --manifest <file>.`);
	}
}

export default ModuleMove;
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) ModuleMove.main(process.argv.slice(2));
