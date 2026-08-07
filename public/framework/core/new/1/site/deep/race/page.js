import { Page, p, a, div } from "/app.js";
import { Router } from "/framework/core/new/1/Router.js";   // referenced by the proposed-fix snippet
import { section } from "../../ui.js";
import { probe, snippet, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "Open #4 — racing navigations",

	// how long each of my children takes to resolve. Userland: `assign` puts
	// this on the instance and nothing in the framework knows it exists.
	delays: { slow: 400, fast: 20 },

	/* An artificial import delay, in the one place a real one would happen.
	 * Overriding child() on the INSTANCE is ordinary userland — the constructor
	 * is assign-based, so this shadows the prototype and calls back into it.
	 * Repeatable, unlike a slow module: a module resolves once and is cached,
	 * so a top-level `await` reproduces this exactly once per document. */
	async child(name){
		if (this.delays[name]) await new Promise(resolve => setTimeout(resolve, this.delays[name]));
		return Page.prototype.child.call(this, name);
	},

	route(name){
		return {
			title: `Resolved "${name}"`,
			content(){
				p(`I took ${name === "slow" ? "400" : "20"}ms to resolve.`);
				a.c("page-link", "← back").href("/deep/race/");
			}
		};
	},

	content(){
		probe("click slow, then fast 20ms later — and land on slow", async (log) => {
			const original = app.router.activate.bind(app.router);
			app.router.activate = page => { log("  activate →", page.url); return original(page); };

			log("click 1 → /deep/race/slow/  (400ms)");
			app.router.go("/deep/race/slow/");

			await new Promise(resolve => setTimeout(resolve, 20));
			log("click 2 → /deep/race/fast/  (20ms)");
			app.router.go("/deep/race/fast/");

			await new Promise(resolve => setTimeout(resolve, 700));
			app.router.activate = original;

			log("");
			log("you asked for  /deep/race/fast/   (it was the last click)");
			log("url is         ", location.pathname);
			log("router.active  ", app.router.active.url);

			await app.router.go("/deep/race/");   // back, so you can read this
		});

		p("Two clicks, and the one you did not make wins. `Router.load()` has no idea another load is in flight, so the slower walk activates second and overwrites the faster one — url, DOM and history all agree, and all three are wrong.").ac("note");

		section("Why it is not worse than it looks");

		p("The DOM does not corrupt. Each `activate()` diffs against `this.active` at the moment it runs, so the second one deactivates `fast` and mounts `slow` correctly — the tree is consistent, it is just showing the wrong page. The damage is a wrong destination and a history entry in click order rather than intent order, not a broken document.");

		section("The smallest fix, and what it costs");

		snippet("Router — three lines, and one new branch at the call site", () => {
			class Guarded extends Router {

				async load(url){
					const token = this.token = {};                    // 1
					const page = await this.load_segments(url);

					if (token !== this.token) return "superseded";    // 2

					if (page) this.activate(page);
					return page ? "loaded" : "missing";               // 3 — no longer a boolean
				}

				async go(url){
					const result = await this.load(url);

					if (result === "loaded") history.pushState({}, "", url);
					else if (result === "missing") location.assign(url);
					// "superseded" — do nothing. Another navigation owns the url.
				}
			}
		});

		p("The three lines are cheap. The cost is the fourth: `load()` stops returning a boolean, because *superseded* is not *missing* and must not fall through to `location.assign()` — which would turn a fast double-click into a full page reload. That is the whole price, and I think it is worth paying.").ac("note");

		section("Fire it by hand");

		div.c("row", () => {
			a.c("page-link", "slow (400ms)").href("/deep/race/slow/");
			a.c("page-link", "fast (20ms)").href("/deep/race/fast/");
		});

		p("Click slow then immediately fast. You will watch `fast` render and then be replaced.").ac("note");

		whole(import.meta);
	}
});
