import { Doc, md, code, h2, h3, drawer, div, span, button, p } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Drawer",
	description: "The right rail — one per document, opened by anything, shut only by its own ✕.",
	// ⚠ Measured against the loaded font, not guessed: `right_panel_open` is not in this
	// Material Icons build and rendered as 384px of literal word, which forced the whole
	// framework sidebar from 231px to 344px through `min-width: auto`.
	icon: "view_sidebar",

	files: "drawer.js drawer.css page.js readme.md",
	notes: "decisions",

	content(){

		code.js(`import { drawer } from "/app.js";

drawer(($slot, $body) => {
    $slot.empty(() => { span("Paragraph"); });
    $body.empty(() => { p("Whatever belongs beside the page."); });
});`);

		div.c("flex gap wrap", () => {
			button.c("btn", "Open the rail").click(() => drawer(($slot, $body) => {
				$slot.empty(() => { span.c("h4", "Demo"); });
				$body.empty(() => {
					p("This is the same rail `ext/layout` puts a selection's words in — one per document, so nothing has to negotiate for the edge.");
					p("Click anywhere on the page. It stays. Only the ✕ shuts it.");
				});
			}));

			button.c("btn", "Refresh it").click(() => drawer.refresh());
			button.c("btn", "Close it").click(() => drawer.close());
		});

		md("**Drag its inline edge.** The strip just inside it is a grip — `ext/grip`, the same one [the dev rail](/framework/dev/DevBar/) has. The width you let go of comes back on the next open and the next reload: it lives in `--drawer-w`, because `--drawer` doubles as open/shut and `close()` clears it.");

		md("It **pushes** rather than covers — `--drawer` is the inline-end strip `.app` yields, written onto the same element the rail inherits its width from, so the reserved strip and the rail are one number. A properties panel that covers what you're editing is the one thing this widget must never do.");

		h2("Two slots");

		md("`fn($slot, $body)` fills them. `$slot` is your half of the **pinned** head; `$body` **scrolls**. The ✕ sits beside `$slot` and is never handed over, so nothing you draw can leave the reader with no way out.");

		code.js(`drawer.refresh();     // the same content again, for a subject that changed
drawer.close();       // what the ✕ calls
drawer.showing();     // is it open`);

		h3("Losing a selection is not losing the rail");

		md("Until 2026-08-16 the rail closed whenever the selection cleared — so a click anywhere on the page threw away the reader's scroll position along with whatever they were reading. Now a caller **redraws it saying nothing is selected**, and the ✕ is the only thing that shuts it.");

		h2("Where it came from");

		md("It was `ext/layout/panel.js`'s private half, reachable only through that module's own selection — so [`ext/Panel`](/framework/ext/Panel/), which wants somewhere to put the words that won't fit a hover overlay, had no way in that didn't drag the selection machinery with it. The split follows the seam that was already there: **the rail is generic, what it shows is not.** [`ext/layout`](/framework/ext/layout/) kept the selection, the word registry and the look of its own content.");

		md.details(import.meta, "readme.md");
	},
});
