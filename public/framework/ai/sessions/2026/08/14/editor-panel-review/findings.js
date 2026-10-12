/* The ledger, as data. `mod` filters, `sev` sorts, `kind` says what KIND of thing it
   is — a defect is wrong, debt is over budget, open is known and deferred, done is
   verified. Every `where` is a real file and line, checked against the tree. */

export const FINDINGS = [

	{ mod: "both", kind: "debt", sev: "high",
		title: "Neither module has ever been committed",
		where: "git status → ?? ext/editor/ · ?? ext/Panel/",
		what: "13 files and 1,568 lines exist only in the working tree; `git log` on both paths returns nothing. Both shipped 2026-08-13, both were renamed and split on 2026-08-14, and neither has a single commit behind it.",
		fix: "Commit them. Every other line on this page is a note about code that is one lost working tree away from never having existed." },

	{ mod: "both", kind: "defect", sev: "high",
		title: "A failed load is indistinguishable from an absent one — and the seed overwrites the file",
		where: "Saver/FileSaver.js:7 · Panel/workspace.js:40 · editor/page.js:306",
		what: "`FileSaver.load()` returns `null` for **any** non-ok response, so `Item.open()` hands back an empty document. Panel reads `fresh = !(loaded instanceof Panel)` → true, rolls a random arrangement and saves it over `/data/panels.json`. The editor seeds a Section + Text and `changed()` saves that over `/data/editor.json`. A dev server restarting mid-fetch is enough to trigger it.",
		fix: "A 404 is *absent*; anything else is a *failure*, and they must not be the same value. One more return shape on `Saver.load()`, and one clause at each of the two call sites: never seed, never save, over a load that failed." },

	{ mod: "editor", kind: "debt", sev: "high",
		title: "page.js is 318 lines — the longest file in the framework",
		where: "editor/page.js",
		what: "Three responsibilities in one file: the editor widget (lines 84–257), its six regions, and the documentation page. The house rule is most files under 100. Its own readme has carried the split as open since the day it shipped.",
		fix: "`Editor.js` — the widget as the class it already is: eleven methods (`draw select layers properties badge marks sync insert cut swap changed`) and seven fields, currently written as a closure — beside a thin `page.js`. **This is also the move that earns the capital D.**" },

	{ mod: "editor", kind: "gap", sev: "high",
		title: "The editor has no door — nothing outside its own directory can build one",
		where: "editor/page.js:84 — `function editor(root)`, module-private",
		what: "Every other ext hands you something: `md()`, `demo()`, `panel()`, `toc()`, `new Saver()`. The editor hands you a `Page`. The widget is a closure inside `page.js`, so the module cannot be embedded in a task page, a panel template, or a second document — and it cannot be named in an import.",
		fix: "Falls out of the split above: `Editor.js` exports the class, `page.js` documents it. The door is the rename." },

	{ mod: "editor", kind: "defect", sev: "med",
		title: "Opening the page writes the document",
		where: "editor/page.js:255 — `changed()` at the end of `editor()`",
		what: "`editor()` ends with `changed()`, which calls `doc.save()` purely so the status badge has a return value to read. Visiting `/framework/ext/editor/` and touching nothing rewrites `/data/editor.json`.",
		fix: "The badge is asking *can this write?*, not *did it write*. Ask the saver instead of writing to find out — the same one visible line ruling 15 already wants." },

	{ mod: "Panel", kind: "defect", sev: "med",
		title: "Three live mounts on one document, not the two the readme records",
		where: "ext/Panel/page.js:13 · ext/Panel/page.js:46 (/full/) · ai/2026-08-13/panel/page.js:16",
		what: "The readme names two workspaces over `/data/panels.json`. There is a third — the 2026-08-13 task page embeds `workspace()` on the same default saver. `Page` caches views, so after visiting any two of them, two documents are mounted and the last writer wins.",
		fix: "Either the shared-document registry the readme names, or the cheap version, which is already the house pattern: an archive page takes a `MemorySaver`, the way `ai/2026-08-13/editor-panels/` does — and the way the live workspace lower down *this* page does." },

	{ mod: "both", kind: "debt", sev: "med",
		title: "The saver chooser is copy-pasted between the two modules",
		where: "Panel/workspace.js:23-24 · editor/page.js:19-20",
		what: "The localhost test and the `FileSaver`/`LocalStorageSaver` choice appear verbatim in both files. Ruling 15 wants that choice visible in **one** line at the call site; two identical copies is one more copy than that.",
		fix: "`store(path, key)` in `ext/Saver`, imported by both. The line at each call site stays as visible as the ruling asks, and there is one of it to keep in step." },

	{ mod: "Panel", kind: "debt", sev: "med",
		title: "workspace.js is 189 lines — the split that fixed panel.js stopped one seam short",
		where: "Panel/workspace.js",
		what: "The 2026-08-14 wave split the 205-line `panel.js` into `workspace.js` + `PanelDrag.js`. What is left still carries four things: the two doors, the recursive view, the bar's controls, and `scatter()`.",
		fix: "The bar is the seam — `controls()`, `popover()`, `place()` and the `TONES`/`ALIGN`/`PLACE` tables are one idea (a panel's chrome) and about 45 lines. `bar.js` beside it leaves `workspace.js` holding the doors and the view." },

	{ mod: "editor", kind: "open", sev: "med",
		title: "Property edits are not undoable",
		where: "editor/page.js:194 — `sync()` on the panel's own bubble-phase click/input",
		what: "The drag goes through `history.act()`; chips and sliders do not. A slider fires fifty `input` events and each one would be its own snapshot. Recorded by the readme rather than solved.",
		fix: "A snapshot per **gesture** — `pointerdown` on the properties region — which also pushes for a pointerdown that edits nothing. Neither shape has earned its way in." },

	{ mod: "both", kind: "debt", sev: "low",
		title: "A stale reference to panel.js survived the rename",
		where: "ext/layout/controls.js:4",
		what: "The header comment reads *\"layout.js and panel.js both read this file\"*. `panel.js` has not existed since the 2026-08-14 split — it is `workspace.js`.",
		fix: "One word. **Fixed by this review** — it is a comment, and comments in this house are held to the same standard as the code." },

	{ mod: "Panel", kind: "defect", sev: "low",
		title: "The clock template can tick for the life of the page",
		where: "Panel/templates.js:53-67",
		what: "`paint()` re-arms a one-second `setTimeout` and only stops once it has been connected **and then** detached. A clock drawn into a body that is never connected never satisfies the first half, so it re-arms forever.",
		fix: "Hold the timer id and clear it on repaint, or stop when the panel that drew it is gone. It costs one timer, not a leak that grows." },

	{ mod: "Panel", kind: "debt", sev: "low",
		title: "templates.css is 162 lines",
		where: "Panel/templates.css",
		what: "Sanctioned by the readme — a template's look *is* its payload, so the module ships one stylesheet. Listed so the exception stays an exception rather than the file nobody notices growing.",
		fix: "None. Watch it." },

	{ mod: "both", kind: "debt", sev: "low",
		title: "Both readmes are three screens, and the rule is one",
		where: "Panel/readme.md (200) · editor/readme.md (162)",
		what: "A readme is meant to be what the module is plus the two or three things that will bite you. Both are that, followed by the whole design record — the question → options → verdict entries that grew inside them.",
		fix: "The framework already has the pattern: move the Record / Verdicts sections to `doc/*.md` beside the module and reference them in one line. The traps stay in the readme." },

	{ mod: "editor", kind: "open", sev: "low",
		title: "Two canvases over one document is undefined",
		where: "editor/page.js:237",
		what: "The region registry is keyed by name, so the last `canvas` drawn owns `$canvas` and the other goes stale until the next structural redraw. Allowed by the brief.",
		fix: "A registry keyed by instance rather than by name, if it ever matters." },

	{ mod: "editor", kind: "open", sev: "low",
		title: "Two redraws per drag",
		where: "editor/page.js:101",
		what: "`item.move()` emits `remove` then `add`, and both are bound to `draw()`. Correct, and one frame wasteful.",
		fix: "A move event, or a coalescing redraw. Neither is worth a new concept yet." },

	{ mod: "editor", kind: "open", sev: "low",
		title: "One keydown listener per document, never removed",
		where: "editor/page.js:248",
		what: "An `isConnected` check keeps a routed-away editor from eating the shortcut of whatever is on screen now, so it is harmless — but it is never torn down.",
		fix: "A real teardown wants a `Page` lifecycle hook that does not exist. That hook is the actual proposal." },

	{ mod: "editor", kind: "open", sev: "low",
		title: "Three bars of chrome stack above the palette",
		where: "editor/page.js:31 — the seed is four levels deep",
		what: "Every `Panel` draws a bar, including splits, and the editor's seed nests root → row → column → leaf.",
		fix: "A split's bar carries only close and the two divide buttons — most of it is inert on a container. Drawing a *thinner* bar for a split is one predicate in `controls()`." },

	{ mod: "both", kind: "open", sev: "low",
		title: "A first-ever load logs one 404",
		where: "editor/page.js:24 · Panel/workspace.js:24",
		what: "`FileSaver.load()` is a plain `fetch`, so the first visit before any file exists logs a 404 in the console. Both modules have had this since they shipped.",
		fix: "Nothing honest — the request has to happen. It disappears the moment the shared load/absent/failed distinction above lands." },

	{ mod: "Panel", kind: "open", sev: "low",
		title: "\"Intelligent\" fill is deliberately not built",
		where: "Panel/readme.md:102",
		what: "Reading a panel's real size and picking a template that suits it. `scatter()` runs before any element exists, so it has nothing to measure.",
		fix: "A size-aware roll wants a second pass after layout. That is a design, not a tweak." },

	{ mod: "Panel", kind: "open", sev: "low",
		title: "mode: \"hug\" is in data and on the bar, and nothing needs it yet",
		where: "Panel/Panel.js:64 · panel.css:22",
		what: "The interesting case is a panel that hugs a section band's natural height inside a filling row. It is wired end to end and has no demo.",
		fix: "A demo before it earns its keep — or delete it." },

	{ mod: "Panel", kind: "done", sev: "low",
		title: "One verb does the thing Mike asked for twice",
		where: "Panel/Panel.js:19 — divide(dir)",
		what: "A second click on the same icon finds a parent that already runs that way and adds a third column. Drag-to-edge is the identical call with `made` and `before` supplied. There is no separate \"add a column\" verb, and none is needed.",
		fix: "—" },

	{ mod: "Panel", kind: "done", sev: "low",
		title: "The grip writes grow fractions, not pixels",
		where: "Panel/PanelDrag.js:11",
		what: "Verified across a 500px window change: 0.354 before, 0.354 after. Proportions survive a resize because the divider never writes a px width.",
		fix: "—" },

	{ mod: "Panel", kind: "done", sev: "low",
		title: "The T vocabulary — 23 templates, all fifteen section bands",
		where: "Panel/templates.js",
		what: "Every section band is available inside a panel, lazily imported and tinted by the panel's tone, and nothing about the band knows it is in one. Eight scenes size themselves in container-query units from a phone sliver to 3440.",
		fix: "—" },

	{ mod: "editor", kind: "done", sev: "low",
		title: "Undo restores through the same hydrate a reload takes",
		where: "editor/History.js · editor/page.js:111 — swap()",
		what: "Whole-document snapshots, restored through `Item.hydrate` — so every Ctrl+Z is a live test of the round trip, and there is no second serializer to keep honest. `swap()` moves the saver, the listeners, the canvas and the selection onto the new tree together.",
		fix: "—" },

	{ mod: "editor", kind: "done", sev: "low",
		title: "The shell is a panel workspace with its own vocabulary",
		where: "editor/page.js:222 — REGIONS · Panel/workspace.js:59 — vocab()",
		what: "`workspace({ saver, templates, seed })` — three keys, one call. The registry rides the root Panel and never serializes, so no editor state reaches `ext/Panel` and `canvas` never appears in another page's T menu. Two behaviours fall out of the same predicate: a workspace with its own regions is offered no `random` and no per-body layout bar.",
		fix: "—" },

	{ mod: "both", kind: "done", sev: "low",
		title: "Two drag systems on one page, and neither can drop into the other",
		where: "editor/page.js:46 · Panel/PanelDrag.js:61 — drop_check()",
		what: "`Draggable.registry` is a single WeakMap for the document, so a block could be dropped into the panel tree it is being edited in. One clause in each `drop_check` — `target.item?.root() === this.item.root()` — closes it, and also closed a live defect on the Panel page itself.",
		fix: "—" },

	{ mod: "both", kind: "done", sev: "low",
		title: "The reload round trip works through both savers",
		where: "FileSaver on localhost · LocalStorageSaver off it",
		what: "Structure, grow fractions, templates, tones, alignment and the edited document all come back. One visible line chooses which backend, and a `save()` resolving `false` is the only thing the read-only badge reads.",
		fix: "—" },
];

export default FINDINGS;
