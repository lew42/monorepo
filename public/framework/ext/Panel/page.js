import { Doc, md, code, demo, div, h3, p, ui, b, em } from "/app.js";
import panel, { workspace, Panel } from "./workspace.js";
import { structure } from "./generate.js";
import full from "/framework/styles/layouts/full.js";

// A cell is a string OR a function (ui/doc/method/table.md); `**bold**` inside a plain
// string renders literally — `[b, "x"]` calls the real factory instead.
const cell = (...parts) => $td => parts.forEach(part =>
	Array.isArray(part) ? part[0](part[1]) : $td.append(part));

export default new Doc({
	meta: import.meta,
	title: "Panel",
	description: "Chrome for arranging: divide, drag, align and fill any region — and it survives a reload.",
	icon: "dashboard_customize",

	subject: Panel,
	properties: "defaults shared",
	methods:    "get set leaf divide split close absorb mirror master copies bequeath",
	notes:      "decisions templates generator focus overlays",
	files:      "Panel.js workspace.js vocab.js focus.js overlays.js paint.js random.js glyphs.js toolbar.js size.js grip.js seam.js tools.js split.js insert.js repeat.js text.js persist.js display.js PanelDrag.js panel.css toolbar.css size.css grip.css tools.css split.css insert.css repeat.css text.css display.css templates.js templates.css properties.js generate.js page.js readme.md",

	content(){

		workspace().ac("bleed");

		md("**Point at a panel and its tools fade in over the top of it** — faint icons along the top, and nine arrows at the nine places they align to. Drag a seam until a panel is narrower than its own row and the whole run of verbs folds behind one `more_horiz`, so nothing is ever out of reach. Then reload: the whole arrangement comes back, and [`/framework/ext/Panel/full/`](/framework/ext/Panel/full/) is the same workspace filling the window.");

		md("**Twelve gestures worth trying on the panel above.** Each is one interaction, and none of them needs a mode you have to leave.");

		ui.table(["do this", "and"], [
			[cell("Click an ", [b, "edge"]), "a split preview follows your pointer and flips sides across the midline — click to keep it, Escape to drop it"],
			[cell("Click an ", [b, "arrow"]), "the content aligns to that corner or edge; the dot centres it"],
			[cell("Drag the ", [b, "magnifier"]), "the body zooms about its own centre — 240px of travel doubles it, a plain click fits it again"],
			[cell("Click a ", [b, "panel"]), "its words open in the properties rail on the right"],
			[cell([b, "Alt"], "-drop a panel on an edge"), cell("the original stays where it is and a ", [em, "live duplicate"], " lands — change either and both follow")],
			[cell("Click the ", [b, "+"], " on a seam"), "a fresh panel drops into the gap nearest your pointer — a tall bar between columns, a wide one between rows"],
			[cell("Click a run of ", [b, "text"], ", or press ", [b, "T"], " over a panel"), cell("select it to set level, weight, tracking and align in the rail, or type straight into it — ", [b, "wrap"], " boxes it in a div, section or figure, and every edit rides ", [code, "data.text"], " — it survives a template swap and a reload alike")],
			[cell("Pick ", [b, "flex"], " or ", [b, "grid"], " from a panel's ", [code, "display"]), "an overlay draws what the mode is doing: the flex axis and each child's grow, or the grid's real track widths"],
			[cell("Click the ", [b, "width"], " or ", [b, "height"], " trigger on the bar"), cell("pick ", [code, "fill"], ", ", [code, "hug"], ", or one of three fixed lengths (", [code, "8em"], " / ", [code, "16em"], " / ", [code, "24em"], ") — each axis is its own control, so a panel can hug its height and fill its width at once")],
			[cell("Click the ", [b, "+"], " at the end of a repeating run"), cell("clones the last card, row or tile a template drew — the copy rides ", [code, "panel.data.text"], " too, so a live duplicate shows it")],
			[cell("In the rail, click a ", [b, "self"], " arrow"), "moves the panel inside the slot its split hands it — live only on an axis that does not fill, and only where the slot's own display mode lets a child place itself there; a dead arrow greys and says why"],
			[cell("In the rail, pick ", [code, "static"], " or ", [code, "absolute"]), cell("absolute floats the panel over its slot instead of sitting in it — bounded by the workspace or the parent split either way, so it ", [em, "can never leave"], ".")],
		]);

		md("The magnifier writes the `zoom` **property**, not `transform: scale()`. Scale looks identical and lies: a scaled box still occupies its unscaled size, so nothing re-lays-out — and a panel's templates size themselves in container-query units against the body, which only re-queries because `zoom` genuinely changes the box.");

		md("`display` changes how a leaf's **own content** lays out — the template it is drawing, not the row of panels around it, which is still `dir` and `grow` on the split above. Pick it from the bar and the overlay says what the mode is doing while you watch: grid's numbers are the browser's own resolved track widths, read off `getComputedStyle` after layout, never guessed from the `minmax()` that produced them.");

		md("A **section** is a full-width band of a real page — content, with its own measure and tone. A **panel** is chrome for *arranging*: it can host any section, frame it, align it, retint it, split beside it. Sections are what you ship; panels are how you wireframe.");

		demo(() => {
			div.c("flex gap", () => {
				panel(() => {
					h3("Anything");
					p("…inside one managed panel.");
				}).style("--panel-height", "14em");

				panel("clock").style("--panel-height", "14em");
			});
		}, "`panel(seed)` is the default container door: **one** managed leaf, same `Panel` class, same code path. A **function** is content the call site draws; a **string** is a `T` entry, which is what [`/framework/`](/framework/) puts its live clock on. Neither panel here has a saver, so `save()` resolves `false` and nothing is written.");

		md("Every panel is an [`Item`](/framework/core/Item/), every drag is one `item.move()` through [`Sortable`](/framework/ext/Draggable/), every control on the bar is one `item.set()`, and the whole tree writes through a [`Saver`](/framework/ext/Saver/). There is no fifth mechanism — [`ext/editor`](/framework/ext/editor/)'s shell is built from the same `Panel` class and the same `workspace()` call, with its own five regions standing in for the `T` vocabulary.");

		code.js(`divide(dir)   // my parent already runs this way? a new sibling. else I become the split
split(dir)    // ALWAYS become the split — for a drop aimed at my INSIDE, not beside me
close()       // remove me; a container left with one child absorbs it
mirror(of)    // become a live duplicate of another panel — same content, own size and place`);

		md("**Splitting twice on the same icon adds a third column**, because the second click finds a parent that already runs that way. That is the whole rule — there is no separate \"add column\" verb. `split(dir)` is that rule's else-branch, named: dropping a panel in the *middle* of another one must not become a sibling just because the parent happened to already run that way.");

		md("The `T` menu adapts all fifteen [section bands](/framework/styles/sections/), lazily imported and tinted by the panel's tone, beside eight scenes that size themselves in container-query units — so one template is centred and scaled from a phone sliver to a 3440 monitor.");

			demo(() => {
				const row = new Panel({ data: { dir: "row" } }).add(
					new Panel({ data: { template: "rail", mode: "hug" } }),
					new Panel({ data: { template: "hero" } }));

				panel(row).style("--panel-height", "22em");
			}, "**`hug` sizes a panel by what it holds; `fill` takes what is left** — which is how one rail beside one page becomes a sidebar. Flip either side from its own bar's *width* or *height* trigger, or click the seam between them. A scene measured in container-query units has no content size to hug, so hugging one takes `--panel-hug` (16em) on the axis its split runs — and it stays the same drawing it is at any other size.");

		demo(() => {
			panel("space").style("--panel-height", "30em");
		}, "**`space` generates a layout instead of showing one.** `gen(seed)` from [the layout space](/framework/styles/layouts/space/) writes a whole page as spec text and the panel renders it — dice to reroll, arrows to step. A seed is an *address*, so it is the only thing stored: it rides `panel.data.seed`, and the panel comes back the same layout after a reload. Any leaf can do this — it is one entry in `T`.");

		demo(() => {
			panel(structure(42)).style("--panel-height", "26em");
		}, "**`structure(seed)` translates the same layout into real panels** — every band below is a leaf you can drag, resize at a seam, retint or split, and a rolled arrangement saves like any other. The dashboard icon on any panel's bar rolls one: on a `space` panel it materializes the layout you are *looking at*, anywhere else it rolls fresh. Same seed, same tree, forever.");

		demo(() => {
			const row = new Panel({ data: { dir: "row" } }).add(
				new Panel({ data: { template: "wall" } }),
				new Panel({ data: { template: "properties", mode: "hug" } }));

			panel(row).style("--panel-height", "30em");
		}, "**`properties` is a panel that inspects another panel.** Click the numbers on the left — the outline marks what is focused and its words appear on the right, where every chip is the same `item.set()` the bar makes. An inspector never takes focus itself, so two of them side by side track the same panel: layering, resizing, dragging and persistence all come free from *being* a panel. Focus is a selection — it rides the root panel and never reaches the file.");

		md("Next: [Editor](/framework/ext/editor/) — the same `Item` tree, edited instead of arranged.");

		md("Where this module stands, as a filterable ledger: [Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/).");

		md.details(import.meta, "readme.md", "Readme");
	},

	// A url, not a class toggle, so a reload comes back to the whole-window view.
	route(name){
		return name === "full" && full(this, () => workspace().style("--panel-height", "100%"));
	},
});
