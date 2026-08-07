import { Page, p } from "/app.js";

/* A real page.js that no url can reach: nothing declares "lonely" as a child,
 * and my parent has no route(). The router 404s /deep/orphan/lonely/ and it is
 * right to — the filesystem is not the registry, declarations are.
 *
 * Which makes me the one page guaranteed never to have been adopted, and that
 * is what /deep/orphan/ needs to reproduce Open #5 deterministically. */
export default new Page({
	meta: import.meta,
	title: "Never adopted",

	content(){
		p("If you are reading this, something adopted me after all.");
	}
});
