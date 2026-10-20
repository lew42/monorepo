// ReadmeOrphans — finds systems the readme chain can't reach: a directory with a readme.md whose nearest
// ancestor readme never names it. Agents read readmes top-down, so such a system is invisible to them.
// The page-nav twin is OrphanCheck.mjs (page.js not in `children:`). Rule: public/framework/ai/doc/context-loss.md.
// Run: node Server/ReadmeOrphans.mjs [--json] — prints one line per orphan: the dir, the readme that should name it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export class ReadmeOrphans {
	static REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
	static ROOTS = ["public/framework", "Servex", "Server"];
	static SKIP = new Set(["node_modules", ".git", "vendor", "legacy", "archive", "salvage", "sessions", "tasks", "projects", "runs", "proof", "logs"]);
	static DATED = /^(\d{4}|\d{4}-\d{2}-\d{2})$/;   // dated folders are history, not systems

	constructor(repo = ReadmeOrphans.REPO){ this.repo = repo; }

	/* Every directory under the roots that holds a readme.md (skipping history and stores). */
	dirs(){
		const out = [], stack = this.constructor.ROOTS.map(r => path.join(this.repo, r));
		while (stack.length){
			const dir = stack.pop();
			let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
			for (const e of entries){
				if (!e.isDirectory() || e.name.startsWith(".") || this.constructor.SKIP.has(e.name) || this.constructor.DATED.test(e.name)) continue;
				const sub = path.join(dir, e.name);
				if (fs.existsSync(path.join(sub, "readme.md"))) out.push(sub);
				stack.push(sub);
			}
		}
		return out.sort();
	}

	/* The nearest readme above `dir`, up to the repo root. */
	parent_readme(dir){
		for (let up = path.dirname(dir); up.startsWith(this.repo); up = path.dirname(up)){
			const f = path.join(up, "readme.md");
			if (fs.existsSync(f)) return f;
			if (up === this.repo) break;
		}
		return null;
	}

	/* Does the readme name this dir: its relative path from the readme, or its name as a link, path segment or code word. */
	names(readme, dir){
		const text = fs.readFileSync(readme, "utf8"), name = path.basename(dir);
		const rel = path.relative(path.dirname(readme), dir).split(path.sep).join("/");
		if (text.includes(rel)) return true;
		const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		return new RegExp(`(^|[/\\[\`(\\s])${esc}(/|\\]|\`|\\)|\\s|$)`, "m").test(text);
	}

	run(){
		const rel = p => path.relative(this.repo, p).split(path.sep).join("/");
		return this.dirs().map(dir => ({ dir, readme: this.parent_readme(dir) }))
			.filter(r => r.readme && !this.names(r.readme, r.dir))
			.map(r => ({ dir: rel(r.dir), readme: rel(r.readme) }));
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const rows = new ReadmeOrphans().run();
	if (process.argv.includes("--json")) console.log(JSON.stringify(rows, null, 2));
	else { for (const r of rows) console.log(`${r.dir}  ← ${r.readme}`); console.log(`${rows.length} system(s) with a readme that the readme above never names`); }
}

export default ReadmeOrphans;
