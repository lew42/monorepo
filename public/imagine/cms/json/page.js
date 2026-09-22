import { Page, md, div } from "/app.js";
import { source, config, body } from "./json.js";

/* Container: `/imagine/` is a columns host, so this is one more column in its row —
   content lands in `.page-column-prose` and children open to the right. Size: the default
   track; this is prose and a short rail. Own layout: `.flow`, nothing else. Regions: one.
   Preview: the default card.

   THE HANDOFF — the last real `page.js` in this tree. It fetches `page.json`, replays
   `page.jsonl`, and hands each node to `add()`; after that core owns them, so the data
   pages get real urls, the real Router, crumbs, columns and cards with nothing added.

   ONE SEAM MAKES A COLD DEEP URL WORK, and it is core's: `children` may be a FUNCTION
   that returns a promise. Core calls it once, on the first ask — the Router walking in
   for each url segment, or a direct landing here with no segment to walk — and waits
   for it before anything renders.

   ⚠ Until 2026-09-17 this file wrote that itself, as `child()` and `load_all_children()`
     overrides carrying a copy of core's own guard, and so did `paging/make/page.js`.
     `core/Page/doc/data-children.md` is the record of why it moved into core.
   ⚠ Nothing is fetched at import. A page constructs itself when its module loads, so a
     constructor that loaded its data would pull it down from every url on the site. */

export default new Page({
	meta: import.meta,
	title: "JSON pages",
	description: "A page tree that exists as data — page.json is the snapshot, page.jsonl the deltas.",
	icon: "storage",

	// MY CHILDREN ARE THE SNAPSHOT'S CHILDREN. Each node becomes a page config the same
	// way `config()` does everywhere else, and the EDITOR is last: it is a real file
	// beside this one, declared here by name, and a rail should open with the content
	// rather than with the tool.
	children(){
		return this.ready().then(() => [
			...Object.entries(source.state.children ?? {}).map(([name, node]) => ({ name, ...config(node, name) })),
			"edit",
		]);
	},

	// One load per visit, memoised — `children()` and `content()` both ask, and only
	// the first one pays.
	ready(){ return this.fetching ??= source.load(); },

	content(){
		md(`Two files beside this one hold a whole page tree: [\`page.json\`](/imagine/cms/json/page.json)
is the snapshot, [\`page.jsonl\`](/imagine/cms/json/page.jsonl) is every change since, one appended
line each. This \`page.js\` is the only code in the tree — it fetches both and hands the nodes to
core. [**Edit**](/imagine/cms/json/edit/) appends a line and shows the numbers.

The same two files, put on the dev socket instead of fetched once, are a page that changes
while you watch it: [**streaming pages**](/imagine/stream/) reads this exact delta contract.

How it is built, and whether a page can be json all the way down: [\`readme\`](/imagine/cms/json/readme/).

---`);

		// ⚠ Captured NOW, filled in a callback: a factory call after the `await` inside
		// ready() would land in whatever box is current by then.
		div.c("flow", ($box) => { this.ready().then(() => $box.append(() => { body(source.state, this); })); });
	},
});
