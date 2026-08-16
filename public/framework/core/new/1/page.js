import { Doc, md, code } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "new/1",
	description: "Where the shipping design was proved. Router.js here is line-for-line what's in core/Router/ — this is the long-form record, with measurements.",
	icon: "verified",

	files: "App.js Page.class.js Router.js server.js readme.md",

	content(){

		md("**This is the prototype `core/App`, `core/Page` and `core/Router` were proved on.** Three classes, 265 lines. `Router.js` is line-for-line the one that shipped; `children`-as-a-Map, `container()` and `Router.mark()` all went to `core/` unchanged. Read the readme here as the long form of `core/App/readme.md`, `core/Page/readme.md` and `core/Router/readme.md` — it carries the measurements and the council round those summarise.");

		code.js(`undefined   not a child of mine        -> 404
null        declared, not loaded yet   -> import it
Page        here                       -> use it`);

		md("**There is no `mode`.** Earlier drafts resolved `mode: \"columns\" | \"full\"` down the chain and wrote it as `data-mode` on `.app`. Gone — `classes: \"full\"` / `classes: \"cols\"` are just class names a page opts into, read only by its own stylesheet. `container()` still walks (two levels: a named `regions` claim, then a subtree `$pages` claim) and is the one piece of black magic kept on purpose — ten of the council's compound recipes needed it to do something non-default.");

		md("Tabs need no new class and no per-tab directory: `tabs(\"what why\")` returns a view you place and class, and which children are tabs is decided at **placement**, not marked on the child. `route()` runs after the declaration, not after the filesystem, so only declared names ever cost a network request and a dynamic url can't shadow a real file.");

		md("`agents/` (reachable at [/site/council/](/framework/core/new/1/site/council/) when the dev server for this tier is running) is fourteen independent seats' design records — agreement between two that couldn't read each other is evidence. The readme's ranked list — six seats independently wanted \"something after a navigation\", built as `App.navigated`, not `Page.entered()` — is the single most-cited outcome.");

		md.details(import.meta, "readme.md", "The full record: the council round, the motion contract, all Measured numbers, and Open");
	}
});
