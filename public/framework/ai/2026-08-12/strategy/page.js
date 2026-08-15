import { Page, md, h2 } from "/app.js";

const doc = (file, options) => ({ ...options, content(){ return md.file(import.meta, file, { h1: false }); } });

export default new Page({
	meta: import.meta,
	title: "Strategy",
	description: "Three lenses over /framework/ — layout simplicity, browsability, an employer's five minutes — and the plan they agree on.",
	icon: "map",

	children: {
		Plan: doc("plan.md", {
			icon: "checklist",
			description: "The synthesis: one curation wave, then one layout story, phase by phase.",
		}),
		"Layout simplicity": doc("layout-simplicity.md", {
			icon: "layers",
			description: "Four tiers teach layout, ten doors open a demo, five words mean `pad`. The machine is fine; there are four of it.",
		}),
		Browsability: doc("browsability.md", {
			icon: "explore",
			description: "The prime objective, measured: click depth is already 1–2. What is left is links, legible cards, three open items.",
		}),
		"Employer audit": doc("employer-audit.md", {
			icon: "fact_check",
			description: "A senior engineer clicks for five minutes. The content is not the problem; the curation is.",
		}),
	},

	content(){

		md("Three independent reads of `/framework/` on 2026-08-12, one lens each, every path verified against the tree that day. They converge on one sentence: **the machinery is done and good; the mess is links, duplication, and stale text.** `plan.md` is what came out of them, and it is what the phase workers read.");

		this.previews();

		h2("The smallest model");

		md(`Seven sentences cover layout, nesting and responsiveness — the target every
move in \`layout-simplicity.md\` is measured against:

1. A page is three tracks: \`main | wide | bleed\`. One left edge; slack goes right.
2. Inside a track, arrange with the utility words.
3. Responsiveness is intrinsic — tracks, \`clamp\`, \`auto-fill\`, \`flex-wrap\`.
4. A page declares \`children:\`; a child mounts in the nearest \`$pages\`; the router
   marks the active chain.
5. Anything shown without being routed to wears \`default\` — the whole arrangement
   contract.
6. Every child draws its own \`preview()\`; a parent arranges them.
7. A detail page is one \`demo.exhibit()\`.`);

		h2("Landed from this plan");

		md("**Phase 2 · 2 — the arrangement contract fails loudly.** `Router.mark()` now unmarks only the views it marked, so a page a widget renders outside the router chain keeps its own marks instead of being blanked by the next click anywhere. And a `.page` placed with no mark and no `default` says so on localhost — `Page.warn_if_hidden()`, one console line naming the page and the fix. [Page](/framework/core/Page/) · [Router](/framework/core/Router/)");

		md("**`Page.go()` is deleted** — zero callers, and it was the imperative way to do the one thing this framework does declaratively. `app.router.go(url)` is one property longer and says which object is doing the work.");
	},
});
