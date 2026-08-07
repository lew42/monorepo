import { Page, p, a, div } from "/app.js";
import { Router } from "/framework/core/new/1/Router.js";   // referenced by the proposed-fix snippet
import { section } from "../../ui.js";
import { probe, snippet, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "Back and forward at depth",

	content(){
		probe("walk eight levels deep, then Back all the way out", async (log) => {
			const urls = ["/deep/nesting/a/", "/deep/nesting/a/b/", "/deep/nesting/a/b/c/",
			              "/deep/nesting/a/b/c/d/", "/deep/nesting/a/b/c/d/e/"];

			for (const url of urls) await app.router.go(url);

			const leaf = () => document.querySelector(".active-page .page-title")?.textContent;
			log("forward:", leaf(), "· url", location.pathname);

			for (let i = 0; i < urls.length; i++){
				history.back();
				await new Promise(resolve => setTimeout(resolve, 120));
				log("back →", (leaf() ?? "—").padEnd(14), "url", location.pathname,
					location.pathname === app.router.active.url ? "" : "  ← MISMATCH");
			}

			log("");
			log("popstate takes a different path than a click: no pushState, no");
			log("location.assign fallback, no return value anyone reads.");
		});

		p("Every step agrees. `Router.load()` is the same walk either way, and because `go()` pushes only after a successful load, the entry you go Back to is always one that resolved.").ac("note");

		section("…until an entry stops resolving");

		probe("put a url in history that does not resolve, then go Back to it", async (log) => {
			await app.router.go("/deep/history/");

			// exactly what a bookmark, a redirect, or a deleted page.js produces:
			// a history entry the Router never validated
			history.pushState({}, "", "/deep/history/nowhere/");
			log("pushed  /deep/history/nowhere/  (nothing declares it)");

			await app.router.go("/deep/history/");
			log("then went to /deep/history/, so nowhere/ is one Back away");

			history.back();
			await new Promise(resolve => setTimeout(resolve, 400));

			log("");
			log("address bar   ", location.pathname);
			log("router.active ", app.router.active.url);
			log("showing       ", document.querySelector(".active-page .page-title")?.textContent);
			log("agree?        ", location.pathname === app.router.active.url ? "yes" : "NO — the url and the DOM disagree");
			log("");
			log("Nothing threw. No error page. Reload now and you get the 404 screen");
			log("for a page you are apparently already on.");

			history.forward();
			await new Promise(resolve => setTimeout(resolve, 200));
		});

		p("`go()` handles a failed load by handing the url to the browser. `popstate` has no such branch — it calls `load()` and discards the boolean. The url has *already* changed by the time the handler runs, so a failure leaves the address bar pointing at one page and the document showing another, permanently and silently.").ac("note");

		section("The fix is the branch that already exists");

		snippet("Router.listen — popstate needs the same 'else' click has", () => {
			class Consistent extends Router {
				listen(){
					document.addEventListener("click", e => this.click(e));

					window.addEventListener("popstate", async () => {
						if (await this.load(location.pathname)) return;

						// the entry is real to the browser and not to us. Reloading is
						// the honest outcome — it is what a fresh visit would do.
						location.reload();
					});
				}
			}
		});

		p("One line, and it costs a reload on an event that should not happen. The alternative — render `app.error()` in place — keeps the SPA alive but leaves a history entry that will fail again on every Back. I would take the reload.").ac("note");

		section("Do it by hand");

		div.c("row", () => {
			a.c("page-link", "8 levels deep").href("/deep/nesting/a/b/c/d/e/");
			a.c("page-link", "a tab set").href("/tabs/guide/");
			a.c("page-link", "a full page").href("/deep/chrome/");
		});

		p("Walk into all three, then hold Back. Compound arrangements go out the way they came in — the chain diff has no memory of *how* a page became active, only of which pages are in the chain.").ac("note");

		whole(import.meta);
	}
});
