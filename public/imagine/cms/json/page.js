import { Page, md, div } from "/app.js";
import { source, config, body } from "./json.js";

/* Container: `/imagine/` is a columns host, so this is one more column in its row —
   content lands in `.page-column-prose` and children open to the right. Size: the default
   track; this is prose and a short rail. Own layout: `.flow`, nothing else. Regions: one.
   Preview: the default card.

   THE HANDOFF — the last real `page.js` in this tree. It fetches `page.json`, replays
   `page.jsonl`, and hands each node to `add()`; after that core owns them, so the data
   pages get real urls, the real Router, crumbs, columns and cards with nothing added.

   Two overrides make a COLD DEEP URL work, and they are the only two:

     child()             — the Router's walk asks the PARENT for each segment, so the data
                           only has to be here before the question is asked.
     load_all_children() — landing HERE has no segment to walk, and `Router.load()` awaits
                           `.loading` for the whole chain before it activates anything, so
                           this is where a direct visit gets its children before render.

   ⚠ `route()` is NOT the seam: core calls it synchronously and uses the return value, so a
     promise would be assigned onto a Page as if it were a config, and nothing would throw.
   ⚠ Nothing is fetched at import. A page constructs itself when its module loads, so a
     constructor that loaded its data would pull it down from every url on the site. */

export default new Page({
	meta: import.meta,
	title: "JSON pages",
	description: "A page tree that exists as data — page.json is the snapshot, page.jsonl the deltas.",
	icon: "storage",

	children: "edit",

	// One load per visit, memoised — `child()`, `load_all_children()` and `content()` all
	// ask, and only the first one pays.
	ready(){ return this.fetching ??= source.load().then(() => this.mount()); },

	// The whole translation, once: a node object becomes a page config, `add()` builds the
	// Page, and `declare()` recurses into its children for free.
	mount(){
		// The editor is declared first (it is a real file) but reads last — a rail should
		// open with the content, not with the tool. Re-setting a Map key moves it to the end.
		const edit = this.children.get("edit");
		this.children.delete("edit");

		Object.entries(source.state.children ?? {})
			.forEach(([name, node]) => this.add(name, config(node, name)));

		this.children.set("edit", edit);
		return this;
	},

	async child(name, levels){
		await this.ready();
		return Page.prototype.child.call(this, name, levels);
	},

	/* ⚠ THE GUARD IS MINE TO KEEP, and leaving it out throws from the microtask queue
	     with a message that names nothing: "Chaining cycle detected for promise" — core's
	     `load_all_children` returns `this` unchanged when `levels <= this.loaded`, so on
	     the second call `.loading` is the promise being assigned on that very line, and
	     `p.then(() => p)` is a cycle. Copied from `paging/make/page.js`, which names this
	     exact file as the other place the fix belongs. */
	load_all_children(levels = this.depth){
		if (levels <= this.loaded) return this;
		this.loaded = levels;

		this.loading = this.ready().then(() => {
			this.loaded = -1;
			return Page.prototype.load_all_children.call(this, levels).loading;
		});

		return this;
	},

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
