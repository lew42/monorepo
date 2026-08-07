import { Page, p, a } from "/app.js";
import { code, section } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "The rule",

	content(){
		code(`
The captor is yours until your function RETURNS.
An async function returns at its first await.

    So: place the container synchronously, and after an await, name your target.`,
			"the whole thing");

		section("The three-line version, for the top of View.js");

		code(`
/* View.captor is one global with a push/pop stack, and append_fn restores it
 * when your function RETURNS — for an async function, at its first await, and
 * for any deferred callback, before it ever runs. Place containers
 * synchronously; fill them through a named view. Nothing throws if you don't. */`);

		section("What it rules out, and what it does not");

		code(`
✓  div.c("x", $x => …)                  a plain capture fn — the captor is $x
✓  div.c("x", async $x => { $x.… })     async, but every append is NAMED
✓  $x.append(() => { div(); div(); })   re-entering capture, at any time
✓  content(){ return promise_of_view }  append_promise places it for you
✓  return a view from an async fn       append_fn appends the promise correctly

✗  async $x => { div("y"); }            a factory call after an await
✗  .click(() => div("y"))               a callback is not your capture turn
✗  setTimeout(() => div("y"))           neither is a timer
✗  .then(() => div("y"))                nor a continuation`);

		p("The failing four are one thing: an element factory called outside the turn that set the captor. `await` is the famous way to get there; it is not the only one.").ac("note");

		section("Why it cannot be fixed by being careful");

		code(`
append_fn(fn){
    View.set_captor(this);
    const return_value = fn.call(this, this);   // async fn returns HERE
    View.restore_captor();                      // …so this runs HERE
    if (is.def(return_value))
        this.append(return_value);
    return this;
}`, "View.js");

		p("Every line is correct. `restore_captor()` does exactly what it says, `fn.call()` returned exactly what an async function returns, and the promise is appended properly. There is no check to add that would not also break the legitimate case, which is why the answer is a discipline and not a guard.").ac("note");

		section("And the one thing that makes it survivable");

		p("The auto-append is never skipped — a factory always appends to the captor at rest. An explicit `.append()` then MOVES the node, because `appendChild` moves a node that already has a parent. Do both in the same synchronous turn and the browser never paints the wrong one. That is why the correct shape looks like it is preventing the append when it is really just fixing it in time.");

		code(`
const $child = div.c("item", "hi");   // → app.$pages, right now, always
$results.append($child);              // → moved. Same turn, so never painted.`);

		section("Where to go next");

		code(`
/async/trap/           the bug, with its real parentElement chain
/async/shapes/         the two correct forms, and when each is right
/async/states/         loading · empty · error, and the cold-load asymmetry
/async/inflight/       leaving before it lands · deactivate() · Open #4
/async/marking/        links rendered late, and the observer that fixes it
/async/stream/         batches, infinite scroll, and the discarded query string
/async/arrangements/   one bug, three faces`);

		a.c("page-link", "← back to Async").href("/async/");
	}
});
