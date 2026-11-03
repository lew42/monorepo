// page_settings(page_url) — this page's own settings, read without loading the page: {
//   nav: true|false    "does this page appear in its parent's navigation?"
//   tab: true|false|undefined   "does this page join a DETECTED tab bar?" (added 2026-10-01,
//                        ai/AIOverview.js's detectTabs() — undefined means the line was never set)
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
// has_file() (weight/has-file.js) says which of these files exist, so a page with none of them costs no request.

import { weight } from "../weight/weight.js";
import { has_file } from "../weight/has-file.js";

async function fetch_lines(url){
	const res = await fetch(url).catch(() => null);
	if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
	return (await res.text()).split("\n");
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
	if (typeof obj.settings?.view === "string") out.view = obj.settings.view;   // a list page's default view, e.g. "table" or "rail" (ext/DataGrid/doc/architecture.md)
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
