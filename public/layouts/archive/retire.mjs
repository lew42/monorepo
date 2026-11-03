// retire.mjs: move retired layout pages under layouts/archive/ by `git mv`, never delete.
// The keep list and why: /framework/core/Page/navigation/model/ ("The layouts that survive").
//   node public/layouts/archive/retire.mjs --plan    print every retired page: inbound links, outside imports, movable or not
//   node public/layouts/archive/retire.mjs --apply   move only the movable ones (nothing links to them, no import leaves the folder)
//   node public/layouts/archive/retire.mjs --undo    move everything in manifest.json back
// A moved page is dropped from its parent's `children:` and declared by archive/page.js, so it stays reachable.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";

const HERE = dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1"));
const LAYOUTS = resolve(HERE, "..");
const PUBLIC = resolve(LAYOUTS, "..");
const REPO = resolve(PUBLIC, "..");
const MANIFEST = join(HERE, "manifest.json");

// Retired: variations of the four kinds the model keeps. Paths are under public/layouts/.
const RETIRE = [
	"explorer", "labs/blogx", "labs/decks", "labs/mag", "labs/screens", "labs/sections", "labs/trees",
	"labs/shells/right", "labs/shells/foot", "labs/shells/head-foot", "labs/shells/rail-foot",
	"labs/shells/canvas", "labs/shells/inner-rail", "labs/shells/inner-bar", "labs/shells/columns",
	"shell/home",
];

const walk = (dir, out = []) => {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
	}
	return out;
};
const pages = dir => walk(dir).filter(f => f.endsWith(sep + "page.js")).length;
const posix = p => p.split(sep).join("/");

// Every text file the site serves, minus the AI logs (sessions quote urls by the thousand).
const SOURCES = walk(PUBLIC).filter(f => /\.(js|md|html|css)$/.test(f) && !posix(f).includes("/framework/ai/") && !posix(f).includes("/layouts/archive/"));

function inbound(path){
	const own = join(LAYOUTS, path);
	const url = new RegExp(`/layouts/${path.replace(/[/-]/g, m => "\\" + m)}/`);
	return SOURCES.filter(f => !f.startsWith(own + sep) && url.test(readFileSync(f, "utf8"))).map(f => posix(relative(REPO, f)));
}

// A relative import that resolves outside the folder breaks the moment the folder moves.
function outside_imports(path){
	const own = join(LAYOUTS, path);
	const bad = [];
	for (const f of walk(own).filter(f => f.endsWith(".js") || f.endsWith(".css"))) {
		for (const [, spec] of readFileSync(f, "utf8").matchAll(/(?:from|import\(|stylesheet\(import\.meta,|url\()\s*["']?(\.\.?\/[^"')\s]+)/g)) {
			if (!resolve(dirname(f), spec).startsWith(own)) bad.push(`${posix(relative(REPO, f))} -> ${spec}`);
		}
	}
	return bad;
}

const slug = path => path.replace(/\//g, "-");

function set_children(page_js, edit){
	const text = readFileSync(page_js, "utf8");
	const next = text.replace(/children:\s*"([^"]*)"/, (m, list) => `children: "${edit(list.split(/\s+/).filter(Boolean)).join(" ")}"`);
	if (next === text) throw new Error(`no children: string in ${page_js}`);
	writeFileSync(page_js, next);
}

function archive_page(names){
	writeFileSync(join(HERE, "page.js"), `import { Page, md } from "/app.js";

// Retired layout pages, moved here by retire.mjs (git mv, manifest.json). Why: /framework/core/Page/navigation/model/
export default new Page({
	meta: import.meta,
	title: "Archive",
	description: "Layout pages retired by the navigation model: kept, reachable, no longer part of the set.",
	icon: "inventory_2",
	children: "${names.join(" ")}",

	content(){
		md("These layouts are variations of the four kinds the [navigation model](/framework/core/Page/navigation/model/) keeps. They were moved here, not deleted; \`retire.mjs --undo\` puts them back.");
		this.previews();
	},
});
`);
}

const git = (...args) => execFileSync("git", args, { cwd: REPO, windowsHide: true, stdio: "pipe" }).toString();
const mode = process.argv[2] ?? "--plan";
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : [];

if (mode === "--undo") {
	for (const m of manifest.reverse()) {
		git("mv", m.to, m.from);
		set_children(join(REPO, dirname(m.from), "page.js"), list => [...list, m.name]);
		console.log(`back  ${m.to} -> ${m.from}`);
	}
	writeFileSync(MANIFEST, "[]\n");
	archive_page([]);
	process.exit(0);
}

const rows = RETIRE.filter(p => existsSync(join(LAYOUTS, p))).map(path => {
	const links = inbound(path), imports = outside_imports(path);
	return { path, pages: pages(join(LAYOUTS, path)), links, imports, movable: !links.length && !imports.length };
});

const total = pages(LAYOUTS) - (existsSync(HERE) ? pages(HERE) : 0);
const retired = rows.reduce((n, r) => n + r.pages, 0);
for (const r of rows) {
	console.log(`${r.movable ? "MOVE " : "stay "} ${r.path.padEnd(24)} ${String(r.pages).padStart(2)} pages  ${r.links.length} links in  ${r.imports.length} outside imports`);
	for (const l of r.links.slice(0, 3)) console.log(`         linked from ${l}`);
	for (const i of r.imports.slice(0, 2)) console.log(`         imports ${i}`);
}
console.log(`\nlayout pages now: ${total}; retired: ${retired}; kept: ${total - retired}; movable now: ${rows.filter(r => r.movable).length} of ${rows.length} folders`);

if (mode === "--apply") {
	for (const r of rows.filter(r => r.movable)) {
		const from = posix(relative(REPO, join(LAYOUTS, r.path)));
		const to = posix(relative(REPO, join(HERE, slug(r.path))));
		const name = r.path.split("/").at(-1);
		git("mv", from, to);
		set_children(join(LAYOUTS, dirname(r.path), "page.js"), list => list.filter(n => n !== name));
		manifest.push({ from, to, name, at: new Date().toISOString() });
		console.log(`moved ${from} -> ${to}`);
	}
	writeFileSync(MANIFEST, JSON.stringify(manifest, null, "\t") + "\n");
	archive_page(manifest.map(m => m.to.split("/").at(-1)));
}
