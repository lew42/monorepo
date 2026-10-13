// Computes catalog.jsonl from the page tree: node public/framework/catalog/build.mjs
// One line per page (kind "page") and per class with a card (kind "class"). Never hand-edited.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");            // public/framework
const repo = path.resolve(root, "../..");
const GROUPS = ["core", "ext", "ux", "ui", "code", "lab", "library", "design", "styles"];
const SKIP = new Set(["doc", "old", "legacy", "sandbox", "node_modules", "screenshots", "salvage"]);
const NEW_AFTER = "2026-10-01";

// first-add date of every page.js, one git pass
const added = {};
for (const line of execSync(`git log --diff-filter=A --name-only --format=@%cs -- public/framework`, { cwd: repo, maxBuffer: 1 << 28 }).toString().split("\n")) {
	if (line.startsWith("@")) var d = line.slice(1);
	else if (line.endsWith("/page.js")) added[line] = d;   // log is newest-first, so the last write is the oldest add
}

const read = f => { try { return fs.readFileSync(f, "utf8"); } catch { return ""; } };
const str = (src, key) => (src.match(new RegExp(/\b/.source + key + /:\s*["'`]([^"'`\n]{1,200})["'`]/.source)) || [])[1];
const dirs = d => fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory() && !SKIP.has(e.name) && !e.name.startsWith("."));

const out = [];
function visit(dir, url, group, depth) {
	const pj = path.join(dir, "page.js");
	if (fs.existsSync(pj)) {
		const src = read(pj), rd = read(path.join(dir, "readme.md"));
		const name = path.basename(dir);
		const title = str(src, "title") || (rd.match(/^#\s+([^—\n]+)/) || [])[1]?.trim() || name;
		const key = path.relative(repo, pj).replaceAll("\\", "/");
		out.push({ kind: "page", group, url, name, title, icon: str(src, "icon") || "", desc: str(src, "description") || (rd.match(/^#\s+[^—\n]+—\s*(.+)/) || [])[1]?.slice(0, 160) || "", added: added[key] || "" , isNew: (added[key] || "") >= NEW_AFTER });
	}
	if (depth < 2) for (const e of dirs(dir)) visit(path.join(dir, e.name), url + e.name + "/", group, depth + 1);
}
for (const g of GROUPS) if (fs.existsSync(path.join(root, g))) for (const e of dirs(path.join(root, g))) visit(path.join(root, g, e.name), `/framework/${g}/${e.name}/`, g, 1);

// class cards: <Name>/<Name>.js holding `class Name`
for (const g of GROUPS) {
	const walk = (dir, url, depth) => {
		if (!fs.existsSync(dir)) return;
		for (const e of dirs(dir)) {
			const f = path.join(dir, e.name, e.name + ".js"), src = read(f);
			const m = src.match(new RegExp(/class\s+/.source + e.name + /\b(?:\s+extends\s+([\w.]+))?/.source));
			if (m) out.push({ kind: "class", group: g, name: e.name, url: `${url}${e.name}/`, extends: m[1] || "", icon: str(src, "static icon") || (src.match(/static icon\s*=\s*["']([\w_]+)["']/) || [])[1] || "data_object", api: /static api\b/.test(src), methods: [...src.matchAll(/^\t(?:static\s+|async\s+)?([a-z]\w*)\s*\([^)]*\)\s*\{/gm)].map(x => x[1]).filter(n => !["if", "for", "while", "switch", "constructor"].includes(n)).slice(0, 6) });
			if (depth < 1) walk(path.join(dir, e.name), `${url}${e.name}/`, depth + 1);
		}
	};
	walk(path.join(root, g), `/framework/${g}/`, 0);
}
fs.writeFileSync(path.join(import.meta.dirname, "catalog.jsonl"), out.map(o => JSON.stringify(o)).join("\n") + "\n");
console.log(out.filter(o => o.kind === "page").length, "pages,", out.filter(o => o.isNew).length, "new,", out.filter(o => o.kind === "class").length, "classes");
