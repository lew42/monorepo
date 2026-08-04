import { Page, md, demo } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Top-down loading",
	description: "Option B — load the path root-first. Deletes the ancestor climb and unlocks dynamic routes, nested readmes, and routed tabs.",
	col: "wide",

	content(){

		md("**This is the big one.** It answers three separate wishes with one change, and it deletes more code than it adds.");

		md("### Today: bottom-up");

		demo(() => {
			// Page.load("/a/b/c/")
			//   1. import /a/b/c/page.js          ← the target, alone
			//   2. load_ancestors(): climb UP
			//        import /a/b/page.js
			//        import /a/page.js            ← stop: found a layout
			//   3. host() walks .parent links back down
		}, "The target loads first and then we climb backwards looking for context. `load_ancestors` + `parent_url` + the `catch { break }` all exist to make that climb terminate.");

		md("### Proposed: top-down");

		demo(() => {
			// Page.load("/a/b/c/")
			//   every prefix is known from the string, immediately:
			//     /page.js  /a/page.js  /a/b/page.js  /a/b/c/page.js
			//   import them ALL AT ONCE, tolerate misses, keep the deepest hit
		}, "Ancestors arrive by construction. There is nothing to climb, so `load_ancestors()`, `parent_url`, and the whole `catch { break }` termination problem disappear.");

		md("**It is also faster.** The current climb is a sequential `await` loop — each import waits for the last. Top-down knows every candidate URL from the path string before it fetches anything, so it's one `Promise.allSettled`. A four-deep page goes from four round-trips to one.");

		md("### What it unlocks");

		md("Once a page is loaded *before* its descendants, it can be asked what to do with the rest of the path. One new optional hook:");

		demo(() => {
			// /path/comments/page.js
			//
			// export default new Page({
			//     meta: import.meta,
			//     title: "Comments",
			//
			//     // called with the segments no page.js claimed: ["0", "4"]
			//     route(rest){
			//         return new Page({ title: `Comment ${rest[0]}`, content(){ … } });
			//     }
			// });
		}, "No `route()` → leftover segments are a 404, exactly as today. That's the whole API addition: one optional method.");

		md("#### 1. Magic routes — `/path/comments/0/4/`");

		md("`/path/page.js` and `/path/comments/page.js` load. `0/4/` matches no file, so `comments` gets `route([\"0\",\"4\"])` and returns a Page it built on the spot. **Each path segment handles its own routing from there** — which is what you asked for.");

		md("#### 2. A readme that opens another readme in a new column");

		demo(() => {
			// route(rest){
			//     return new Page({
			//         title: rest[0],
			//         content(){ return md.file(import.meta, rest[0] + ".md"); }
			//     });
			// }
		}, "A synthesized Page is a real Page — it has a url, it lands in `leaf().chain`, and ColumnPager renders it as a column with no changes at all. Nested readmes fall out of the routing change; they don't need their own feature.");

		md("#### 3. Routed tabs");

		md("A `TabPager` topic claims one segment: `/docs/api/install` selects the *install* tab, and the tab links become ordinary URLs the Router already intercepts. Today `TabPager` is in-page only, because there's no way for it to see a segment.");

		md("### The honest costs");

		md(`| cost | severity |
|---|---|
| every load imports N modules, not 1 | **low** — parallel, and deep loads already did N |
| a miss at any level is a 404 fetch | **low** — cacheable, and the dev server 404s \`.js\` fast |
| \`route()\` is new API surface | **real** — it's the one thing that can grow ugly |
| synthesized Pages have no \`import.meta\` | **real** — they need an explicit \`url\` |`);

		md("That last one deletes a decision we just made: the `url` setter was removed as dead code. Top-down brings it back, because a runtime-built Page has no `import.meta` to derive from. That's fine — but it should come back **with a caller**, not on spec.");

		md("### Verdict");

		md("**Worth doing, and it's the change that makes `Page` simple rather than just smaller.** It removes ~25 lines of the most fragile code in the class, makes loading parallel, and turns three separate feature requests into consequences of one idea.");

		md("The thing to design carefully is `route()`. Everything else is mechanical. Suggested order: (1) top-down loading with **no** `route()` — pure refactor, behaviour identical, ancestors just arrive differently; (2) add `route()` once there's a real caller.");

		md("Splitting it that way means step 1 can land and be verified against every existing page without any new API at all.");
	}
});
