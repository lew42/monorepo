import { Page, md } from "/app.js";

/* Container: /imagine/'s columns row. Size: `large` (28-64em) — the options matrix is an
   8-column table and the default 40em track clipped its last two columns clean off.
   Own layout: whatever the markdown is. Regions: one. Preview: the default card.

   The content is still just `../thinking.md`, a file in git — this page.js exists only to
   claim a wider column and to say so. `h1: false` because render() already drew the title. */

export default new Page({
	meta: import.meta,
	title: "Thinking",
	description: "The options matrix — git files, node:sqlite, D1, Durable Objects, KV, R2 — and the adapter seam that avoids picking one.",
	icon: "balance",
	width: "large",

	content(){ return md.file(import.meta, "../thinking.md", { h1: false }); },
});
