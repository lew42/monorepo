import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* PageNav: the quick version of a page (what a link or a preview card needs), read from TEXT.
 * Node can't import a page.js (it needs the DOM), so the fields come from, in order:
 *   1. page.jsonl: plain top-level title / icon / description keys, the latest wins;
 *   2. page.js: literal  title: "…"  /  icon: "…"  /  description: "…"  string literals;
 *   3. readme.md: the heading  "# Title — description".
 * Each field takes the first source that has it. A key is present only when found.
 *   PageNav.of(dir)  ->  { title?, icon?, description? }
 *   PageNav.same(a, b)
 * CLI: node Server/PageNav.mjs [dir]           dry run: what would be written
 *      node Server/PageNav.mjs [dir] --apply   append nav to the files.jsonl lines (PageFiles.backfill_nav)
 * (core/Page/doc/index-jsonl.md) */

const KEYS = ["title", "icon", "description"];
const LITERAL = key => new RegExp(`(?:^|[\\s,{])${key}\\s*:\\s*("(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*')`, "m");

const text = file => { try { return fs.readFileSync(file, "utf8"); } catch { return null; } };

export default class PageNav {

	static KEYS = KEYS;

	static of(dir){
		const nav = {};
		const take = from => { for (const key of KEYS) if (nav[key] === undefined && typeof from[key] === "string" && from[key]) nav[key] = from[key]; };
		take(this.from_jsonl(text(path.join(dir, "page.jsonl"))));
		take(this.from_js(text(path.join(dir, "page.js"))));
		take(this.from_readme(text(path.join(dir, "readme.md"))));
		return nav;
	}

	// Plain top-level keys of every line; the latest value of each key wins. Lines that are file lines or verbs have none of these keys.
	static from_jsonl(src){
		const out = {};
		for (const line of src?.split("\n") ?? []){
			if (!line.trim().startsWith("{")) continue;
			let obj; try { obj = JSON.parse(line); } catch { continue; }
			if (!obj || typeof obj.file === "string") continue;
			for (const key of KEYS) if (typeof obj[key] === "string") out[key] = obj[key];
		}
		return out;
	}

	static from_js(src){
		const out = {};
		if (!src) return out;
		for (const key of KEYS){
			const hit = src.match(LITERAL(key))?.[1];
			if (!hit) continue;
			try { out[key] = hit[0] === '"' ? JSON.parse(hit) : hit.slice(1, -1).replace(/\\(.)/g, "$1"); } catch {}
		}
		return out;
	}

	static from_readme(src){
		const heading = src?.match(/^#\s+(.+)$/m)?.[1]?.trim();
		if (!heading) return {};
		const [title, ...rest] = heading.split(/\s+[—–]\s+/);
		const out = { title: title.replace(/[`*_]/g, "").trim() };
		const description = rest.join(" — ").replace(/[`*_]/g, "").trim();
		if (description) out.description = description;
		return out;
	}

	static same(a, b){ return KEYS.every(key => (a?.[key] ?? "") === (b?.[key] ?? "")); }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])){
	const args = process.argv.slice(2), apply = args.includes("--apply");
	const dir = path.resolve(args.find(a => !a.startsWith("--")) ?? "public");
	const { default: PageFiles } = await import("./plugins/PageFiles.js");
	const files = Object.create(PageFiles.prototype);
	files.pending = new Map();
	const count = files.backfill_nav(dir, apply);
	console.log(`${apply ? "wrote" : "would write"} ${count} nav lines under ${dir}`);
}
