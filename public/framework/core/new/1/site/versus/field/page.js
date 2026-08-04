import { Page } from "/app.js";
import { code, section } from "../../ui.js";
import { file, pair, verdict, ledger, measured, note } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "vs the field",

	content(){
		verdict("These are not competitors. React Router, Next, SvelteKit and Astro solve data loading, SSR, streaming and build-time splitting — problems new/1 has not met and has no answer to. new/1 does one thing none of them can: it needs no build step, so a page can be added to a deployed static site by uploading one file. Everything below says which claims I ran and which I merely know.");

		section("Epistemic status — read this first");

		code(`
MEASURED HERE   new/1's module counts, its serial walk, its 404-on-undeclared
                behaviour, and every CSS capability claim. Playwright, Chrome 151,
                against the dev server on :8300.

NOT RUN HERE    every single statement about React Router, Next, SvelteKit and
                Astro. No new npm dependency is permitted in this repo, so I could
                not install one, could not benchmark one, and did not.`, "what is evidence and what is knowledge");

		note("Where I say Next prefetches a route on hover, that is **knowledge of its documented behaviour**, not a number I produced. Treat every cross-framework number as absent rather than as measured — I have not put one on this page, deliberately.");

		section("The one thing new/1 does that none of them can");

		pair(() => {
			code(`
1. write  public/guide/page.js
2. add "guide" to the parent's children
3. upload the file

Done. No rebuild, no manifest, no
redeploy of anything else. The route
resolves because import() resolves.`, "new/1 — adding a page to a LIVE static site");

			code(`
1. write  app/guide/page.tsx
2. npm run build      ← regenerates the route manifest
3. redeploy the output

The filesystem is read at BUILD time.
A file uploaded to the CDN afterwards
is not a route.`, "Next / SvelteKit / Astro");
		});

		note("Both are “file-based routing”, and the difference is **when the filesystem is read**. Next resolves it once, into a manifest, at build time. new/1 resolves it per navigation, with `import(url + \"page.js\")`. That is the whole of why one needs a build and the other does not.");

		section("But “no registration anywhere” is not true of this tier — measured");

		file("/framework/core/new/1/Page.class.js", "async child(name){");

		measured("playwright — a real page.js the parent does not declare", `
created   site/versus/probe-undeclared/page.js      (valid Page, default export)
GET       /versus/probe-undeclared/page.js          200 — the server serves it
visit     /versus/probe-undeclared/                 404 — nothing matches

App.load: Error: 404 — nothing matches "/versus/probe-undeclared/"`);

		note("The file exists, the server returns it, and the Router refuses. `children.get(name)` returns `undefined` for a name nobody declared, and `undefined` means *not mine* — the filesystem is never consulted. **A page in new/1 is reachable because its parent named it, not because the file is there.**");

		note("CLAUDE.md's *“New pages are added by creating a `page.js` file; no registration anywhere”* describes `core/`, which imports straight from the url. new/1 traded that property away, and got the `route()` ordering and cost-free laziness for it. It is a good trade and it should be stated, because it changes the comparison above: **new/1 is one line of registration, not zero.** Still less than a route table, still more than nothing.");

		section("Concept mapping — where an idea from the field lands here");

		ledger(["the field", "new/1", "verdict"], [
			["Next `layout.tsx` — nested layouts per segment", "`this.$pages` + `container()`", "**closer than it looks, and new/1 is ahead on one axis**: Next re-runs a layout on navigation and preserves state through React; new/1 never touches the DOM node at all."],
			["Next parallel routes (`@slot`)", "`regions` — `tabs()` is literally this", "same idea, arrived at independently, ~15 lines instead of a compiler feature"],
			["Next route groups `(marketing)`", "a directory nobody declares", "free, and it falls out of the declaration rule rather than needing syntax"],
			["Next intercepting routes `(.)photo` — a modal at a url that also has a full page", "**not expressible**", "one url means one arrangement here. This is the same gap as *“swap without a url”* on `/versus/pager/`."],
			["Remix / SvelteKit `loader` — data resolved before render, parallel per segment", "**nothing**", "new/1's largest genuine gap. `content()` returns a promise and you hand-roll the rest, every time."],
			["`<Await>` / streaming SSR", "nothing", "no server, so no answer is even possible"],
			["Astro islands / zero-JS output", "**inverted** — new/1 is 100% JS, always", "for a content site this is the wrong side of the trade"],
			["typed links, build-time route checking", "nothing — a typo'd `children` name 404s at click time", "no build step means no build-time check; that is the same coin"],
			["prefetch on hover / viewport", "nothing", "cheap to add — `Page.load(url)` warms the module registry, and the walk would then hit it warm"],
		]);

		section("The serial walk — measured, and the one real perf finding");

		measured("playwright — page.js fetches on a COLD load of a 5-deep url", `
/deep/nesting/a/b/c/d/e/     8 modules
  / · deep · nesting · a · b · c · d · e

7 of 7 hops began strictly AFTER the previous response ended.
The walk is fully serial, and structurally cannot be otherwise:
load_segments() awaits child(name) before it knows what to ask for next.`);

		note("On localhost that is free. On a 100ms connection it is **eight round trips before first paint**, and it gets worse linearly with depth — exactly where a docs site lives. Next fetches a deep route's chunks in parallel from its manifest.");

		pair(() => {
			file("/framework/core/new/1/Router.js", "async load_segments(url){");
			code(`
// the fix, and it needs no new concept:
// every module url is derivable from the
// path BEFORE the walk starts.
async load_segments(url){
    const parts = url.split("/").filter(Boolean);

    // warm them all at once; the walk then
    // hits the module registry, not the wire
    parts.map((_, i) =>
        Page.load("/" + parts.slice(0, i + 1).join("/") + "/"));

    let page = this.app.root;
    for (const name of parts){
        page = await page.child(name);
        if (!page) return null;
    }
    return page;
}`, "sketch — speculative warm, nothing implements this");
		});

		note("Depth × RTT collapses to roughly one RTT. It is speculative — it fetches modules for segments that a `route()` might have claimed instead — so it wastes requests on dynamic urls, and it should be opt-in rather than default. **Framework request, and the only one on this page with a measured number behind it.**");

		section("Where new/1 is simply behind, no defence offered");

		code(`
SEO / no-JS      index.html is a shell. A crawler without JS sees an empty page.
                 Astro's entire thesis is the opposite of this one.

data            no loader, no cache, no per-route error boundary, no retry.
                Every page invents its own async story. See /async/.

scale           no types, no build-time check. A typo in children: "intro guide"
                is a 404 on click, in a browser, possibly in production.

a11y            a client-side swap announces nothing by itself. The field ships
                focus and live-region handling; new/1 ships two CSS classes. See /a11y/.`, "four things I would not argue about");

		section("The fair summary");

		note("new/1 is not a small Next. It is a **different product** that happens to share the word “router”: a client-side tree navigator for content that is already static, with the build step removed and the data layer never added. Judged as that, it is excellent. Judged as a Next replacement it fails on the first requirement anyone would bring.");

		section("Next");

		note("`/versus/lines/` — what 265 includes, and where the complexity actually went.");
	}
});
