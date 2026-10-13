# library-page notes

## The frame: why iframe instead of rendering in-document

A tile is an `<iframe>` at the real url, shrunk with `zoom`. Not a clone of the page and not a screenshot — the document a visitor gets, running.

Rendering a second copy IN this document was tried first, and cannot work:

1. `import()` is memoised, so `/full/left/page.js` hands every caller the SAME Page. Measured. A second tree would `add()` those shared pages and reassign `.parent` on the live ones — two trees, one set of leaves.
2. `.page { display: none }` until the Router marks it, and a page rendered outside the chain is never marked. Measured: 0x0.
3. `.full` is `position: fixed; inset: 0`, and a `zoom`ed ancestor does NOT contain it. Measured — it still covers the window, so one tile would black out the gallery.
4. The inner layout wants a desktop viewport; a frame has its own.

A document answers all four by being a document. The page is genuinely the leaf of its own chain, so it is `.active-page` and there is no CSS to fight; and it is the url that makes it, which is this framework's whole claim.

## The one content, arranged eight ways

Every recipe gets these same three children — the same function object, not a copy — so a recipe differs from its variants in exactly one thing: how it arranges them. That is the claim this library exists to show, and identity makes it checkable instead of merely stated.

## The switcher: one navigation idea worth stealing

```
/library/cols/two/   ->   /library/tabs/two/
 ^ arrangement ^ place      ^ changed    ^ kept
```

A url here is two independent facts, and the switcher varies exactly one of them. That is what makes these variants rather than eight unrelated demos.

There is no selected-state code anywhere, and no "current variant" to store: every entry is a real url, so `Router.mark_links()` writes `.active` on the one that matches — the same pass that lights the sidebar. Reload-identical for free, because the state IS the url.

`.row` for layout and `.tab` for the look, both the site's own. Deliberately NOT `.tab-bar`: its `:not(:has(.tab.active)) > .tab:first-child` fallback would light a wrong entry on any url this bar does not contain.

Rendered by the CHILD, never the arrangement — only the child knows the place to keep. That is also why every gallery tile opens a child rather than an arrangement root: you land where the switcher works.

## route() vs initialize() + add()

`route()`, not `initialize()` + `add()`. An inline page's `initialize()` runs inside its OWN constructor — before the `add()` that gives it a parent — so a grandchild built there derives its url from a parent that has none yet, and lands on "undefinedone/". `route()` runs on the walk, after adoption, when `this.url` is real. Written up as a framework request.

## The recipes

`arrange(page)` does the ONE thing that differs — make the region, class it — and returns the view that page's own notes go into. Everything else is identical across all eight, which is the point.

The source printed under each recipe is `source(arrange)`: the very function that just ran. There is no second copy to fall out of date, which is the only thing that makes a code sample on a live page worth reading.

It takes `page` rather than using `this` for two reasons. It reads better — the thing being arranged is named — and `util/source` mis-slices a `function(){}` whose body contains an arrow: it looks for the FIRST `=>` and finds the nested one, printing a fragment that starts mid-expression. Three of these were displaying wrongly before it was caught. A top-level arrow is cut correctly. One-line fix proposed in the report.

### The arrangement's own page

The arrangement's own page carries the SOURCE; its children carry the switcher. Both, on one page, would be the same bar twice in the seven arrangements that keep the parent on screen beside the child.

### Recipe comments: design details

Eight functions, none longer than three lines. Each is printed verbatim on the page it arranges.

**Replace recipe**: I claim no region, so my children land in app.$pages as my SIBLINGS — and CSS takes me off screen, because I do not contain the leaf.

**Columns recipe**: One utility class on a div IS the arrangement. My own content goes in first, so I am column 1 rather than a header above the columns.

**Tabs recipe**: A bar of links and the panel they mount into. Which children are tabs is decided HERE, at placement — nothing on a child says "I am a tab".

**Full recipe**: `classes: "full"` positions me over the window; the region keeps my children inside me, one at a time. A full page MUST claim a region — with none, a child mounts in app.$pages BEHIND the overlay and is simply invisible. See the report: one `:has()` in the site's CSS.

**Columns in full recipe**: The thing one `mode` property could never express: covering the window and arranging a subtree are answers to different questions, so they live on different elements and never compete.

**Tabs in columns recipe**: Two claims at once: `regions` takes the two named tabs, `$pages` takes whatever is left. `three` is in no bar, so it lands as a second column.

**Master / detail recipe**: `.cols` with the first track pinned instead of equal — the one line of CSS this library adds that the site could not already provide.

**Drill-down recipe**: Every level claims nothing, so `container()` walks past all of them to MY region and they land as siblings — one grid, however deep you go.

## Deeper function: unbounded depth

One function, unbounded depth. Each level hands the SAME `route()` to the level below, so `/library/drill/a/b/c/d/` resolves with no files and no declarations — and every level lands in drill's region as one more column.

### Switcher depth limit

A switcher can only keep a place that EVERY arrangement can express. `drill` claims any name; the other seven claim one, two and three — so at the first level the place survives the hop, and below it the bar can only offer the arrangements themselves. That is the real limit on this pattern, and saying it is better than quietly linking to urls that would 404.

## The gallery: tiles as live previews

A tile is `.page-preview` — the framework's own card, border and hover — with a live document inside it instead of a title. That is exactly what `preview()` would become if this were a framework feature; the report has the signature.

## Alternates: the curation strategy

The rest of a kind: real urls, NOT mounted. `preview()`'s own shape — a card with a name in it — which is exactly what the framework hands you for a page you have not paid to render.

This is the curation. One promoted specimen per kind is live; its alternates are one click away and cost nothing. Fifty documents became twenty by deciding what to promote, which is a librarian's job and not a browser's — an IntersectionObserver would have made the page lazier without making it better, and machinery is the thing this codebase spends last.

## The catalogue: curated by arrangement kind

Curated by ARRANGEMENT KIND, not by which seat wrote it: a reader arrives asking "how do I do columns", never "what did Steve build". One specimen per kind is promoted to a live tile; the rest are ordinary links, one click away and costing nothing. That is what took this page from fifty documents to twenty, and it is an editorial decision rather than a technical one.

Hand-typed and checked against the filesystem before each run, for exactly the reason site/app.js gives for the hand-typed sidebar: the alternative is asking the network about urls that may not exist, and this framework designed the doomed 404 out on purpose ("only declared names ever hit the network"). A probe over every topic was built first and reverted — it cost a 404 per absent directory, indistinguishable in the console from a real failure.

Deep urls, not topic roots: an arrangement is only itself once something is actually open inside it, which is the one thing a sidebar cannot express.

## Initialize: why inline nesting works

Eight recipes, no files. ONE level of inline nesting is safe — `add()` assigns the parent before anything can walk — and everything below is `route()`, which runs late enough to have a url.
