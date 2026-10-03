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

async function fetch_lines(url){
	const res = await fetch(url).catch(() => null);
	if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
	return (await res.text()).split("\n");
}

export async function ai_cost(page_url){
	const lines = (await fetch_lines(new URL("weight.jsonl", location.origin + page_url).href))
		?? (await fetch_lines(new URL("page.jsonl", location.origin + page_url).href));
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
