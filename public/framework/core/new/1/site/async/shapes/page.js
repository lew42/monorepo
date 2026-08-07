import { Page, View, p, div, a } from "/app.js";
import { code, section } from "../../ui.js";
import { live, where, items } from "../lab.js";

/* Shape B, as a real page would write it — the whole content IS the async thing.
 *
 * capture:false is the load-bearing detail: there is nothing to place until it
 * resolves, so the view must NOT auto-append on the way past. Exactly what
 * md.file() and code.file() do, for exactly this reason.
 */
async function catalog(){
	const data = await items(500);

	return new View({ capture: false }).ac("async-items")
		.append(() => data.slice(0, 12).forEach(row => div.c("async-item", row.name)));
}

export default new Page({
	meta: import.meta,
	title: "Two shapes",

	content(){
		p("Both are correct. They answer different questions, and the question is: is the container part of the layout, or IS the content the async thing?");

		section("A · capture the container, fill it by name");

		live(() => {
			div.c("async-results", async $results => {
				const data = await items(400);

				$results.append(div.c("async-landed ok", "filled → " + where($results.el)));
				$results.append(() => data.slice(0, 8).forEach(row => div.c("async-item", row.name)));
			});
		}, "the container exists immediately; the data arrives into it");

		p("`$results` was placed while the captor was still ours. The callback names it, so it no longer matters what the captor became — that is the entire trick.").ac("note");

		section("A′ · re-enter capture, and get the ergonomics back");

		p("Naming the target for every single element gets tedious fast. You do not have to: `append()` takes a function, and `append_fn` sets the captor before calling it. It does that whenever you call it — there is nothing special about render time.");

		code(`
$results.append(div.c("item", a), div.c("item", b));    // name every element

$results.append(() => {                                  // …or re-enter capture
    div.c("item", a);
    div.c("item", b);
});`, "the same thing twice");

		p("Inside that arrow the captor is `$results` again, so ordinary factory code works exactly as it does at render time. One named call, then business as usual. Note it must be a plain function — make it `async` and you are back in the trap, one level deeper.").ac("note");

		section("B · return a promise");

		code(`
async function catalog(){
    const data = await items(500);

    // capture:false — nothing to place until it resolves, so it must not
    // auto-append on the way past. This is what md.file() does.
    return new View({ capture: false }).ac("async-items")
        .append(() => data.slice(0, 12).forEach(row => div.c("async-item", row.name)));
}

content(){ return catalog(); }        // View.append_promise places it`, "shapes/page.js — the real function, running below");

		div.c("async-render").append(catalog());

		p("`Page.render()`'s capture callback returns whatever `content()` returns. `append_fn` sees a promise and hands it to `append_promise`, which awaits it and appends to the page view — a view that was placed synchronously. That is why `content(){ return md.file(...) }` needs no support from `Page` at all.").ac("note");

		section("The one thing they share");

		code(`
append_fn(fn){
    View.set_captor(this);
    const return_value = fn.call(this, this);
    View.restore_captor();
    if (is.def(return_value))
        this.append(return_value);        // ← a promise lands in append_promise
    return this;
}`, "View.js");

		p("An async capture callback's RETURN VALUE is placed correctly — measured. Only the ambient factory calls inside it are lost. So A and B are one rule stated twice: name your target, or return it.").ac("note");

		section("Which one, when");

		code(`
A · named target        the container is part of the layout and must exist NOW
                        — a skeleton, a fixed box, anything the geometry needs
                        — several independent fills on one page
                        — anything that appends more than once (batches, streams)

B · return a promise    the whole content IS the async thing
                        — you would rather show nothing than a box that jumps
                        — the ONLY shape a cold load can await, because there is
                          a promise for someone else to hold`);

		p("B is awaitable and A is not: `App.loaders` needs a promise, and shape A's promise is swallowed by `append_fn`. That asymmetry is the whole of the next page.").ac("note");

		a.c("page-link", "states →").href("/async/states/");
	}
});
