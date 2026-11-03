import { Page, md } from "/app.js";

/* Container: a COLUMN under /imagine/platform/ in /imagine/'s columns host (the
   mastermind wires this in via the hub's `children:` — never edited here). Size:
   `large`, 28–64em — prose and a short link list, nothing wider. Own layout:
   prose only. Regions: one. Preview: the default card.

   This page used to hold a working search prototype, bound to `this.parent` so it
   could demonstrate scoped-vs-global ranking. That prototype graduated into
   `core/Search` on 2026-09-06 — first as a site-wide box, then (same day) scoped
   to just the Search page after it started breaking others — so there is nothing
   left to mount here. This page is the pointer, and the record of the question
   it answered. */

export default new Page({
	meta: import.meta,
	title: "Omnibox",
	description: "The site's search box started here, as a platform question. Now it lives on core/Search's own page.",
	icon: "search",
	width: "large",

	content(){
		md(`**Open [\`core/Search\`](/framework/core/Search/) to use it.** That page holds the site's one search box — press \`/\` or \`Ctrl\`/\`Cmd\` \`K\` there and it grows up from the bottom of the window. Type a few letters, arrow through the results, hit Enter to go. It lives on that page only, on purpose (a site-wide box broke other pages), so it is not on this one.`);

		md(`This page used to hold a *working prototype* of that box, built to answer one platform question: **can a community platform have keyboard-first search with no backend at all?** The answer was yes — the prototype proved it, then graduated into the real thing on 2026-09-06. Nothing is demonstrated here any more, on purpose.`);

		md(`## Where this fits

- [\`core/Search\`](/framework/core/Search/) — the box itself, live, plus [what changed](/framework/core/Search/doc/decisions/) between the prototype and the real thing.
- [Existing framework](/imagine/platform/existing/) — the gap this filled. Before this, nothing keyboard-first existed anywhere on the site.
- [The MVP slice](/imagine/platform/mvp/) — step 3, "The Omnibox over a static index": search over \`/directory.json\`, zero backend.
- [Data research](/imagine/platform/research/data/) — the open half. Today's index is a static list, read fresh at search time; a live, always-current index (D1 full-text search) waits until the platform has a database at all.`);
	},
});
