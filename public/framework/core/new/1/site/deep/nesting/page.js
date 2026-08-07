import { Page, p, a, div } from "/app.js";
import { section } from "../../ui.js";
import { probe, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "Deep nesting",

	children: "a",

	content(){
		probe("the chain diff, without navigating anywhere", async (log) => {
			// load_segments() walks and imports but does NOT activate — so the two
			// chains can be compared while you keep reading this page
			const e = await app.router.load_segments("/deep/nesting/a/b/c/d/e/");
			const e2 = await app.router.load_segments("/deep/nesting/a/b/c/d/e2/");

			log("e   ", e.chain().map(page => page.name ?? "root").join(" › "));
			log("e2  ", e2.chain().map(page => page.name ?? "root").join(" › "));
			log("shared_depth", app.router.shared_depth(e.chain(), e2.chain()), "of", e.chain().length);
		});

		p("`/deep/nesting/a/b/c/d/e/` is eight pages deep. Its sibling `e2` shares seven of them, so `Router.activate()` should touch exactly one page on the way over.").ac("note");

		section("Cold load — one module per level, and nothing else");

		probe("count the page modules this document has fetched", (log) => {
			performance.getEntriesByType("resource")
				.filter(entry => entry.name.endsWith("page.js"))
				.forEach(entry => log(new URL(entry.name).pathname));
		});

		p("Cold-load the leaf and this lists exactly the eight pages of its own chain. No sibling of any ancestor is fetched — `/deep/scale/`, `/deep/state/` and the other ten investigations cost nothing until you click them.").ac("note");

		section("Sideways at depth");

		probe("navigate e → e2 and come back, counting what it cost", async (log) => {
			const mods = () => performance.getEntriesByType("resource").filter(e => e.name.endsWith("page.js")).length;

			await app.router.go("/deep/nesting/a/b/c/d/e/");
			const cold = mods();

			await app.router.go("/deep/nesting/a/b/c/d/e2/");
			log("modules fetched by the sideways hop:", mods() - cold);

			// back to where you were reading — this output survived the round trip
			// because render() memoizes into this.view and nothing throws it away
			await app.router.go("/deep/nesting/");
			log("…and this log survived two navigations away and back.");
		});

		p("The hop costs one module — `e2`'s. Open `/deep/nesting/a/b/c/d/e2/` and its own probe prints every build stamp in the DOM: the six ancestors are stamped from before `e2` existed, so `shared_depth` is doing what it claims.").ac("note");

		section("Walk it by hand");

		div.c("row", () => {
			a.c("page-link", "a").href("/deep/nesting/a/");
			a.c("page-link", "…/e (8 deep)").href("/deep/nesting/a/b/c/d/e/");
			a.c("page-link", "…/e2").href("/deep/nesting/a/b/c/d/e2/");
		});

		whole(import.meta);
	}
});
