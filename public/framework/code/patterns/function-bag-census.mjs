// node public/framework/code/patterns/function-bag-census.mjs [--repo] [--top 40] [--all] [--json <out>]
// The refactor backlog for CLAUDE.md "Write classes, not function bags": every lowercase .js file
// that exports loose functions and no class, ranked by how central it is (how many files import it).
//   default   public/framework, files with 3+ top-level functions
//   --repo    public/, Servex/ and Server/, every lowercase .js that exports a function and no class
// Columns, computed from the source text (a ranking, not a verdict):
//   imp   = files that import it directly (static or dynamic import, relative or /-rooted)
//   fn    = top-level functions · exp = exported functions · lines = file length
// Skipped: page.js (counted apart), *.test.js, the ai/<date> task dirs, shots, runs, worktrees, node_modules.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

class FunctionBagCensus {
	static repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
	static skip = /^(\d{4}(-\d\d-\d\d)?|\d\d|node_modules|shots|runs|worktrees|\.git|\.claude)$/;

	constructor(...args){ this.assign({ roots: ["public/framework"], minFn: 3, files: [], importers: new Map() }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	run(){
		const all = this.roots.flatMap(r => this.walk(path.join(FunctionBagCensus.repo, r)));
		// importers are counted across all three trees, whatever the roots
		const every = ["public", "Servex", "Server"].flatMap(r => this.walk(path.join(FunctionBagCensus.repo, r), /\.(m?js)$/));
		for (const f of every) for (const t of this.imports(f)) {
			if (!this.importers.has(t)) this.importers.set(t, new Set());
			this.importers.get(t).add(f);
		}
		this.rows = all.map(f => this.measure(f)).filter(Boolean)
			.sort((a, b) => b.imp - a.imp || b.exp - a.exp || b.lines - a.lines);
		this.pages = all.filter(f => path.basename(f) === "page.js" && this.isBag(fs.readFileSync(f, "utf8"), 3)).length;
		return this;
	}

	walk(dir, ext = /\.js$/){
		if (!fs.existsSync(dir)) return [];
		const out = [];
		for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
			const p = path.join(dir, e.name);
			if (e.isDirectory()) { if (!FunctionBagCensus.skip.test(e.name)) out.push(...this.walk(p, ext)); }
			else if (ext.test(e.name) && !/\.test\.m?js$/.test(e.name)) out.push(p);
		}
		return out;
	}

	imports(file){
		const src = fs.readFileSync(file, "utf8"), out = [];
		for (const m of src.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g)) {
			const s = m[1];
			let t = s.startsWith("/") ? path.join(FunctionBagCensus.repo, "public", s)
				: s.startsWith(".") ? path.resolve(path.dirname(file), s) : null;
			if (t) out.push(path.normalize(t));
		}
		return out;
	}

	static counts(src){
		const fn = (src.match(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s*\w+|^(?:export\s+)?const\s+\w+\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>|^(?:export\s+)?const\s+\w+\s*=\s*(?:async\s*)?function/gm) ?? []).length;
		const exp = (src.match(/^export\s+(?:default\s+)?(?:async\s+)?function\b|^export\s+const\s+\w+\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>|^export\s+const\s+\w+\s*=\s*(?:async\s*)?function/gm) ?? []).length;
		const hasClass = /^(export\s+(default\s+)?)?class\s+\w+/m.test(src);
		return { fn, exp, hasClass };
	}

	isBag(src, minFn){ const c = FunctionBagCensus.counts(src); return !c.hasClass && c.fn >= minFn; }

	measure(file){
		const name = path.basename(file);
		if (name === "page.js" || !/^[a-z]/.test(name)) return null;
		const src = fs.readFileSync(file, "utf8");
		const { fn, exp, hasClass } = FunctionBagCensus.counts(src);
		if (hasClass) return null;
		if (this.minFn ? fn < this.minFn : exp < 1) return null;
		return {
			file: path.relative(FunctionBagCensus.repo, file).replace(/\\/g, "/"),
			imp: this.importers.get(path.normalize(file))?.size ?? 0,
			fn, exp, lines: src.split("\n").length,
		};
	}

	print(top){
		const shown = top ? this.rows.slice(0, top) : this.rows;
		console.log(`${this.rows.length} lowercase .js files export loose functions and no class (showing ${shown.length}); ${this.pages} page.js files also hold 3+ loose functions.`);
		console.log("  imp  fn exp lines  file");
		for (const r of shown) console.log(`${String(r.imp).padStart(5)} ${String(r.fn).padStart(3)} ${String(r.exp).padStart(3)} ${String(r.lines).padStart(5)}  ${r.file}`);
		const by = {};
		for (const r of this.rows) { const k = r.file.split("/").slice(0, r.file.startsWith("public/framework/") ? 3 : 1).join("/"); by[k] = (by[k] ?? 0) + 1; }
		console.log("\nBy area: " + Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · "));
	}

	json(){ return { at: new Date().toISOString(), roots: this.roots, total: this.rows.length, pages: this.pages, rows: this.rows }; }
}

const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : (process.argv[i + 1] ?? true); };
const census = new FunctionBagCensus(arg("--repo") ? { roots: ["public", "Servex", "Server"], minFn: 0 } : {}).run();
census.print(arg("--all") ? 0 : Number(arg("--top")) || 40);
if (arg("--json")) fs.writeFileSync(arg("--json"), JSON.stringify(census.json(), null, "\t") + "\n");
