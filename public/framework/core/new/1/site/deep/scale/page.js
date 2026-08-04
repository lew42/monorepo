import { Page, p, a, div } from "/app.js";
import { section } from "../../ui.js";
import { probe, whole } from "../probe.js";

export default new Page({
	meta: import.meta,
	title: "Scale",

	// Every segment under me is mine. No files, no declarations, no upper bound.
	route(name){
		return {
			title: `Row ${name}`,
			content(){
				p(`Built by \`route("${name}")\` at the moment you asked for it. There is no file behind this url and there never will be.`);
				a.c("page-link", "← back to Scale").href("/deep/scale/");
			}
		};
	},

	content(){
		probe("visit 200 addressable urls, then count what is left behind", async (log) => {
			const heap = () => performance.memory
				? (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + " MB"
				: "unavailable";

			const scale = app.router.active;
			const t0 = performance.now(), heap0 = heap();

			// load(), not go() — 200 history entries would make Back useless
			for (let i = 0; i < 200; i++) await app.router.load(`/deep/scale/row-${i}/`);

			await app.router.load("/deep/scale/");   // back, so you can read this

			log("elapsed        ", (performance.now() - t0).toFixed(0), "ms for 200 navigations");
			log("per navigation ", ((performance.now() - t0) / 200).toFixed(2), "ms");
			log("modules fetched", 0, "— route() never touches the network");
			log("");
			log("children Map   ", scale.children.size, "Page objects, none of them releasable");
			log(".page nodes    ", document.querySelectorAll(".page").length, "in the DOM");
			log("heap           ", heap0, "→", heap());
		});

		p("`route()` costs nothing to *reach* — zero modules for any number of urls. What it costs is everything it leaves behind: `render()` memoizes into `this.view` and `children` never drops a key, so 200 visits is 200 live `Page` objects and 200 `.page` nodes, hidden by CSS and held forever.").ac("note");

		section("What it actually costs: every navigation, forever");

		probe("time one hop between two built pages, as the mount count grows", async (log) => {
			// a hop between two pages that already exist — no import, no render,
			// nothing but the chain diff and mark(). This should be constant.
			const hop = async () => {
				const times = [];
				for (let i = 0; i < 40; i++){
					const t = performance.now();
					await app.router.load(i % 2 ? "/deep/scale/ping/" : "/deep/scale/pong/");
					times.push(performance.now() - t);
				}
				return times.sort((a, b) => a - b)[20].toFixed(2);   // median
			};

			log("mounted   median hop   links mark_links() rescans");
			let built = 0;

			for (const n of [0, 250, 1000]){
				while (built < n) await app.router.load(`/deep/scale/x${++built}/`);
				log(String(document.querySelectorAll(".page").length).padStart(7),
					String(await hop()).padStart(11), "ms",
					String(document.querySelectorAll("a[href]").length).padStart(10));
			}

			await app.router.load("/deep/scale/");
			log("");
			log("The hop does no work that depends on how many pages exist — and gets");
			log("slower anyway. Measured 0.2ms at 3 mounted, 5.7ms at 3005.");
		});

		p("`Router.mark()` runs two `querySelectorAll` sweeps over the whole `$app` subtree on every navigation — one to wipe the two classes, one over every `a[href]` in the document. Both scale with everything you have ever visited, so a page you looked at once and will never see again keeps taxing every future click.").ac("note");

		p("This is the honest cost of never releasing pages, and it is not the heap — 1000 route() urls cost 0.6 KB each. It is 5000 hidden DOM nodes that every navigation walks twice.").ac("note");

		section("Try a few by hand");

		div.c("row", () => [1, 42, 137, 999].forEach(n =>
			a.c("page-link", `row-${n}`).href(`/deep/scale/row-${n}/`)));

		whole(import.meta);
	}
});
