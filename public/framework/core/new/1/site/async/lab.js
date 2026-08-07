/* The instruments this section shares.
 *
 * Every page imports from here, so a wrong-way example and its right-way twin
 * run literally the same helpers — the only difference between them is the one
 * line the page is about.
 */

import { View, div } from "/app.js";
import { code } from "../ui.js";
import { source } from "/framework/util/source/source.js";

// The module that EMITS the classes loads the stylesheet. /state/ imports live()
// too, and a cold load of /state/scroll/ never touches /async/page.js — so this
// cannot live there. Module scope, so it runs once however many sections import.
View.stylesheet(import.meta, "async.css");

/* live(fn) — the code, then the code running, in one box.
 *
 * `source(fn)` is the same stringifier ext/demo and code.fn() share, so what you
 * read is byte-for-byte what ran. A retyped snippet that differs by one `await`
 * would teach the exact opposite of the lesson on these pages.
 *
 * Not ext/demo itself, and that is a finding rather than a preference: demo.css
 * is written against framework.css's tokens (--line --surface --wash --radius
 * --subtle) and this sub-site loads only its own styles.css, so a real demo()
 * renders here with no border, no background and an unpadded <pre>. The captor
 * behaviour is identical — measured. See agents/async/page.js.
 */
export function live(fn, label){
	return div.c("async-live", () => {
		code(source(fn), label);
		div.c("async-render", fn);
	});
}

/* where(node) — the real parent chain, read off the DOM.
 *
 * Not where we meant to put it. Where it went. This is the only evidence that
 * settles anything on these pages, because the trap they document never throws.
 */
export function where(node){
	const path = [];

	for (let el = node; el && el.tagName !== "HTML"; el = el.parentElement)
		path.unshift(el.tagName.toLowerCase() + [...el.classList].map(cls => "." + cls).join(""));

	return (node.isConnected ? "" : "(detached) ") + path.join(" › ");
}

/* wait(ms, signal) — the artificial delay.
 *
 * There is no server here and there never will be: production is pure static
 * hosting, so "a slow API" is a static .json file plus a timer in the browser.
 * Every page that uses it says so, because a fake that pretends to be real is a
 * lie in a teaching document.
 */
export const wait = (ms, signal) => new Promise((resolve, reject) => {
	const timer = setTimeout(resolve, ms);
	signal?.addEventListener("abort", () => { clearTimeout(timer); reject(signal.reason); });
});

// The fake API. A real fetch of a real file, then a real delay. Nothing is mocked
// — it is simply slower than it needs to be, on purpose.
export async function items(ms = 700, signal){
	const response = await fetch(new URL("items.json", import.meta.url), { signal });

	if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

	const data = await response.json();
	await wait(ms, signal);

	return data;
}

/* probe() — the wrong-way snippet, as ONE function.
 *
 * /async/arrangements/ runs this from a tab panel, a column and a full page. One
 * function, three mounts, so the only variable is where the page lives — which is
 * the whole claim that page makes.
 */
export function probe(){
	const $landed = div.c("async-landed", "…probing");

	div.c("async-target", async () => {
		await wait(150);

		const $stray = div.c("async-orphan", "built after an await");

		$landed.text(where($stray.el));
		$stray.remove();
	});

	return $landed;
}

export { source };
