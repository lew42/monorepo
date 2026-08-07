import { Page, p, div, a, button } from "/app.js";
import { code, section } from "../../ui.js";
import { live, where, wait } from "../lab.js";

export default new Page({
	meta: import.meta,
	title: "The trap",

	content(){
		p("Two functions, one `await` apart. Nothing throws, nothing warns, the console stays clean — which is exactly why this costs an hour. Every box below prints the element's real `parentElement` chain, read off the DOM after the fact.");

		code(`import { div, button } from "/app.js";
import { live, where, wait } from "../lab.js";`, "what the boxes below have in scope");

		section("Wrong");

		live(() => {
			const $landed = div.c("async-landed", "…waiting");

			div.c("async-results", async () => {
				await wait(300);

				// Built AFTER the await. The captor stopped being ours the moment
				// this function first RETURNED — which was at that await.
				const $stray = div.c("async-orphan", "I was meant to be in .async-results");

				$landed.text("landed in → " + where($stray.el));
				$stray.remove();               // a real bug leaves it there
			});
		}, "wrong — a factory call after an await");

		p("The empty box above `.async-results` is real: it is the container, correctly placed, and it stayed empty. The orphan went to `app.$pages`, which is `display: flex` — so in a real bug it becomes a permanent flex sibling of every page, stealing width for the rest of the session.").ac("note");

		section("Right");

		live(() => {
			const $landed = div.c("async-landed ok", "…waiting");

			div.c("async-results", async $results => {          // ← name the target
				await wait(300);

				const $child = div.c("async-item", "I am inside .async-results");

				$results.append($child);                         // ← explicit
				$landed.text("landed in → " + where($child.el));
			});
		}, "right — capture the container, fill it by name");

		section("What actually happens — and why `.append()` rescues it");

		p("The auto-append is not skipped in the right version. It still happens: the factory call puts the element in `app.$pages`, and `$results.append()` then MOVES it, because `appendChild` moves a node that already has a parent. Both appends run in the same synchronous turn, so the browser never paints the wrong one.");

		p("Put an await between them and the browser does paint it. Watch this box for a second — the element appears outside it first, in the page container, then jumps in:");

		live(() => {
			const $landed = div.c("async-landed", "…waiting");

			div.c("async-results", async $results => {
				await wait(400);

				const $child = div.c("async-item", "watch me jump");
				$landed.text("auto-appended to → " + where($child.el));

				await wait(1200);                    // a paint happens HERE

				$results.append($child);
				$landed.ac("ok").text("then moved to → " + where($child.el));
			});
		}, "the same node, two parents, one visible frame apart");

		section("No await is required");

		p("An `await` is just the most common way to leave your own turn. Any deferred callback has already left it — a click handler, a `setTimeout`, a `.then()`. The captor at rest is `app.$pages`, and that is what a handler builds into:");

		live(() => {
			const $landed = div.c("async-landed", "click the button");

			button.c("async-btn", "build an element in a click handler").click(() => {
				const $stray = div.c("async-orphan", "no await anywhere — still an orphan");

				$landed.text("landed in → " + where($stray.el));
				$stray.remove();
			});
		}, "a click handler is not your capture turn either");

		section("See the real damage");

		p("Everything above cleans up after itself. A real bug does not. This leaves one behind — the page you are reading will lose width to it, and so will every page you navigate to afterwards, until you press the other button.");

		div.c("row", () => {
			button.c("async-btn", "leave an orphan in app.$pages").click(() => {
				div.c("async-orphan", "orphan · a flex item in app.$pages · nothing threw");
			});

			button.c("async-btn", "clean up").click(() => {
				document.querySelectorAll(".pages > .async-orphan").forEach(node => node.remove());
			});
		});

		section("Why nothing catches it");

		code(`
append_fn(fn){
    View.set_captor(this);
    const return_value = fn.call(this, this);   // an async fn returns HERE,
    View.restore_captor();                      // at its first await
    if (is.def(return_value))
        this.append(return_value);              // ← the promise, appended properly
    return this;
}`, "View.js — the whole mechanism, unchanged");

		p("There is no check to fail. `fn.call()` returned a Promise, `restore_captor()` did exactly what it promises, and the promise itself is appended correctly. Every individual line is right. Measured: zero console errors and zero warnings on this page, in every state.").ac("note");

		p("Next: the two shapes that are always correct.").ac("note");

		a.c("page-link", "shapes →").href("/async/shapes/");
	}
});
