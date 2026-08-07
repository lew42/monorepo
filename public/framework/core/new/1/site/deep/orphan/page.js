import { Page, p, a, div } from "/app.js";
import { section } from "../../ui.js";
import { probe, snippet, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "Open #5 — activate() on its own",

	children: "region",

	content(){
		probe("call activate() on a page nothing ever adopted", async (log) => {
			// /deep/orphan/lonely/ is a real file that no url reaches — nothing
			// declares it, so it has never been through child() and has no .app
			const lonely = (await import("/deep/orphan/lonely/page.js")).default;

			log("lonely.url   ", lonely.url, "  ← naming() worked, it read import.meta");
			log("lonely.parent", lonely.parent ?? "undefined");
			log("lonely.app   ", lonely.app ?? "undefined");
			log("");

			try { lonely.activate(); log("mounted"); }
			catch (error){ log(`activate() THREW  ${error.constructor.name}: ${error.message}`); }

			log("");
			log("container() walks .parent for a $pages, finds no parent at all,");
			log("and falls through to `this.app.$pages` — which is the throw.");
		});

		p("The readme says a directly-called `activate()` *'mounts alone, silently'*. That is the good case. With no ancestors at all it does not mount, it throws — and the message names neither the page nor the reason.").ac("note");

		section("The silent case is the worse one");

		probe("a properly-walked page, activated outside the Router", async (log) => {
			const before = document.querySelectorAll(".page").length;

			// load_segments walks and adopts but does NOT activate — so this page
			// has parent, app, url, everything. It is only unmounted.
			const page = await app.router.load_segments(`/deep/scale/orphan-${Date.now()}/`);

			page.activate();

			log("activate() returned normally, no error, nothing thrown.");
			log("");
			log(".page nodes  ", before, "→", document.querySelectorAll(".page").length);
			log("mounted into ", page.view.el.parentElement.className);
			log("classes      ", page.view.el.className);
			log("visible      ", page.view.el.offsetParent !== null);
			log("router.active", app.router.active.url, "← unchanged");
			log("document.title", document.title, "← unchanged");
			log("");
			log("A DOM node nothing will ever remove, that nothing can ever show.");
		});

		section("And the reason it works inside the Router");

		probe("an ancestor's region does not exist until the ancestor renders", async (log) => {
			log("first run only — after this, region has rendered and lands correctly");
			log("");

			// which .pages did it land in — the app's, or the region page's?
			const owner = page => page.view.el.parentElement.closest(".page")?.className.match(/page-\w+/)?.[0] ?? "app.$pages";

			const inner = await app.router.load_segments("/deep/orphan/region/inner/");

			log("parent has rendered?", !!inner.parent.$pages);
			inner.activate();
			log("inner mounted inside", owner(inner));

			await app.router.go("/deep/orphan/region/inner/");
			log("after a real navigation:", owner(inner));

			await app.router.go("/deep/orphan/");
		});

		p("`container()`'s walk asks *'did an ancestor claim this subtree?'* by reading `$pages`, which a page only assigns while rendering. `Router.activate()` iterates root-to-leaf, so every ancestor has rendered by the time a child asks — the invariant holds, but it is held by the caller, not by the method. Call it yourself and the same page mounts somewhere else.").ac("note");

		section("Is it worth machinery? No.");

		snippet("what a guard would look like — and why I am not asking for it", () => {
			class Guarded extends Page {

				activate(){
					if (!this.app)
						throw new Error(`${this.log_label()}.activate() — never adopted; navigate with router.go()`);

					if (this.parent && !this.parent.view)
						console.warn(`${this.log_label()}.activate() — my ancestors are not mounted`);

					return Page.prototype.activate.call(this);
				}
			}
		});

		p("Two branches on the hot path of every page in every chain, to defend against a call the framework itself never makes. My verdict: theoretical, leave it open — but say so in the doc comment above `activate()`, because *'Router calls this root-to-leaf'* reads as a description and is actually a precondition.").ac("note");

		section("Walk the region properly");

		div.c("row", () => {
			a.c("page-link", "region").href("/deep/orphan/region/");
			a.c("page-link", "region/inner").href("/deep/orphan/region/inner/");
			a.c("page-link", "lonely (404s — nothing declares it)").href("/deep/orphan/lonely/");
		});

		whole(import.meta);
	}
});
