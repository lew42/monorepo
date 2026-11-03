#!/usr/bin/env node
// Server/Unreferenced.mjs — CENSUS of files nothing points at. Candidates, not verdicts; moves and deletes nothing. Doc: public/framework/ai/doc/unreferenced.md
//   node Server/Unreferenced.mjs [--write]     print the count (and with --write, write ai/doc/unreferenced.md)
// A file under public/framework/{core,ext,ui,ux,web,styles} (web = public/web) counts as referenced when its file name appears as a token
// in any OTHER text file of public/, Server/ or Servex/ (an import, a link, a files.jsonl row, a children: path). Dated task dirs and session logs are not searched.
import fs from "node:fs";
import path from "node:path";
import TaskDirs from "./TaskDirs.mjs";

const REPO = TaskDirs.REPO, PUB = path.join(REPO, "public"), FW = path.join(PUB, "framework");
const ROOTS = ["core", "ext", "ui", "ux", "styles"].map(d => path.join(FW, d)).concat(path.join(PUB, "web"));
const CANDIDATE = /\.(js|mjs|css|html|md|svg)$/i, CORPUS = /\.(js|mjs|css|html|md|json|jsonl|svg|txt)$/i;
const SKIP_DIR = new Set(["node_modules", ".git", "shots", "salvage"]), IMPLICIT = /^(readme\.md|page\.js|files\.jsonl|index\.html)$/i;
const TOKEN = /[\w@.\-]+\.(?:js|mjs|css|html|md|svg|json|jsonl|png|jpg|webp)\b/gi;
const SPEC = /(?:^|[\s"'`(\[=:,<])((?:\.{0,2}\/)[\w@.\-\/%]*?\.(?:js|mjs|css|html|md|svg|json|jsonl|png|jpg|webp))\b/g;
const slash = p => p.split(path.sep).join("/");

export default class Unreferenced {
	constructor(){ this.paths = new Set(); this.refs = new Map(); this.candidates = []; this.members = 0; this.scanned = 0; }

	*walk(dir, skip = () => false){
		let es; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of es) {
			const p = path.join(dir, e.name);
			if (e.isDirectory()) { if (!SKIP_DIR.has(e.name) && !skip(p)) yield* this.walk(p, skip); }
			else yield p;
		}
	}

	/** Not the session store or dated task dirs: they quote everything. */
	in_logs(p){ const r = slash(path.relative(FW, p)); return r.startsWith("ai/sessions") || /^ai\/\d{4}-\d{2}-\d{2}/.test(r) || r.startsWith("ai/health"); }

	run(){
		for (const root of [PUB, path.join(REPO, "Server"), path.join(REPO, "Servex")])
			for (const p of this.walk(root, d => this.in_logs(d))) {
				if (!CORPUS.test(p)) continue;
				let size; try { size = fs.statSync(p).size; } catch { continue; }
				if (size > 3e6) continue;
				this.scanned++;
				const text = fs.readFileSync(p, "utf8");
				const dir = path.dirname(p);
				for (const m of text.matchAll(SPEC)) { const q = m[1].split(/[?#]/)[0]; const abs = q.startsWith("/") ? (q.startsWith("/framework/") || q.startsWith("/web/") || q.startsWith("/app") ? path.join(PUB, q) : path.join(REPO, q)) : path.resolve(dir, q); if (abs !== p) this.paths.add(abs.toLowerCase()); }
				for (const m of text.matchAll(TOKEN)) { const k = m[0].split("/").pop().toLowerCase(); let s = this.refs.get(k); if (!s) this.refs.set(k, s = new Set()); s.add(p); }
			}
		this.names = new Map();
		for (const root of [PUB, path.join(REPO, "Server"), path.join(REPO, "Servex")]) for (const p of this.walk(root, d => this.in_logs(d))) { const k = path.basename(p).toLowerCase(); this.names.set(k, (this.names.get(k) ?? 0) + 1); }
		for (const root of ROOTS) for (const p of this.walk(root)) {
			const name = path.basename(p);
			if (!CANDIDATE.test(name) || IMPLICIT.test(name) || /\.test\.mjs$/.test(name)) continue;
			if (/\/doc\/(method|property|file)\//.test(slash(p))) { this.members++; continue; }   // per-member docs the Doc system lists by folder
			const users = this.refs.get(name.toLowerCase()), common = (this.names.get(name.toLowerCase()) ?? 0) > 1;
			if (this.paths.has(p.toLowerCase()) || this.paths.has(p.toLowerCase().replace(/\.js$/, ""))) continue;
			if (this.sibling_ref(p)) continue;
			if (!common && users && [...users].some(u => u !== p)) continue;
			this.candidates.push(slash(path.relative(REPO, p)));
		}
		return this;
	}

	/** The three loads a name-grep misses, read from the file's own folder: a quoted name or "./name" in a .js, a "place" value in page.jsonl, a "file" row in files.jsonl. */
	sibling_ref(p){
		const dir = path.dirname(p), name = path.basename(p), esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const quoted = new RegExp("[\"'`](?:\\./)?" + esc + "[\"'`?#]"), jsonl = new RegExp("\"(?:place|file)\"\\s*:\\s*\"(?:\\./)?" + esc + "\"");
		let es; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return false; }
		for (const e of es) {
			if (!e.isFile() || e.name === name) continue;
			const re = /\.m?js$/i.test(e.name) ? quoted : /^(page|files)\.jsonl$/i.test(e.name) ? jsonl : null;
			if (!re) continue;
			try { if (re.test(fs.readFileSync(path.join(dir, e.name), "utf8"))) return true; } catch {}
		}
		return false;
	}

	by_dir(){ const g = new Map(); for (const c of this.candidates) { const d = path.posix.dirname(c); (g.get(d) ?? g.set(d, []).get(d)).push(path.posix.basename(c)); } return g; }

	page(){
		const g = this.by_dir(), L = ["# Unreferenced files: a census", "",
			`**${this.candidates.length} files** under \`public/framework/{core,ext,ui,ux,styles}\` and \`public/web\` have no reference anywhere: no \`import\`, no link in a \`.md\`, no \`files.jsonl\` row, no \`children:\` path. Searched ${this.scanned} text files with \`node Server/Unreferenced.mjs --write\`.`, "",
			"**A reference-free file is a candidate, not a verdict.** A file can be loaded by a name built at runtime, by a script tag, or by the owner typing its URL. Nothing here was moved or deleted; the owner decides.", "",
			"Not counted: the " + this.members + " per-member docs under `doc/method|property|file/` (the Doc system lists those by folder), `readme.md`, `page.js`, `files.jsonl`, `index.html`, tests, and anything under `ai/sessions`. A path (`./Foo.js`, `/framework/ext/Foo/Foo.js`) must resolve to the file; a bare file name counts only when no other file shares it, unless a `.js` in the same folder quotes it or its `page.jsonl` (`place`) or `files.jsonl` (`file`) names it. Back to [follow-up.md](follow-up.md).", ""];
		for (const [d, names] of [...g].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))) L.push(`- \`${d.replace("public/framework/", "")}/\` (${names.length}): ${names.slice(0, 8).map(n => "`" + n + "`").join(", ")}${names.length > 8 ? ", …" : ""}`);
		return L.join("\n") + "\n";
	}
}

if (process.argv[1]?.endsWith("Unreferenced.mjs")) {
	const u = new Unreferenced().run();
	if (process.argv.includes("--write")) fs.writeFileSync(path.join(TaskDirs.AI, "doc", "unreferenced.md"), u.page());
	console.log(`${u.candidates.length} unreferenced candidates (${u.scanned} files searched)`);
}
