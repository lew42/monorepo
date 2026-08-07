import { Page, p, a, div } from "/app.js";
import { section } from "../../ui.js";
import { probe, snippet, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "Failing at depth",

	// boom throws · badimport's dependency 404s · ghost has no file at all
	children: "boom badimport ghost",

	/* …and anything else is mine to claim, including things I should not.
	 * route() runs synchronously and its return value goes straight to add(). */
	route(name){
		if (name === "number") return 42;                                    // not an options object
		if (name === "promise") return Promise.resolve({ title: "Async!" }); // async route()
		if (name === "nothing") return undefined;                            // a real decline
		return { title: `Claimed "${name}"`, content(){ p("A normal claim."); } };
	},

	content(){
		probe("the three ways a declared child can fail to arrive", async (log) => {
			const captured = [];
			const real = console.error;
			console.error = (...args) => { captured.push(args.map(String).join(" ")); real(...args); };

			for (const name of ["boom", "badimport", "ghost"]){
				const page = await Page.load(`/deep/errors/${name}/`);
				log(name.padEnd(10), page ? "resolved" : "null → 404");
			}

			console.error = real;

			log("");
			log("what Page.load() said about each:");
			captured.forEach(line => log("  ", line.slice(0, 150)));
			log("");
			log("Anything NOT listed above was classified as missing and logged nothing.");
		});

		p("`boom` throws, and `Page.load` says so — *'the file EXISTS but failed to load'*. `ghost` has no file and is correctly silent. `badimport` exists, fails, and is classified as missing — because the browser's message for a module whose dependency 404s names the module you asked for, and `Page.missing()` has only that string to go on.").ac("note");

		section("The regex cannot see the difference");

		snippet("Page.missing — the whole of the distinction", () => {
			class Honest extends Page {
				static missing(error){
					return /Failed to fetch dynamically imported module|error loading dynamically imported module|MIME type|Expected a JavaScript/i
						.test(error?.message ?? "");
				}
			}
		});

		p("A `page.js` with one bad import is now indistinguishable from a `page.js` that was never written — the exact confusion the comment above the method says it exists to prevent. The fix is not a better regex: it is to ask the network instead of the exception. `fetch(url, { method: 'HEAD' })` on the failure path answers *'is the file there?'* factually, at the cost of one request on an error you were already handling.").ac("note");

		section("route() has no failure mode at all");

		probe("give route() four bad answers and see what renders", async (log) => {
			const here = app.router.active;

			for (const name of ["number", "promise", "nothing", "fine"]){
				const page = await here.child(name);
				log(name.padEnd(8),
					page ? `Page  title="${page.title}"  content=${typeof page.content}` : "null → 404");
			}

			log("");
			log("`number` returned 42 and `promise` returned a Promise. Both became real");
			log("pages with a title and no content — Object.assign(this, 42) assigns");
			log("nothing and Object.assign(this, promise) assigns nothing either.");
			log("They render as a bare heading. Nothing warns, nothing throws.");
		});

		p("`route()` cannot be async. It is called synchronously and its result is handed to `add()`, which passes anything that is not a string, a function or a `Page` straight into `new Page(...)`. A promise has no own enumerable properties, so you get an empty page named after the url — which is the single most likely mistake anyone will make with this API, and it fails completely silently.").ac("note");

		section("Try them");

		div.c("row", () => {
			a.c("page-link", "boom (throws)").href("/deep/errors/boom/");
			a.c("page-link", "badimport").href("/deep/errors/badimport/");
			a.c("page-link", "ghost (no file)").href("/deep/errors/ghost/");
			a.c("page-link", "route → 42").href("/deep/errors/number/");
			a.c("page-link", "route → Promise").href("/deep/errors/promise/");
		});

		p("The first three each cost a full document reload: `go()` treats a failed load as *'not mine'* and calls `location.assign()`, the SPA fallback serves `index.html`, the app boots from scratch and finally renders the error page. Every bit of in-memory state is gone. Watch the `.stamp` values on `/deep/nesting/` before and after.").ac("note");

		whole(import.meta);
	}
});
