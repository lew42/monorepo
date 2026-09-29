// page_settings(page_url) — this page's own settings, read without loading the page: {
//   nav: true|false   "does this page appear in its parent's navigation?"
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

import { weight } from "../weight/weight.js";

async function fetch_lines(url){
	const res = await fetch(url).catch(() => null);
	if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
	return (await res.text()).split("\n");
}

export async function page_settings(page_url){
	const out = { nav: undefined };

	const lines = (await fetch_lines(new URL("settings.jsonl", location.origin + page_url).href))
		?? (await fetch_lines(new URL("page.jsonl", location.origin + page_url).href));

	if (lines) for (const line of lines){
		if (!line.trim()) continue;
		let obj;
		try { obj = JSON.parse(line); } catch { continue; }

		// The latest line wins — a settings line is a "set", never accumulated, the
		// same rule weight.js's own manual number follows.
		if (typeof obj.settings?.nav === "boolean") out.nav = obj.settings.nav;
	}

	if (out.nav === undefined) out.nav = (await weight(page_url)).weight >= 1;
	return out;
}

export default page_settings;
