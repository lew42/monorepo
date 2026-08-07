import { Page, p, div, a } from "/app.js";
import { code, section } from "../../ui.js";
import { live, items, wait } from "../lab.js";

export default new Page({
	meta: import.meta,
	title: "Loading, empty, error",

	content(){
		/* Measured at first render, before anything is on screen. On a COLD load
		 * App.inject() has not run yet, so $app is still detached from <body>. On
		 * a soft navigation it has been attached since boot. */
		const cold = !this.app?.$app?.el.isConnected;

		/* Deliberate, and the whole point of the last section: a promise pushed
		 * into App.loaders. On a cold load NOTHING is injected until it resolves,
		 * so the skeletons below were never on screen. On a soft navigation this
		 * line does nothing whatsoever — loaded() is awaited once, during boot. */
		this.app?.loaders.push(wait(350));

		p("There is no server here. Production is static hosting, so every delay below is `setTimeout` in the browser and every payload is a static `items.json`. A fake that pretends to be real is a lie in a teaching document.");

		section("Loading → data");

		live(() => {
			div.c("async-results", async $panel => {
				$panel.append(() => { div.c("async-skeleton"); div.c("async-skeleton"); div.c("async-skeleton"); });

				const data = await items(900);

				$panel.empty(() => data.slice(0, 10).forEach(row => div.c("async-item", row.name)));
			});
		}, "the skeleton is placed synchronously; the data replaces it");

		section("Loading → empty");

		live(() => {
			div.c("async-results", async $panel => {
				$panel.append(div.c("async-skeleton"));

				const data = await items(700);
				const none = data.filter(row => row.kind === "nothing-matches-this");

				$panel.empty(() => none.length
					? none.forEach(row => div.c("async-item", row.name))
					: p("No results. That is an answer, not a failure — so it must not look like one."));
			});
		}, "empty is a result, not an error");

		section("Loading → error");

		live(() => {
			div.c("async-results", async $panel => {
				$panel.append(div.c("async-skeleton"));

				try {
					await items(600);
					throw new Error("the fake API said no");     // no server to fail for real
				} catch (error) {
					$panel.empty(() => p.c("error", "Could not load: " + error.message));
				}
			});
		}, "catch INSIDE the fill — see below for what happens if you don't");

		p("`try/catch` inside the callback is not politeness. An async capture callback returns its promise to `append_fn`, which passes it to `append_promise`, which awaits it in a method with no `catch` — so an uncaught throw becomes an unhandled rejection: a red console line, no error state on screen, and a box that stays a skeleton forever.").ac("note");

		section("How you arrived at this page");

		div.c("async-render", () => {
			const built_at = Math.round(performance.now());
			const $arrival = div.c("arrival async-landed", "…measuring");

			// A callback that only calls .text() — no factory call, so there is
			// nothing for the captor to lose. This is the discipline, used here.
			this.app?.ready.then(() => {
				const painted_at = Math.round(performance.now());

				$arrival.ac(cold ? "" : "ok").text(cold
					? `COLD · content built at ${built_at}ms · first paint at ${painted_at}ms · `
					  + `the window was BLANK for the first ${painted_at - built_at}ms of the skeletons' life`
					: `SOFT · content built at ${built_at}ms · $app was already painted · `
					  + `the skeletons were on screen from the first frame`);
			});
		});

		p("`Page.render()` caches `this.view`, so that reading is from the first time this page rendered. Reload this url to see the other branch.").ac("note");

		section("The asymmetry, and it is real");

		code(`
App.instantiate()
    config() → render() → await load() → initialize() → inject() → ready
                                 ↑                         ↑
                     loaders are awaited HERE      first paint happens HERE

so on a COLD load: nothing is on screen until every loader resolves
   on a SOFT nav:  $app is already in <body>, and loaded() is never awaited again`, "App.js");

		code(`
                          cold load                     soft navigation
first paint               after every loader resolves   already painted
the skeleton's first ms   INVISIBLE — a blank window    visible, from frame 1
push the FILL itself      skeleton never appears at all inert — nobody awaits`,
			"the same page, two arrivals");

		p("Careful with the second row, because it is the one that is easy to overstate: a cold load does not hide the skeleton, it hides the BEGINNING of it. Measured here — first paint at ~690ms with `wait(350)` in `loaders`, and the fills take 600–900ms, so the skeletons were still up and you did see them. Push the fill itself into `loaders` and you never would.").ac("note");

		p("This page pushes `wait(350)` into `app.loaders` on every render. On a cold load that genuinely delays first paint. On a soft navigation the array grows by one and nothing reads it — `loaded()` is called once, from `load()`, during boot. Measured: `app.loaders.length` is 1 after visiting this page by clicking, and that entry was never awaited.").ac("note");

		section("Bug, feature, or a decision?");

		code(`
feature      a cold load that paints once, complete, beats one that flashes a
             skeleton for 300ms — that is the no-FOUC guarantee, and it is good

bug          "push a promise and it is silently ignored" is not visible from the
             name. \`loaders\` reads like an ongoing collection. It is a one-shot
             first-paint queue, and only its comment says so

decision     how long a cold load may block before showing SOMETHING is the
             site's call, not the framework's — and it cannot be expressed today`);

		p("Verdict: the behaviour is right and the name is wrong. Renaming `loaders` to `first_paint` makes the inertness self-evident at the call site — pushing to `first_paint` after first paint obviously does nothing. The exact diff is in the report.").ac("note");

		a.c("page-link", "inflight →").href("/async/inflight/");
	}
});
