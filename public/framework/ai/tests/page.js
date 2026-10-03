import { Page, div, small } from "/app.js";

const SLUGS = ["h1-page", "fix-label", "broken-import", "broken-overflow", "plan-views", "rung0-html-to-view", "rung0-html-to-view-primer"];
const OTHER_CHILDREN = ["keys-to-success"]; // a real page.js folder, not a page.jsonl — core's own child() handles it

/* The test library's index — every AITest (AITest.js), a wall of previews.
 *
 * A test used to be a plain folder under Servex/ext/openrouter/evals/library/, read only by
 * library.mjs. Amendment 5 (test-library/requirements.md, "Phase 10") made it a real page: each
 * one now lives at public/framework/ai/tests/<slug>/, its own page.jsonl naming AITest.js as its
 * class, so it shows its prompt, criteria and every run it has had — reachable by anyone, not
 * only the script that runs it. `evals/library/` is gone; library.mjs reads tests from here.
 *
 * `children:` below is the one list that has to stay in sync by hand — a test whose folder
 * exists but isn't named here would still load by direct url (Page.child()'s filesystem probe),
 * but it would show nowhere on this page, so it would look like it doesn't exist. */
export default new Page({
	meta: import.meta,
	title: "Test library",
	description: "Small tasks with a known-good outcome, run across models to see which is cheapest and good enough.",
	children: "h1-page fix-label broken-import broken-overflow plan-views rung0-html-to-view rung0-html-to-view-primer keys-to-success",

	/* ⚠ THE ONE OVERRIDE A page.jsonl CHILD NEEDS. Core's own `child(name, levels)`
	 * (Page.class.js) only probes a DECLARED name's `page.js` (`Page.load()`); it never
	 * tries `page.jsonl` unless this folder's OWN listing already says the child is one
	 * (an AI 2 card's parent gets that for free because it names its children with
	 * `{"file": "kid/page.jsonl"}` lines, which teach `child_kinds` the kind up front —
	 * this plain page.js has no such lines). Every test here IS a page.jsonl
	 * (AITest.js), so without this override every click 404s with "nothing matches",
	 * even though `previews()` above still draws a card for it (that part needs
	 * nothing loaded at all). Found this the hard way: the index rendered fine, but
	 * every test link under it was a dead click until this was added. */
	async child(name, levels){
		if (SLUGS.includes(name)){
			const page = await Page.jsonl(this.url + name + "/");
			return page && this.add(name, page).load_all_children(levels);
		}
		// `keys-to-success` is a real page.js folder (Phase 17), not a page.jsonl — this object
		// literal's `child` REPLACES Page.class.js's own method rather than extending it (there is
		// no superclass to fall back to), so a name outside SLUGS needs its own probe: the same
		// `Page.load(url, 0)` core's child() would have tried. Found this the same way as the
		// jsonl override above: the link rendered, every click 404'd, because this whole method
		// used to just return null for anything not in SLUGS.
		if (OTHER_CHILDREN.includes(name)){
			const page = await Page.load(this.url + name + "/", 0);
			return page && this.add(name, page).load_all_children(levels);
		}
		return null;
	},

	content(){
		this.previews();

		// Amendment 6 item 4: the index shows each test's weight. A plain fetch of each test's own
		// page.jsonl (not a child load — that would build a whole AITest instance per card just to
		// read one number) for its latest `{"meta": {...}}` line, same "latest wins" rule every
		// page.jsonl reader uses.
		div.c("page-ai-tests-weights muted", $box => {
			small.c("page-ai-tests-weights-head").text("How much each test counts in the ranking (how well it separates strong models from weak ones, times how sure we are of it):");
			Promise.all(SLUGS.map(async slug => {
				const text = await fetch(this.url + slug + "/page.jsonl").then(r => r.ok ? r.text() : "").catch(() => "");
				let weight = null;
				for (const line of text.split("\n")){
					try { const o = JSON.parse(line); if (o?.meta) weight = o.meta.discrimination != null ? o.meta.weight : null; } catch {}
				}
				return { slug, weight };
			})).then(rows => {
				$box.append(() => { div.c("page-ai-tests-weights-list", () => {
					const known = rows.filter(r => r.weight != null);
					known.length ? small(known.map(r => `${r.slug}: ${r.weight}`).join(" · "))
						: small("not measured yet: a test needs runs from 4 models first.");
				}); });
			});
		});
	}
});
