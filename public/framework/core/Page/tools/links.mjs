#!/usr/bin/env node
/**
 * THE LINKS CENSUS — for every page on the site, who points at it.
 *
 *   node public/framework/core/Page/tools/links.mjs              walk public/, write links.json
 *   node public/framework/core/Page/tools/links.mjs stale        prints "stale" or "fresh"
 *   node public/framework/core/Page/tools/links.mjs move A B     rewrite A's links/imports to B (manual, no directory move)
 *
 * WHY HERE, NOT beside `importance.mjs`: `importance.mjs` is `imagine/importance`'s OWN data
 * tool — it never runs outside that one feature. This census is a **core/Page** concern: it
 * walks every page on the site, real or made, and `Server/plugins/SocketServer/Runtime.js`
 * imports it directly (both are plain Node, no DOM). `tools/` sits beside `generator/` — the
 * generator MAKES a page, this MEASURES the ones that exist.
 *
 * WHAT A "PAGE" IS, for this file: a directory with a `page.js` (a **real** page) or a
 * `page.json` (a **made** page — `public/imagine/paging/made/**`). Its url is the directory
 * path under `public/`, always with a leading AND a trailing slash (`/a/b/`) — the same shape
 * `Page.url` uses everywhere else.
 *
 * WHAT COUNTS AS A REFERENCE — four literal string shapes, exactly what the owner asked for,
 * nothing inferred: `href="/x/"`, a markdown link `](/x/)`, a `url: "/x/"` field (Make's
 * `rail.js`-style nav data), and `import … from "/x/…"` (plus a bare `import "/x/…"` and a
 * dynamic `import("/x/…")`). Only SITE-ABSOLUTE strings (leading `/`, not `//host/...`) are
 * tracked — a relative import (`"../sibling.js"`) is invisible to a static search like this
 * one and is a known gap: doc/decisions.md says why it is usually safe to leave (a directory
 * that moves as a WHOLE keeps its own internal relative imports working; only one reaching
 * OUTSIDE the moved directory, with a depth that changes, can break, and that is rare here).
 *
 * A LINK must match a known page url EXACTLY (its own href points AT the page). An IMPORT is
 * matched by the LONGEST known page url that is a PREFIX of it (an import reaches a FILE
 * inside a page's directory, e.g. `/framework/ux/Tree/Tree.js` inside page `/framework/ux/`),
 * so moving that page's directory has to rewrite it too — the file physically moves with it.
 *
 * ⚠ THE BOUNDARY CHECK the owner asked for ("`/a/b/` must never match `/a/bc/`") is not a
 *   regex — it falls out for free from always matching the url WITH its trailing slash. A
 *   trailing slash is a character `/a/bc/` does not have at the position `/a/b/` would need
 *   it (the very next character there is `c`), so a plain substring search is already safe.
 *   Same for the leading slash: no page url is ever compared without its own leading `/`.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// ════ WHERE ═══════════════════════════════════════════════════════════════════
const HERE = path.dirname(fileURLToPath(import.meta.url));           // .../core/Page/tools
const PUBLIC = path.resolve(HERE, "../../../..");                    // tools → Page → core → framework → public
const ROOT = path.resolve(PUBLIC, "..");                             // the repo root — links.json paths are relative to here

// A wrong constant above must fail LOUD, not write a census of nothing.
if (path.basename(PUBLIC) !== "public" || !fs.existsSync(path.join(PUBLIC, "framework")))
	throw new Error(`links.mjs resolved PUBLIC as "${PUBLIC}" — that is not this site's public/ dir. The file moved and this constant did not follow.`);

const LINKS_JSON = path.join(PUBLIC, "links.json");

// Skipped everywhere — never walked for pages, never scanned for references. Exactly the
// brief's list: the AI daily log (huge, and full of its own path prose), node_modules (none
// under public/ today, checked either way), the five personal dirs, and core's two dead trees.
const SKIP_TOP = new Set(["alex", "arya", "castin", "michael", "edric"]);
const SKIP_PREFIXES = ["framework/ai", "framework/core/new", "framework/core/legacy"];

function skip(rel){                                     // rel: posix, relative to PUBLIC, no leading slash
	const first = rel.split("/")[0];
	if (SKIP_TOP.has(first)) return true;
	if (rel.split("/").includes("node_modules")) return true;
	return SKIP_PREFIXES.some(p => rel === p || rel.startsWith(p + "/"));
}

function walk(dir, onFile){
	for (const ent of fs.readdirSync(dir, { withFileTypes: true })){
		const full = path.join(dir, ent.name);
		const rel = path.relative(PUBLIC, full).split(path.sep).join("/");
		if (skip(rel)) continue;
		if (ent.isDirectory()) walk(full, onFile);
		else onFile(full, rel);
	}
}

const url_for = dir => {
	const rel = path.relative(PUBLIC, dir).split(path.sep).join("/");
	return rel ? "/" + rel + "/" : "/";
};

const repo_rel = full => path.relative(ROOT, full).split(path.sep).join("/");


// ════ PHASE 1 — WHAT PAGES EXIST ════════════════════════════════════════════════
/* One pass, cheap: every directory holding a `page.js` (real) or a `page.json` (made)
   becomes a known page url. `prefix_list` is the same urls, LONGEST first, so an import's
   prefix match picks the deepest page that owns the file — its own directory, not some
   distant ancestor's. */
