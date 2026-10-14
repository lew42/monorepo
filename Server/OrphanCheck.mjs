// OrphanCheck — finds pages the site nav can't reach: a directory with a page.js whose
// parent page does not name it in `children:`. Nav is declared, never crawled, so such a
// page works at its URL but is invisible. Run: node Server/OrphanCheck.mjs [--json] [dir...]
// merge.mjs calls OrphanCheck.warn(changedFiles) as a warning, not a failure.
// Doc: public/framework/core/Page/doc/indexing-2026-10-08.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "framework");
const SKIP = new Set(["node_modules", "vendor", "legacy", "archive", ".git"]);
const DATED = /^\d{4}-\d{2}-\d{2}$/;   // ai/<date>/ task dirs are history, not nav

export class OrphanCheck {
	constructor(root = ROOT){ this.root = root; this.names = new Map(); }

	// The names a parent's page.js declares: every word of its `children: "…"` string(s)
	// (spaces or commas; "kid/page.jsonl" → kid), plus quoted words of an array form.
	declared(dir){
		if (this.names.has(dir)) return this.names.get(dir);
		const set = new Set();
		const file = path.join(dir, "page.js");
		if (fs.existsSync(file)){
			const src = fs.readFileSync(file, "utf8");
			for (const m of src.matchAll(/children\s*:\s*(`[^`]*`|"[^"]*"|'[^']*'|\[[^\]]*\])/g))
				for (const w of m[1].replace(/^[`"'\[]|[`"'\]]$/g, "").split(/[\s,"'`\[\]]+/)) if (w) set.add(w.split("/")[0]);
		}
		for (const j of ["page.jsonl"]){
			const f = path.join(dir, j);
			if (!fs.existsSync(f)) continue;
			for (const l of fs.readFileSync(f, "utf8").split("\n")) {
				const m = l.match(/"(?:file|tab|child)"\s*:\s*"([^"/]+)\/?/) ?? l.match(/"name"\s*:\s*"([^"]+)"/);
				if (m) set.add(m[1]);
			}
		}
		this.names.set(dir, set);
		return set;
	}

	// Every directory under `start` with a page.js that its parent page doesn't name.
	scan(start = this.root, out = []){
		for (const e of fs.readdirSync(start, { withFileTypes: true })){
			if (!e.isDirectory() || SKIP.has(e.name) || e.name.startsWith(".") || DATED.test(e.name)) continue;
			const dir = path.join(start, e.name);
			if (fs.existsSync(path.join(dir, "page.js")) && fs.existsSync(path.join(start, "page.js")) && !this.declared(start).has(e.name))
				out.push(path.relative(this.root, dir).replaceAll("\\", "/"));
			this.scan(dir, out);
		}
		return out;
	}

	// Orphans grouped by their parent module: { "ext": ["ext/Figma", …] }.
	group(orphans = this.scan()){
		const by = {};
		for (const o of orphans) (by[o.includes("/") ? o.slice(0, o.lastIndexOf("/")) : "."] ??= []).push(o);
		return by;
	}

	report(orphans = this.scan()){
		const by = this.group(orphans);
		const lines = [`orphan pages: ${orphans.length} in ${Object.keys(by).length} modules`];
		for (const [mod, list] of Object.entries(by).sort((a, b) => b[1].length - a[1].length))
			lines.push(`  ${mod} (${list.length}): ${list.map(p => p.split("/").pop()).join(" ")}`);
		return lines.join("\n");
	}

	// Gate form: only orphans whose directory a change touched, one warning line each.
	static warn(changed, root = ROOT){
		const prefix = "public/framework/";
		const touched = new Set(changed.filter(f => f.startsWith(prefix)).map(f => f.slice(prefix.length)));
		const hits = new OrphanCheck(root).scan().filter(o => [...touched].some(t => t.startsWith(o + "/") || t === o));
		return hits.map(o => `warning: ${o} has a page.js but its parent does not name it in children: — it is unreachable from the nav`);
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const oc = new OrphanCheck();
	const found = oc.scan();
	console.log(process.argv.includes("--json") ? JSON.stringify(oc.group(found), null, 1) : oc.report(found));
}
