import { details, summary } from "/app.js";
import { code } from "/framework/ext/highlight/highlight.js";

/* The page prints its own source, verbatim, from the file the browser loaded.
 *
 * This is the council standard — two other seats arrived at fetch(import.meta.url)
 * independently — and it is the only form that structurally cannot drift: it is
 * not a copy of the code, it IS the code, fetched from the url the module system
 * fetched it from. `code.file()` is that fetch, with highlighting and a cache.
 *
 * Collapsed, because it is VERIFICATION, not teaching. The demo() boxes above it
 * are what a reader learns from — code and its result in one box, so neither can
 * be read without the other. This is what they check those boxes against.
 *
 * code.file() returns a promise built with capture:false, so append_promise
 * places it. Nothing here is built after an await.
 */
export function this_file(meta){
	return details(() => {
		summary("the source of this page");
		return code.file(meta, "page.js");
	});
}

export default this_file;
