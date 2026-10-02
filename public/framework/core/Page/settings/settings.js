// page_settings(page_url) — this page's own settings, read without loading the page: {
//   nav: true|false    "does this page appear in its parent's navigation?"
//   tab: true|false|undefined   "does this page join a DETECTED tab bar?" (added 2026-10-01,
//                        ai/overview.js's detect_tabs() — undefined means the line was never set)
//   weight: number       orders a detected tab, ascending (default 1; only means anything when tab is true)
// }
//
// A page.js folder's settings live in a sibling `settings.jsonl`, NEVER `page.jsonl` — the
// same rule `weight.jsonl` already uses (core/Page/weight/weight.js, doc/design.md): a
// `page.jsonl` subscribes the folder to the dev server's file watcher, which is not this
// file's job to cause. A real page.jsonl PAGE has nowhere else for its settings lines to
// live, so it keeps using its own page.jsonl. This tries settings.jsonl FIRST and falls
// back to page.jsonl, exactly like weight.js tries weight.jsonl first.
//
// `nav` defaults to true. The one exception, the owner's own rule (loading-study.md
// section 4): when NOTHING ever set `nav` either way, a page whose weight
// (core/Page/weight/weight.js) is below 1 is out of nav too.
//
// Fails soft, the same guard Log.js and weight.js use: no log at all, a network error, or
// the SPA's index.html-as-404 (content-type is the tell) all answer `{ nav: true }` — the
// "brand new page, nobody has ever touched its settings" answer.
//
// ⚠ 2026-09-29 fix round, finding 4: this used to fetch settings.jsonl, page.jsonl (as a
// fallback) and then weight.jsonl and page.jsonl AGAIN inside weight() — four probes, none
// of which exist for most pages, so the console filled with 404s just from opening the
// drawer's Settings tab. `has_file()` below checks the dev server's own file list
// (`/directory.json`, the same tree `ext/files/fs.js` and `core/Page/Markdown.js` already
// read — no new server route) BEFORE fetching, so a page with none of these three files
// costs one shared, cached lookup and zero real requests. Off the dev server (production,
// no `/directory.json` at all) `has_file()` answers `undefined` — "can't know" — and this
// falls back to fetching blind, exactly as it always did; that half never changed.
//
// ⚠ Reads `/directory.json` itself, the same shape `core/Page/Markdown.js`'s own
// `tree()`/`node()` walk — NOT by importing that file. This module is reachable from
// `core/Page/Log.js` (`tab_visible()`/`nav_ready()`, below Log.js's own import), and
// `Page.class.js extends PageLog` (Log.js): importing `Markdown.js`, which imports
// `Page.class.js`, would close a cycle back through the very class still being defined
// — `Page.class.js → Log.js → settings.js → Markdown.js → Page.class.js` — and threw
// "Cannot access 'Page' before initialization" on every single page, sitewide, the one
// time this was tried (2026-09-29). A dozen lines duplicated here is cheaper than that.

import { weight } from "../weight/weight.js";

let tree;
function directory_tree(){
	return tree ??= fetch("/directory.json").then(res => res.ok ? res.json() : null).catch(() => null);
}

async function fetch_lines(url){
	const res = await fetch(url).catch(() => null);
	if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
	return (await res.text()).split("\n");
}

// Is `name` a real FILE right beside `page_url`, according to the tree the dev server
// already keeps? `undefined` means "no tree at all" (production) — the caller can't know,
// and falls back to trying the fetch, same as before this fix.
async function has_file(page_url, name){
	const data = await directory_tree();
	if (!data) return undefined;

	let node = { children: data.files };
	for (const part of page_url.split("/").filter(Boolean)){
		node = node.children?.find(child => child.name === part);
		if (!node) return false;
	}
	return !!node.children?.some(child => child.type === "file" && child.name === name);
}

// weight.js's own math (`1 + distinct referenced_by + the latest manual weight`), run
// over lines already fetched — used ONLY when `has_file()` already told us weight.jsonl
// does not exist, so weight() itself would just re-fetch this same page.jsonl a second
// time after probing weight.jsonl blind first. `tab_visible()` (core/Page/Log.js) now
// asks this for every child of every tab strip, sitewide — without this, that turned
// "does nobody have a weight?" into a 404 on nearly every page load, the exact blind
// probe finding 4 exists to remove.
function weight_of(lines){
	let refs = 0, manual = 0;
	const seen = new Set();

	for (const line of lines ?? []){
		if (!line.trim()) continue;
		let obj;
		try { obj = JSON.parse(line); } catch { continue; }

		if (typeof obj.referenced_by === "string" && !seen.has(obj.referenced_by)){ seen.add(obj.referenced_by); refs++; }
		if (typeof obj.weight === "number") manual = obj.weight;
	}

	return 1 + refs + manual;
}

// Reads the three settings keys this module knows off of one already-fetched line, the
// latest-line-wins rule every one of them follows (a settings line is a "set").
function read_settings_line(obj, out){
	if (typeof obj.settings?.nav === "boolean") out.nav = obj.settings.nav;
	if (typeof obj.settings?.tab === "boolean") out.tab = obj.settings.tab;
	if (typeof obj.settings?.weight === "number") out.weight = obj.settings.weight;
}

export async function page_settings(page_url){
	const out = { nav: undefined, tab: undefined, weight: 1 };

	const settings_here = await has_file(page_url, "settings.jsonl");
	const page_here = await has_file(page_url, "page.jsonl");

	// page.jsonl's own lines, fetched at most once and reused below for the weight
	// fallback too — never a second fetch of the same file.
	let page_lines = null;

	// Known (we have a real tree) and NEITHER file exists: nothing to read, so skip the
	// fetch entirely instead of asking for two files we already know aren't there.
	if (settings_here !== false){
		for (const line of (await fetch_lines(new URL("settings.jsonl", location.origin + page_url).href)) ?? []){
			if (!line.trim()) continue;
			let obj;
			try { obj = JSON.parse(line); } catch { continue; }
			read_settings_line(obj, out);
		}
	}

	// `tab`/`weight` have nowhere else to come from (no fallback, unlike `nav` below), so
	// this always also checks page.jsonl when settings.jsonl didn't set them — not just
	// when `nav` is still unset.
	if ((out.nav === undefined || out.tab === undefined) && page_here !== false){
		page_lines = await fetch_lines(new URL("page.jsonl", location.origin + page_url).href);

		for (const line of page_lines ?? []){
			if (!line.trim()) continue;
			let obj;
			try { obj = JSON.parse(line); } catch { continue; }
			read_settings_line(obj, out);
		}
	}

	if (out.nav === undefined){
		const weight_here = await has_file(page_url, "weight.jsonl");

		if (weight_here === false && page_here === false){
			out.nav = true;   // weight() would answer its own "weight 1, nobody's ever set one" default
		} else if (weight_here === false){
			// No weight.jsonl — weight() would read page.jsonl anyway. Reuse the copy
			// already fetched above (or fetch it once here, if the nav check never
			// needed to) instead of letting weight() probe weight.jsonl blind first.
			page_lines ??= await fetch_lines(new URL("page.jsonl", location.origin + page_url).href);
			out.nav = weight_of(page_lines) >= 1;
		} else {
			// weight.jsonl genuinely exists — a real file worth the real fetch.
			out.nav = (await weight(page_url)).weight >= 1;
		}
	}

	return out;
}

export default page_settings;
