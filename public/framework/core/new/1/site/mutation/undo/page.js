import { Page, p, a, ul, li, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { field } from "../../forms/field.js";
import { this_file } from "../../forms/this_file.js";
import { notify } from "../../forms/notify.js";

export default new Page({
	meta: import.meta,
	title: "Undo across a navigation",
	classes: "mutation",

	items: ["alpha", "beta"],

	content(){
		demo(() => {
			field("Type a word, navigate away, come back, click here and press Ctrl-Z", {
				name: "native", rows: 2 });
		}, "**It undoes.** No framework, no undo stack, nothing anybody wrote. The browser's native undo history belongs to the element, and `render()` memoizes the element — so the history rides along through every navigation that keeps the heap.");

		section("The surprise, measured");

		code(`
type "hello world" into .native at /mutation/undo/

navigate to /mutation/concurrent/, back, focus, Ctrl-Z   -> ""
Ctrl-Y                                                   -> "hello world"
RELOAD, focus, Ctrl-Z                                    -> "" (nothing to undo)`,
			"native undo survives exactly what the memoized view survives");

		p("One `Ctrl-Z` took the whole insertion, because the browser coalesces an uninterrupted run of typing into a single undo unit — pause, or move the caret, and you get finer steps. The row that matters is the last one: after a reload there is nothing to undo, because the element is a different element.").ac("note");

		md("The last row is the tell: native undo dies at precisely the boundary the heap dies at, because the undo stack is a property of the DOM node and the node is what `this.view` is holding. **Nobody knew this worked, because nobody had a reason to press Ctrl-Z after navigating.** It is free, and it is the strongest single argument that this framework's memoization is a feature rather than an accident.").ac("note");

		section("Application-level undo is a different question");

		demo(() => {
			this.$list = ul.c("forms-list");
			this.$list.append(() => this.items.forEach(text => li(text)));

			button("delete 'alpha' — with an undo affordance").click(() => {
				const node = [...this.$list.el.children].find(n => n.textContent === "alpha");
				if (!node) return;

				node.remove();
				const toast = notify("Deleted 'alpha'. Click to undo.");
				toast.addEventListener("click", () => this.$list.el.prepend(node));
			});
		}, "The undo lives *on the notification*, not on a keystroke — so it travels with you, it is visible, and it says what it will undo. The toast is `<body>`-level, which is the only reason it survives a navigation at all.");

		section("Should Ctrl-Z undo an application action across a navigation? No.");

		code(`
what does it target?    you are on a different page; the thing you would be
                        undoing is not on screen and may not be nameable
what tells the user?    nothing. An invisible undo is not an undo — it is a
                        second mutation they did not see either
what about the input    the browser already owns Ctrl-Z inside a focused field,
you are typing in?      and taking it back is a worse bug than not having it`,
			"a defensible no, and the reason is affordance, not difficulty");

		md("The mechanism is easy — an undo stack on an ancestor Page, exactly like `/mutation/concurrent/`'s record. It is the **affordance** that fails. An undo the user cannot see is indistinguishable from a bug, and a global keystroke that fights the browser inside every text field is worse than the problem.").ac("note");

		md("So: **native Ctrl-Z inside a field, for free, and it already works. A visible undo affordance for everything else, attached to the notification of the change.** That is not a compromise — it is what `/forms/` implied. If autosave commits every keystroke, the safety net you need is undo rather than confirm; and an undo you can point at beats one you have to know about.").ac("note");

		section("Where this leaves the section");

		code(`
leaving      /forms/     memoization makes it safe; no guard needed
arriving     /mutation/  memoization is what makes it HARD

  autosave      the reload boundary, and nothing else
  recovery      offer, in activate(), with an expiry
  outliving     put the work on an ancestor; render it outside $pages
  concurrent    subscribe, because there is no arrival to refresh on
  undo          native for free; visible affordance for the rest`,
			"one property, both consequences");

		p("Every page in this section is the same fact read from a different side. `render()` memoizing into `this.view` is why nothing is lost when you leave, and why nothing refreshes when you arrive.").ac("note");

		a.c("page-link", "back to the section →").href("/mutation/");

		this_file(import.meta);
	},
});
