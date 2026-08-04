import { Page, View, p } from "/app.js";
import { code, section } from "../ui.js";
import demo from "/framework/ext/demo/demo.js";
// installs View.prototype.md, which demo() captions use if it is there. Without
// it p() renders only `backticks` and **bold** arrives as literal asterisks.
import "/framework/ext/markdown/md.js";
import { field } from "./field.js";
import { this_file } from "./this_file.js";

View.stylesheet(import.meta, "forms.css");

export default new Page({
	meta: import.meta,
	title: "Unsaved work",
	classes: "forms",

	children: "survives exit guard unload wizard submit optimistic autosave",

	content(){
		demo(() => {
			this.$scratch = field("Type something, then click any link in the sidebar and come back", {
				name: "scratch", rows: 3 });
		}, "It is still there. `render()` memoizes into `this.view`, so a page's DOM — and every live input value in it — is built once and never rebuilt. Navigation hides it; it does not destroy it.");

		section("Where work is actually lost");

		code(`
exit path              the DOM        lost?         what can refuse it
─────────────────────  ─────────────  ───────────   ──────────────────
click an in-app link   memoized       nothing       a router guard
Back / Forward         memoized       nothing       nothing — only an undo
reload                 rebuilt        EVERYTHING    beforeunload
close the tab          gone           EVERYTHING    beforeunload
an external link       gone           EVERYTHING    beforeunload`,
			"five exit paths, all measured");

		p("The two rows a router-level guard could catch are the two rows that lose nothing. The three rows that lose everything are unreachable from `Router` — they never reach it. That is the verdict of this section, and every page below is the evidence for it.").ac("note");

		section("The eight investigations");

		this.previews();

		p("Read them in order. `survives` and `exit` establish the facts; `guard` and `unload` are the two mechanisms; `wizard`, `submit` and `optimistic` are what you actually build; `autosave` is the answer.").ac("note");

		this_file(import.meta);
	},
});
