// weight(page_url) — this page's weight: 1, plus one for every distinct real page that
// references it, plus a manual adjustment (owner's words: +10 for something important, +20 or
// +50 for something ultra-important; the manual number can also be negative, to "diminish its
// effect"). Reads the page's OWN page.jsonl directly, never through the page tree — so it
// works for a page.js page too. Why that's safe: doc/design.md.
//
// Fails soft: no log at all, a network error, or the SPA's index.html-as-404 (content-type is
// the tell, same guard Log.js and Page.class.js use) all answer the same way — weight 1, no
// refs, no manual — which is exactly the "brand new page" answer.

export async function weight(page_url){
	const url = new URL("page.jsonl", location.origin + page_url).href;
	const refs = [];
	const out = { weight: 1, refs, manual: 0 };

	const res = await fetch(url).catch(() => null);
	if (!res?.ok || res.headers.get("content-type")?.includes("html")) return out;

	for (const line of (await res.text()).split("\n")){
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
