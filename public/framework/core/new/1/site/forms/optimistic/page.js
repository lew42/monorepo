import { Page, p, a, ul, li, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { post } from "../post.js";
import { notify } from "../notify.js";
import { this_file } from "../this_file.js";

export default new Page({
	meta: import.meta,
	title: "Optimistic, across a navigation",
	classes: "forms",

	n: 0,

	content(){
		demo(() => {
			this.$list = ul.c("forms-list");
			this.$log = p.c("forms-status", "nothing in flight");

			button("add — then click a sidebar link before it fails").click(() => {
				const text = "item " + (++this.n);
				let $item;

				// The captor moved on long before this click. Name the target, or the
				// <li> lands in whatever is capturing now — usually app.$pages.
				this.$list.append(() => { $item = li(text); });

				this.$log.text(`posting ${text}…`);

				post({ text }, { fail: true, ms: 900 }).catch(error => {
					$item.remove();
					this.$log.text(`rolled back ${text} — ${error.message}`);
					notify(`${text} failed and was rolled back. You may not be on that page any more.`);
				});
			});
		}, "The item appears immediately, the post fails 900ms later, and the rollback removes it. Click `add` and then leave — the toast finds you; the line above it does not. `post()` is a promise and a `setTimeout`; nothing leaves the browser.");

		section("Where the error actually went");

		code(`
click add at /forms/optimistic/, then leave within 900ms:

<li> count            1                       the optimistic row appeared
navigate to           /columns/               while the post is still in flight
.page-optimistic      still in .pages         "page page-optimistic forms"
.forms-status         connected=true  visible=FALSE
                      "rolled back item 1 — the server said no"
<li> count            0                       rolled back, correctly, unseen
.forms-toast          onscreen=true  parent=<body>`,
			"measured — the rollback ran perfectly, into the dark");

		md("Nothing failed. The promise resolved on schedule, the rollback was applied, the status line was updated, and the DOM is exactly right. It is simply **off screen**, because the page's view is memoized and CSS took it out of the chain. A correct error delivered where nobody is looking is indistinguishable from no error at all.").ac("note");

		section("Is this the same bug as a mid-flight fetch?");

		code(`
async seat   the CAPTOR moved      new DOM lands in the WRONG place   nothing throws
here         the ATTENTION moved   new DOM lands in the RIGHT place   nothing throws

same symptom (silent), different cause, different fix`,
			"related, not identical");

		md("The captor problem is fixed by naming the target — which this page already does, on the line marked above. Doing that correctly is precisely what produces this problem: the update lands exactly where it was told to, on a page that is no longer on screen. **Fixing the async seat's bug is what creates mine.** They are the two halves of one rule: name the target for the DOM, and choose a target that outlives the page for anything a human must see.").ac("note");

		section("So where should it surface?");

		code(`
into the page that started it   correct, invisible — this page, today
into app chrome                 a region outside $pages that navigation cannot hide
by not being optimistic         disable the control until it settles`,
			"three answers, and the middle one is missing from the framework");

		md("`App.render()` builds `$app` and `$pages`; everything a page draws lives inside `$pages` and is hidden by the chain rules. There is **no app-level surface** for something that outlives a page. The toast in this section appends straight to `<body>` because there is nowhere else — that is a workaround, and it belongs in `App` as a named region, not in a section about forms.").ac("note");

		a.c("page-link", "next: autosave, the honest alternative →").href("/forms/autosave/");

		this_file(import.meta);
	},
});
