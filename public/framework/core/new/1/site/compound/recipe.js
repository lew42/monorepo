import { div, pre, p } from "/app.js";

/* What every recipe page needs, and nothing else.
 *
 * this_file() is the whole answer to "show the code that produced this page":
 * the page fetches its OWN module and prints it. There is no second copy of the
 * code anywhere — not a hand-typed string, not a stringified function — so
 * there is nothing that CAN drift. The only artifact is the file.
 */

// this module's own source, in the site's code box
export function this_file(meta){
	return div.c("code", () => {
		div.c("code-label", new URL(meta.url).pathname);

		// placed NOW, while the captor is still ours; filled when the fetch lands.
		// Nothing is ever built after the await — the <pre> already knows where it
		// lives and only its text arrives late.
		const $pre = pre();
		fetch(meta.url).then(res => res.text()).then(src => $pre.text(src.trimEnd()));
	});
}

// every recipe answers both, in one sentence each, or it is noise
export function when(text){ return p.c("note", "Reach for it when " + text); }
export function cost(text){ return p.c("note", "Cost — " + text); }
