// ai_cost(page_url) — this page's share of AI work, as a plain dollar figure: { usd, tasks }
// or null when nothing has been computed for it yet. Reads the page's OWN log directly, never
// through the page tree — exactly like weight.js, and for the same reason (doc/design.md).
//
// The number itself is never computed here. `Server/page-ai-cost.mjs` is the one place that
// walks the task logs and writes `{"ai_cost": {...}}` (CLAUDE.md law 7: compute, don't recall) —
// this module only reads the latest line back. Run it with:
//   node Server/page-ai-cost.mjs
//
// Same file-choice rule as weight.js: a page.js folder's data line lives in weight.jsonl, a
// folder with no page.js of its own keeps using page.jsonl — this tries weight.jsonl first and
// falls back to page.jsonl, so both kinds of page read correctly.
//
// Fails soft: no log at all, a network error, or the SPA's index.html-as-404 all answer `null` —
// "nothing costed yet," not zero (a page that's never been touched by a task isn't "$0 of work,"
// it's simply not measured).
//
// ⚠ 2026-10-03 console-clean: same blind-probe fix as weight.js — `has_file()` checks the dev
// server's `/directory.json` first so a page with neither file costs zero requests instead of
// two 404s. `ai_cost()` runs for EVERY page's title block (Page.class.js), so this was half of
// the console-clean 404 storm. Duplicated rather than imported — same reasoning as weight.js
// and settings.js's own copies: a shared import here is not worth a cycle risk for ~15 lines.

async function fetch_lines(url){
	const res = await fetch(url).catch(() => null);
	if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
	return (await res.text()).split("\n");
}

let tree;
function directory_tree(){
	return tree ??= fetch("/directory.json").then(res => res.ok ? res.json() : null).catch(() => null);
}

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

export async function ai_cost(page_url){
	const weight_here = await has_file(page_url, "weight.jsonl");
	let lines = weight_here !== false
		? await fetch_lines(new URL("weight.jsonl", location.origin + page_url).href)
		: null;

	if (!lines){
		const page_here = await has_file(page_url, "page.jsonl");
		if (page_here !== false) lines = await fetch_lines(new URL("page.jsonl", location.origin + page_url).href);
	}
	if (!lines) return null;

	let out = null;
	for (const line of lines){
		if (!line.trim()) continue;
		let obj;
		try { obj = JSON.parse(line); } catch { continue; }
		// `ai_cost` is a SET, like weight's manual line — the latest line wins, never summed here.
		if (obj.ai_cost && typeof obj.ai_cost.usd === "number") out = obj.ai_cost;
	}
	return out;
}

export default ai_cost;