function find_pages(){
	const pages = new Map();                             // url -> { dir, real, made }

	walk(PUBLIC, (full, rel) => {
		const base = path.basename(full);
		if (base !== "page.js" && base !== "page.json") return;

		const dir = path.dirname(full);
		const url = url_for(dir);
		const entry = pages.get(url) ?? { url, dir, real: false, made: false };
		entry[base === "page.js" ? "real" : "made"] = true;
		pages.set(url, entry);
	});

	return pages;
}


// ════ PHASE 2 — WHO REFERENCES THEM ═════════════════════════════════════════════
const SCAN_EXT = new Set([".js", ".mjs", ".md", ".json", ".html"]);

// { kind, exact, re } — `exact` means "the captured string must equal a known page url"
// (a link), and its absence means "the LONGEST known page url that PREFIXES it" (an import).
const PATTERNS = [
	{ kind: "links",   exact: true,  re: /\bhref\s*=\s*["']([^"']+)["']/g },
	{ kind: "links",   exact: true,  re: /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g },
	{ kind: "links",   exact: true,  re: /\burl\s*:\s*["']([^"']+)["']/g },
	{ kind: "imports", exact: false, re: /\bfrom\s*["']([^"']+)["']/g },
	{ kind: "imports", exact: false, re: /\bimport\s*["']([^"']+)["']\s*;/g },
	{ kind: "imports", exact: false, re: /\bimport\(\s*["']([^"']+)["']/g },
];

function strip_suffix(raw){                              // "/x/?tab=a#y" -> "/x/"
	const cut = raw.search(/[?#]/);
	return cut === -1 ? raw : raw.slice(0, cut);
}

function match_link(raw, pages){
	let target = strip_suffix(raw);
	if (!target.endsWith("/")) target += "/";
	return pages.has(target) ? target : null;
}

function match_import(raw, ordered_urls){
	const target = strip_suffix(raw);
	for (const url of ordered_urls) if (target.startsWith(url)) return url;
	return null;
}

/* One file, every match, attributed to a page url. A line is read at most once per pattern
   (regex.matchAll clones the regex per call, so reusing the same global RegExp object across
   many lines is safe — nothing shares lastIndex). */
function scan_file(content, pages, ordered_urls){
	const found = [];                                     // { kind, url, line }

	content.split("\n").forEach((line, i) => {
		for (const { kind, exact, re } of PATTERNS){
			for (const m of line.matchAll(re)){
				const raw = m[1];
				if (!raw || raw[0] !== "/" || raw[1] === "/") continue;   // site-absolute only, never "//host/..."

				const url = exact ? match_link(raw, pages) : match_import(raw, ordered_urls);
				if (url) found.push({ kind, url, line: i + 1 });
			}
		}
	});

	return found;
}


// ════ THE CENSUS ITSELF ══════════════════════════════════════════════════════════
/** Walks `public/`, writes `links.json`, and — for every MADE page the walk found a
 *  reference to — writes the same data into that page's OWN `page.json`, under
 *  `linked_from`. Never touches a real page's directory (it has no `page.json` to write). */
export function census(){
	const started = Date.now();

	const pages = find_pages();
	const ordered_urls = [...pages.keys()].sort((a, b) => b.length - a.length);   // longest first

	const data = {};                                       // url -> { links: [...], imports: [...] }
	let files_scanned = 0, links = 0, imports = 0;

	walk(PUBLIC, (full, rel) => {
		if (!SCAN_EXT.has(path.extname(full))) return;
		files_scanned++;

		const content = fs.readFileSync(full, "utf8");
		const here = repo_rel(full);

		for (const { kind, url, line } of scan_file(content, pages, ordered_urls)){
			(data[url] ??= { links: [], imports: [] })[kind].push(`${here}:${line}`);
			kind === "links" ? links++ : imports++;
		}
	});

	// Sorted, so two runs over an unchanged site produce byte-identical output — that is
	// what "idempotent" has to mean for a generated file a diff will be read against.
	const sorted = {};
	for (const url of Object.keys(data).sort()){
		sorted[url] = { links: data[url].links.sort(), imports: data[url].imports.sort() };
	}

	fs.writeFileSync(LINKS_JSON, JSON.stringify(sorted, null, "\t") + "\n");

	const made_touched = stamp_made_pages(pages, sorted);
	const seconds = (Date.now() - started) / 1000;

	const line = `${files_scanned} files scanned, ${pages.size} pages `
		+ `(${[...pages.values()].filter(p => p.real).length} real + ${[...pages.values()].filter(p => p.made).length} made), `
		+ `${links} links, ${imports} imports, ${made_touched} page.json linked_from written, in ${seconds}s`;

	return { pages: pages.size, links, imports, files_scanned, made_touched, seconds, line, data: sorted };
}

/* `linked_from` lives on the MADE page's own `page.json` because that is the page.json
   system the owner named — a made page already carries its own meta, this is one more field
   of it. A real page has no page.json and none is invented for it (the brief's own line). */
function stamp_made_pages(pages, data){
	let touched = 0;

	for (const page of pages.values()){
		if (!page.made) continue;

		const file = path.join(page.dir, "page.json");
		const json = JSON.parse(fs.readFileSync(file, "utf8"));
		const found = data[page.url];

		const next = found ? { links: found.links, imports: found.imports } : null;
		const before = JSON.stringify(json.linked_from ?? null);       // normalize both sides the same way

		if (JSON.stringify(next) === before) continue;                 // unchanged — no write, no mtime bump

		if (next) json.linked_from = next; else delete json.linked_from;

		fs.writeFileSync(file, JSON.stringify(json, null, "\t") + "\n");
		touched++;
	}

	return touched;
}


// ════ STALENESS — "the census is older than the newest page.js" ════════════════
function newest_page_js_mtime(){
	let newest = 0;
	walk(PUBLIC, (full) => {
		if (path.basename(full) === "page.js") newest = Math.max(newest, fs.statSync(full).mtimeMs);
	});
	return newest;
}

export function is_stale(){
	if (!fs.existsSync(LINKS_JSON)) return true;
	return fs.statSync(LINKS_JSON).mtimeMs < newest_page_js_mtime();
}

/** Regenerates ONLY if stale (or missing). Returns the fresh summary when it ran, else
 *  `null` — callers that just need the DATA should still call `read()` either way. */
export function ensure_fresh(){
	return is_stale() ? census() : null;
}

export function read(){
	return JSON.parse(fs.readFileSync(LINKS_JSON, "utf8"));
}


// ════ THE REWRITE — moving `from` to `to` ═══════════════════════════════════════
/* Read this BEFORE the directory is renamed on disk — every file it touches, `from` itself
   included, still has to be at the path the census says it is at. `Runtime.js` calls this,
   THEN renames the directory: a self-referencing file inside the moved page (importing one
   of its own siblings by absolute path) gets its text corrected first, and the correction
   travels with it when the directory moves — no separate "fix the path that just moved"
   step is needed, because nothing moved yet when the text was fixed. */
export function rewrite_links(from, to){
	ensure_fresh();
	const data = read();

	const matches = Object.keys(data).filter(url => url.startsWith(from));   // `from` itself, and any nested page under it
	let count = 0;
	const files = new Set();

	for (const old_key of matches){
		const new_key = to + old_key.slice(from.length);

		for (const kind of ["links", "imports"]){
			for (const loc of data[old_key][kind]){
				const sep = loc.lastIndexOf(":");
				const file = loc.slice(0, sep), line_no = Number(loc.slice(sep + 1));
				const done = replace_on_line(file, line_no, old_key, new_key);
				if (done){ count += done; files.add(file); }
			}
		}
	}

	return { count, files: files.size };
}

/** One line of one file: every occurrence of `old_str` becomes `new_str`. Returns how many
 *  it replaced (0 if the line had drifted since the census was taken — logged, not thrown,
 *  because a stale single line is not a reason to fail the whole move). */
function replace_on_line(repo_relative_file, line_no, old_str, new_str){
	const full = path.join(ROOT, repo_relative_file);
	if (!fs.existsSync(full)) { console.warn(`links: ${repo_relative_file} no longer exists — skipped`); return 0; }

	const lines = fs.readFileSync(full, "utf8").split("\n");
	const line = lines[line_no - 1];
	if (line === undefined || !line.includes(old_str)) return 0;

	const count = line.split(old_str).length - 1;
	lines[line_no - 1] = line.split(old_str).join(new_str);
	fs.writeFileSync(full, lines.join("\n"));
	return count;
}


// ════ CLI ═══════════════════════════════════════════════════════════════════════
/* Also runnable BY HAND — the owner's own words were "the AI or some node function", and a
   move made outside Make (a manual `mv`, a script) can call this the same way Runtime.js
   does: `node links.mjs move /old/ /new/`. */
export async function run(argv){
	const [cmd, a, b] = argv;

	if (!cmd || cmd === "census") return census().line;
	if (cmd === "stale") return is_stale() ? "stale" : "fresh";
	if (cmd === "move"){
		if (!a || !b) throw new Error("move needs two urls: node links.mjs move /old/ /new/");
		const { count, files } = rewrite_links(a, b);
		return `${count} links in ${files} files rewritten, ${a} → ${b} (the directory itself was NOT moved — this is the text-only half)`;
	}
	throw new Error(`"${cmd}" is not a command — try: census, stale, move <from> <to>`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url){
	run(process.argv.slice(2))
		.then(out => console.log(out))
		.catch(e => { console.error(String(e.message || e)); process.exit(1); });
}
