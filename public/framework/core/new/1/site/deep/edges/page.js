import { Page, View, p, a, div } from "/app.js";
import { Router } from "/framework/core/new/1/Router.js";   // referenced by the proposed-fix snippet
import { section } from "../../ui.js";
import { probe, snippet, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "Four edges nobody had looked at",

	initialize(){
		this.add("bomb", {
			title: "content() throws",
			content(){ throw new Error("content() threw — and nothing above me is catching"); }
		});

		this.add("query", () => {
			p("Check the address bar. Whatever you put after the `?` is gone.");
			a.c("page-link", "← back").href("/deep/edges/");
		});
	},

	content(){
		section("1 · There is no error boundary after boot");

		probe("navigate to a page whose content() throws", async (log) => {
			const before = { url: location.pathname, showing: document.querySelector(".active-page .page-title")?.textContent };

			try { await app.router.go("/deep/edges/bomb/"); log("go() resolved normally"); }
			catch (error){ log(`go() REJECTED  ${error.constructor.name}: ${error.message}`); }

			log("");
			log("url     ", location.pathname, location.pathname === before.url ? "(unchanged)" : "(changed)");
			log("showing ", document.querySelector(".active-page .page-title")?.textContent);
			log("router.active", app.router.active.url);
			log("");
			log("Caught here only because this probe wrapped it. Router.click() does not:");
			log("click → go() → an unhandled promise rejection, and a click that did nothing.");
		});

		p("`App.load()`'s `try` covers the root import and the first navigation — deliberately, and the comment says why. Every navigation after that has no handler anywhere. A `content()` that throws produces an unhandled rejection, a link that silently does nothing, and a `render()` whose `console.groupCollapsed` is never closed, so every log line for the rest of the session is nested inside it.").ac("note");

		snippet("the fix is where the try already is — one level down", () => {
			class Guarded extends Router {
				async go(url){
					try {
						if (await this.load(url)) return history.pushState({}, "", url);
						location.assign(url);
					}
					catch (error){ this.app.error(error); }   // the same screen boot already renders
				}
			}
		});

		p("`App.error()` already exists, already renders into `$pages`, and already keeps the chrome. It just has no caller after boot.").ac("note");

		section("2 · The Router drops everything but the path");

		probe("click a link with a query string", async (log) => {
			log("Router.click() does: this.go(link.pathname)");
			log("");
			// a raw element, not a factory — a factory would auto-append to
			// whatever the captor is by the time you press Run
			const link = document.createElement("a");
			link.href = "/deep/edges/query/?sort=name&page=3#results";

			log("href     ", link.getAttribute("href"));
			log("pathname ", link.pathname, "  ← the only part go() receives");
			log("search   ", link.search, "  ← never read");
			log("hash     ", link.hash, "     ← never read");

			await app.router.go("/deep/edges/query/");
			log("");
			log("after navigating:", location.pathname + location.search);
			await app.router.go("/deep/edges/");
		});

		p("A `?sort=name` on any in-app link is silently discarded, and so is a `#section` when the link points at a different path. Worse the other way: `router.go('/x/?a=1')` passes the whole string to `load_segments()`, which splits it on `/` and looks for a child literally named `x?a=1` — a guaranteed 404, and therefore a full document reload via the `location.assign` fallback.").ac("note");

		snippet("click() — navigate the whole url, resolve only the path", () => {
			class Complete extends Router {
				click(e){
					const link = this.link_clicked(e);
					if (!link) return;

					e.preventDefault();
					this.go(link.pathname + link.search + link.hash);
				}

				// load() resolves against the PATH only; the rest is the browser's
				async load(url){
					return super.load(new URL(url, location.origin).pathname);
				}
			}
		});

		section("3 · Three collections that only grow");

		probe("count them, go somewhere, count again", async (log) => {
			const count = () => [app.loaders.length, View.stylesheets.length, document.querySelectorAll(".page").length];
			const before = count();

			// /tabs/ pushes a `filling` promise onto app.loaders every time
			for (const url of ["/tabs/", "/tabs/guide/", "/deep/scale/row-1/", "/deep/edges/"])
				await app.router.go(url);

			const after = count();

			log("                  before  after");
			log("app.loaders      ", String(before[0]).padStart(6), String(after[0]).padStart(6), " ← settled promises nobody awaits again");
			log("View.stylesheets ", String(before[1]).padStart(6), String(after[1]).padStart(6));
			log(".page nodes      ", String(before[2]).padStart(6), String(after[2]).padStart(6), " ← views, never removed");
			log("");
			log("Run it again. None of the three ever goes down.");
		});

		p("`App.loaded()` awaits `loaders` exactly once, at boot. After that every `tabs()` call pushes another settled promise onto an array nobody reads again. Harmless in isolation; it is on the list because it is the shape of a leak, and because `View.stylesheets` has the same shape with a second consequence — see below.").ac("note");

		section("4 · A lazily-imported stylesheet is never awaited");

		probe("when did this section's stylesheet load", (log) => {
			const sheets = performance.getEntriesByType("resource").filter(e => e.name.endsWith(".css"));
			sheets.forEach(entry => log(new URL(entry.name).pathname.padEnd(46), entry.startTime.toFixed(0) + "ms"));
			log("");
			log("first paint (App.inject) happened at roughly the boot stylesheets' time.");
			log("Anything below that line arrived after the page was already on screen.");
		});

		p("`View.stylesheet()` is awaited by `App.loaded()` at boot. A page imported later — which is every lazy page, the whole point of new/1 — appends its `<link>` after first paint, so it renders unstyled for a frame or two. `/deep/deep.css` and `ext/highlight`'s stylesheet both arrive this way. The fix is `container()`-shaped: `Router.load()` could await `app.loaded()` before `activate()`, which costs one await on the navigation path and nothing else.").ac("note");

		section("Try the first two by hand");

		div.c("row", () => {
			a.c("page-link", "bomb (throws in content)").href("/deep/edges/bomb/");
			a.c("page-link", "?sort=name&page=3").href("/deep/edges/query/?sort=name&page=3");
		});

		p("The first does nothing at all — no error, no navigation, no console output you would notice. That is the defect.").ac("note");

		whole(import.meta);
	}
});
