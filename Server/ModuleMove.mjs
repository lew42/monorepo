#!/usr/bin/env node
// Server/ModuleMove.mjs — move one module folder to a new home and relink every path that points into it.
// Dry run by default: prints the plan and writes the manifest only with --apply. Undo replays the manifest backwards (it checks every file first, then writes).
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
//     (public/framework/...) naming it. In live docs and code also the bare name ("ai/AITask").
//   - records (dated session/task folders, *.json/*.jsonl data) are history: only their import paths change, so old
//     pages keep loading; their prose keeps the old name, and a pointer page at the old url says where it went.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

class ModuleMove {
	static SCAN = ["public", "Server", "Servex", ".claude"];
	static SKIP = /(^|\/)(node_modules|\.git|scratch|screenshots|recordings|shots)(\/|$)/;
	static CODE = /\.(m?js|css|html)$/;
	static DOC = /\.md$/;
	static HISTORY = /^public\/framework\/ai\/(sessions\/\d{4}|\d{4})/;   // dated records: never rewrite their prose
	static TOKEN = /[A-Za-z0-9_.~\/-]*[A-Za-z0-9_]/g;

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
				else if (ModuleMove.CODE.test(e.name) || ModuleMove.DOC.test(e.name)) out.push(r);
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
		const at = (name, i = token.indexOf(name[0])) => {
			const end = token[i + name[0].length];
			return i >= 0 && (end === undefined || end === "/") ? token.slice(0, i) + name[1] + token.slice(i + name[0].length) : null;
		};
		// "/framework/ai/AITask/…" (also inside public/… and http://…/…): always; it is a link or an import.
		const u = at(url);
		if (u) return u;
		// "ai/AITask" or "framework/ai/AITask" as a name in prose: live files only.
		if (history) return null;
		if (token.startsWith(bare[0])) return at(bare, 0);
		if (token.startsWith("framework/" + bare[0])) return at(bare, "framework/".length);
		return null;
	}

	plan(){
		const changes = [];
		for (const file of this.files()){
			const moved = this.inside(file, this.from);
			const history = ModuleMove.HISTORY.test(file) && !moved;
			const code = ModuleMove.CODE.test(file);
			if (history && !code) continue;   // a dated record's prose keeps the name it had
			const text = fs.readFileSync(path.join(this.repo, file), "utf8");
			const lines = text.split("\n"), edits = [];
			lines.forEach((line, n) => {
				let out = "", last = 0;
				for (const m of line.matchAll(ModuleMove.TOKEN)){
					const tok = m[0];
					if (!tok.includes("/")) continue;
					const r = this.relink(tok, file, { moved, history, code });
					if (r == null) continue;
					out += line.slice(last, m.index);
					edits.push({ line: n, col: out.length, from: tok, to: r });
					out += r; last = m.index + tok.length;
				}
				if (last) lines[n] = out + line.slice(last);
			});
			if (edits.length) changes.push({ file, moved, edits, text: lines.join("\n") });
		}
		return changes;
	}

	git(...args){ return execFileSync("git", args, { cwd: this.repo, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }); }

	// Move a folder: `git mv` when git tracks it (so the rename shows in the index), else a plain rename. `git mv` fails on a folder git does
	// not know yet (a page made a minute ago, anything git-ignored) and outside a repository, so that is not an error here. Returns "git" or "rename".
	relocate(from, to){
		fs.mkdirSync(path.dirname(path.join(this.repo, to)), { recursive: true });
		try { this.git("mv", from, to); return "git"; }
		catch { fs.renameSync(path.join(this.repo, from), path.join(this.repo, to)); return "rename"; }
	}

	// What a person is shown before agreeing: how many files and paths change, how many of them are links in OTHER files, and a few examples.
	summary(changes = this.plan()){
		const all = changes.flatMap(c => c.edits.map(e => ({ file: c.file, outside: !c.moved, ...e })));
		return { files: changes.length, paths: all.length, links: all.filter(e => e.outside).length,
			outside_files: new Set(all.filter(e => e.outside).map(e => e.file)).size,
			sample: all.slice(0, 6).map(({ file, from, to }) => ({ file, from, to })) };
	}

	// `extra` is stored in the manifest as it is (the caller's own notes for its undo). Writes the manifest BEFORE moving the folder, so a crash
	// half-way still leaves the record of every old path.
	apply(manifestFile, extra){
		if (!this.exists(this.from)) throw new Error(`${this.from} does not exist`);
		if (this.exists(this.to)) throw new Error(`${this.to} already exists (Windows folds case: check a lower-case twin too)`);
		const changes = this.plan();
		const manifest = { at: new Date().toISOString(), from: this.from, to: this.to,
			files: changes.map(c => ({ file: c.file, now: c.moved ? this.to + c.file.slice(this.from.length) : c.file, edits: c.edits.map(({ line, col, from, to }) => ({ line, col, from, to })) })) };
		if (extra) manifest.extra = extra;
		fs.mkdirSync(path.dirname(manifestFile), { recursive: true });
		fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, "\t") + "\n");
		for (const c of changes) fs.writeFileSync(path.join(this.repo, c.file), c.text);
		manifest.how = this.relocate(this.from, this.to);
		fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, "\t") + "\n");
		return manifest;
	}

	// Two passes: first work out every restored file and stop if any edit no longer reads as the move left it, then write. A changed file
	// therefore stops the undo before anything is touched.
	static undo(repo, manifestFile){
		const m = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
		const mover = new ModuleMove(repo, m.from, m.to);
		const restored = m.files.map(f => {
			const abs = path.join(repo, f.now), lines = fs.readFileSync(abs, "utf8").split("\n");
			for (const e of [...f.edits].reverse()){   // right to left, so each col is still where the forward pass put it
				const i = e.col;
				if (lines[e.line]?.slice(i, i + e.to.length) !== e.to) throw new Error(`${f.now}:${e.line + 1}:${i} no longer holds ${e.to}, so the move was not undone`);
				lines[e.line] = lines[e.line].slice(0, i) + e.from + lines[e.line].slice(i + e.to.length);
			}
			return [abs, lines.join("\n")];
		});
		for (const [abs, text] of restored) fs.writeFileSync(abs, text);
		mover.relocate(m.to, m.from);
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
