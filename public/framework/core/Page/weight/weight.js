// weight(page_url) — this page's weight: 1, plus one for every distinct real page that
// references it, plus a manual adjustment (owner's words: +10 for something important, +20 or
// +50 for something ultra-important; the manual number can also be negative, to "diminish its
// effect"). Reads the page's OWN log directly, never through the page tree — so it works for a
// page.js page too. Why that's safe: doc/design.md.
//
// ⚠ 2026-09-29 fix round, finding 2: a page.js folder's weight lines live in a sibling
// `weight.jsonl`, NEVER a `page.jsonl` — a `page.jsonl` file is what subscribes a folder to the
// dev server's file watcher (Server/plugins/PageFiles.js), which is exactly the churn that got
// committed and had to be cleaned up (doc/design.md has the rule and why). A real page.jsonl
// PAGE (one with no page.js of its own, like core/Page/jsonl/ itself) has nowhere else for its
// weight lines to live, so it keeps using page.jsonl — this tries weight.jsonl FIRST and only
// falls back to page.jsonl when no weight.jsonl exists, so both kinds of page read correctly.
//
// Fails soft: no log at all, a network error, or the SPA's index.html-as-404 (content-type is
// the tell, same guard Log.js and Page.class.js use) all answer the same way — weight 1, no
// refs, no manual — which is exactly the "brand new page" answer.
//
// ⚠ 2026-10-03 console-clean: this used to fetch weight.jsonl, then page.jsonl, for EVERY
// page the router knows — about a hundred 404s on one load of `/framework/ai/live/`, almost
// none of which actually have either file. `has_file()` below checks the dev server's own
// file tree (`/directory.json`) BEFORE fetching — same fix, same reasoning, as
// `settings.js`'s own `has_file()` (duplicated here rather than imported, for the same
// reason settings.js gives: importing Page.class.js or Markdown.js would close a cycle back
// through this file, which settings.js already imports). Off the dev server (production, no
// `/directory.json`) `has_file()` answers `undefined` — "can't know" — and this falls back to
// fetching blind, exactly as it always did.

async function fetch_lines(url){
	const res = await fetch(url).catch(() => null);
	if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
	return (await res.text()).split("\n");
}

let tree;
function directory_tree(){
	return tree ??= fetch("/directory.json").then(res => res.ok ? res.json() : null).catch(() => null);
}

// Is `name` a real FILE right beside `page_url`, according to the dev server's own tree?
// `undefined` = no tree at all (production) — can't know, caller falls back to a blind fetch.
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

export async function weight(page_url){
	const refs = [];
	const out = { weight: 1, refs, manual: 0 };

	const weight_here = await has_file(page_url, "weight.jsonl");
	let lines = weight_here !== false
		? await fetch_lines(new URL("weight.jsonl", location.origin + page_url).href)
		: null;

	if (!lines){
		const page_here = await has_file(page_url, "page.jsonl");
		if (page_here !== false) lines = await fetch_lines(new URL("page.jsonl", location.origin + page_url).href);
	}
	if (!lines) return out;

	for (const line of lines){
		if (!line.trim()) continue;
		let obj;
		try { obj = JSON.parse(line); } catch { continue; }

		// referenced_by ACCUMULATES (every distinct value kept — the place() pattern,
		// doc/prior.md); weight is a manual "set" — the LATEST line wins, never summed.
		if (typeof obj.referenced_by === "string" && !refs.includes(obj.referenced_by)) refs.push(obj.referenced_by);
		if (typeof obj.weight === "number") out.manual = obj.weight;
	}

	out.weight = 1 + refs.length + out.manual;
	return out;
}

export default weight;
