import { Page, p, a, div } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { field } from "../../forms/field.js";
import { this_file } from "../../forms/this_file.js";
import { record } from "../record.js";

export default new Page({
	meta: import.meta,
	title: "Two urls, one record",
	classes: "mutation",

	release: null,

	initialize(){
		this.rec = record({ title: "Ada Lovelace", body: "Analytical Engine, note G." });

		this.add("edit", {
			title: "Edit",
			content(){
				const rec = this.parent.rec;

				field("Title", { name: "rec-title", value: rec.data.title })
					.on("input", e => rec.set("title", e.target.value));

				field("Body", { name: "rec-body", rows: 3, value: rec.data.body })
					.on("input", e => rec.set("body", e.target.value));

				p("Type here and watch the two readouts above.").ac("note");
			},
		});

		this.add("review", {
			title: "Review",
			content(){ this.$out = p.c("forms-status", ""); },

			// A second url showing the same record. Built once — so without this
			// it shows whatever was true the first time you opened it.
			activate(){
				Page.prototype.activate.call(this);
				this.$out.text(JSON.stringify(this.parent.rec.data));
				return this;
			},
		});
	},

	// The parent is in the SHARED slice while you move between its children, so
	// neither hook fires and the watcher simply persists. These two only run when
	// you leave the subtree entirely, which is exactly when it should be released.
	deactivate(){ this.release?.(); this.release = null; return this; },

	activate(){
		Page.prototype.activate.call(this);
		this.release ??= this.rec.watch(data => this.$live.text(JSON.stringify(data)));
		return this;
	},

	content(){
		demo(() => {
			this.$live = p.c("forms-status", "");
			this.$frozen = p.c("forms-status", JSON.stringify(this.rec.data));

			p("↑ the first is `rec.watch(…)`. The second was rendered once, from the same object, and never told again.").ac("note");
		}, "One record, two views of it, one line of difference. Type in `Edit` below — the live one follows, the frozen one keeps the value it was built with. **Both are correct code**; only one of them subscribed.");

		// Children mount HERE, so this page stays on screen while one of them is
		// the leaf — which is the whole point: the readouts above and the editor
		// below are alive at the same moment. No `cols`: one child is visible at a
		// time, so a column grid would be a class that decides nothing.
		this.$pages = div.c("pages");

		section("Why activate() is not enough here");

		code(`
stale when you come BACK      activate() fixes it — you are arriving
stale while BOTH are on
  screen at the same time     activate() cannot: neither is arriving`,
			"two different staleness bugs that look identical");

		md("A parent that claims `$pages` and its child are mounted together, and moving between children never re-activates the parent — it is in the shared slice of the chain, so `Router.activate()` deliberately does not touch it. That is the right behaviour and it is what makes columns cheap. It also means **there is no arrival to hang a refresh on**, so the only thing left is telling the view directly.").ac("note");

		section("What the framework offers: nothing, and that is defensible");

		code(`
record.set(key, value)   ->   watchers.forEach(fn => fn(data))`,
			"seven lines in site/mutation/record.js, and no framework involvement");

		md("`render()` memoizing turns *two routes showing one record* from a re-render problem into a **cache-invalidation** problem, and this framework has no invalidation. I am not asking for one. A general reactive layer is the largest thing anyone could add here and it would touch every page; a `Set` of callbacks on the object that owns the data is seven lines, visible in the file that wants it, and composes with `deactivate()` for release.").ac("note");

		md("The honest cost: **every view of shared data must remember to subscribe, and nothing tells it.** The frozen readout above is not broken code — it is code that forgot, and it fails silently and cosmetically, which is the cheapest bug to ship. That is the same shape as the `mark_links()` debt the async seat documented, and it has the same answer available: the framework could not know, so the call site has to say it.").ac("note");

		section("Measured");

		code(`
at /mutation/concurrent/edit/, append " II" to Title:

both mounted     page page-concurrent mutation active-ancestor
                 page page-edit active-page          — same screen, both live
live readout     {"title":"Ada Lovelace II", …}      every keystroke
frozen readout   {"title":"Ada Lovelace", …}         unchanged, forever

then /mutation/concurrent/review/:
review           {"title":"Ada Lovelace II", …}      fresh, via activate()

leave to /columns/ and return:
rec.count()      1   the parent re-subscribed; it does not accumulate`);

		a.c("page-link", "next: undo across a navigation →").href("/mutation/undo/");

		this_file(import.meta);
	},
});
