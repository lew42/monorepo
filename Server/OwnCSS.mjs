// node Server/OwnCSS.mjs --census [--top N] [--json]   every page's own CSS, most first (report only)
// node Server/OwnCSS.mjs --diff <base> <branch>        the files a branch grows own CSS in; exit 1 if any
//
// A page should build from the kit (framework.css, styles/, ui/, and the core/ext/ux classes), not
// add CSS of its own (the owner's ui-kit plan, step 5: /live/plan/ui-kit/). "Own CSS" is a CSS
// declaration (`prop: value`) in a .css file outside the kit, or inside a css(`…`) literal in a .js
// file outside it; a page.js or page.css counts wherever it sits. merge.mjs runs --diff and refuses
// a branch that adds declarations, unless --own-css "why" (logged in the merge output).
// Detail: Server/doc/own-css.md
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export default class OwnCSS {
	static KIT = ["public/framework/framework.css", "public/framework/styles/", "public/framework/ui/",
		"public/framework/core/", "public/framework/ext/", "public/framework/ux/"];
	static SKIP = /(^|\/)(node_modules|archive|shots|sessions)\//;

	/* Is this repo path part of the kit (allowed to hold CSS)? A page's own file never is. */
	static is_kit(f){
		if (/(^|\/)page\.(js|css)$/.test(f)) return false;
		return this.KIT.some(k => f === k || f.startsWith(k));
	}

	/* Does this repo path count at all: a .css, or a .js that could hold a css(`…`) literal, under public/? */
	static counts(f){
		return f.startsWith("public/") && /\.(css|js|mjs)$/.test(f) && !this.SKIP.test(f) && !this.is_kit(f);
	}

	/* The number of declarations in a file's text. */
	static count(text, f){
		if (/\.css$/.test(f)) return this.declarations(text);
		let n = 0;
		for (const m of text.matchAll(/\bcss\(\s*`([^`]*)`/g)) n += this.declarations(m[1]);
		return n;
	}

	/* `prop: value` pairs that end in ; or } — a selector (`a:hover {`) ends in { and never matches. */
	static declarations(css){
		const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
		return [...bare.matchAll(/(?:^|[{;])\s*-{0,2}[a-zA-Z][\w-]*\s*:\s*[^;{}]+(?=[;}])/g)].length;
	}

	constructor(repo = process.cwd()){ this.repo = repo; }

	git(...args){ return spawnSync("git", args, { cwd: this.repo, encoding: "utf8", maxBuffer: 1 << 28 }).stdout ?? ""; }

	/* Every page folder's own CSS: [{dir, files, declarations}], most first. Reads the files on disk. */
	census(){
		const by = new Map();
		for (const f of this.git("ls-files", "public").split("\n").filter(f => f && this.constructor.counts(f))) {
			let n = 0;
			try { n = this.constructor.count(fs.readFileSync(path.join(this.repo, f), "utf8"), f); } catch { continue; }
			if (!n) continue;
			const dir = path.posix.dirname(f), row = by.get(dir) ?? { dir, files: 0, declarations: 0 };
			row.files++; row.declarations += n; by.set(dir, row);
		}
		return [...by.values()].sort((a, b) => b.declarations - a.declarations);
	}

	/* The files <head> grows own CSS in against <base>: [{file, before, after}]. */
	added(base, head){
		const files = this.git("diff", "--name-only", "--no-renames", "--diff-filter=AM", `${base}...${head}`).split("\n").filter(f => f && this.constructor.counts(f));
		const mb = this.git("merge-base", base, head).trim();
		const at = (rev, f) => { const r = spawnSync("git", ["show", `${rev}:${f}`], { cwd: this.repo, encoding: "utf8", maxBuffer: 1 << 26 }); return r.status === 0 ? r.stdout : ""; };
		return files.map(file => ({ file, before: this.constructor.count(at(mb, file), file), after: this.constructor.count(at(head, file), file) }))
			.filter(r => r.after > r.before);
	}

	/* The merge refusal for added(), or null. */
	static refusal(rows){
		if (!rows.length) return null;
		return `${rows.length} file(s) add CSS of their own instead of using the kit (Server/doc/own-css.md):\n`
			+ rows.map(r => `  ${r.file}: ${r.before} → ${r.after} declaration(s)`).join("\n")
			+ `\nUse a kit class (framework.css, ui/), move the rule into the kit, or merge anyway with --own-css "why".`;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1"))) {
	const argv = process.argv.slice(2), own = new OwnCSS();
	if (argv[0] === "--diff") {
		const rows = own.added(argv[1], argv[2]), why = OwnCSS.refusal(rows);
		console.log(why ?? `OwnCSS: ${argv[2]} adds no CSS of its own.`);
		process.exit(why ? 1 : 0);
	}
	const rows = own.census(), top = Number(argv[argv.indexOf("--top") + 1]) || 30;
	if (argv.includes("--json")) console.log(JSON.stringify(rows));
	else {
		const total = rows.reduce((s, r) => s + r.declarations, 0);
		console.log(`OwnCSS census: ${total} declaration(s) in ${rows.length} folder(s) outside the kit; top ${Math.min(top, rows.length)}:`);
		for (const r of rows.slice(0, top)) console.log(`  ${String(r.declarations).padStart(5)}  ${r.dir}  (${r.files} file${r.files > 1 ? "s" : ""})`);
	}
}
