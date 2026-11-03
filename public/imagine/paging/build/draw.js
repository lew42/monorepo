import { View, div, p, span, a, icon, md } from "/app.js";
import { blocks_of, config_of, layout_of } from "./words.js";

View.stylesheet(import.meta, "build.css");

/* ── THE BLOCKS, DRAWN ─────────────────────────────────────────────────────────

   A page built in Build has CONTENT, and the content is a list of blocks: prose, a
   wall of cards, one of the template families. This file draws that list, and it is
   the only place in the realm that does.

   ⚠ WHY IT LEFT `stage.js`. The blocks were collected by Build's fifth control,
     written to disk inside `mode.blocks`, and drawn by NOTHING outside `build/` — so
     a paragraph you typed survived the save and appeared on no page (paging-audit-4b,
     break 2). It is the same defect the last pass fixed for the seven words, one
     level down: a control writing a key nothing reads.

     The fix is one renderer with two callers. The builder's own stage draws it in
     the middle column, and a page you MADE draws it through the stage's `draw` seam
     (`make/page.js`) — so what you see while building is what the saved page shows.
     `../doc/builder.md` records the decision and the alternative that was rejected.

   ⚠ THE SHEET IS LOADED HERE. `build.css` owns `.build-block*` and `.build-card*`,
     and a made page never loads `build/page.js` — so the module that draws the
     classes is the module that asks for the sheet. Loading it twice costs nothing:
     `View.stylesheet()` is keyed by href.                                        */

export function draw_blocks(node, page){
	const blocks = blocks_of(node);

	if (!blocks.length) return null;

	/* ⚠ THE NUMBERED LAYOUT IS DERIVED, NEVER STORED. `layout_of()` (`../blocks.js`)
	     answers which of the four numbered layouts an arrangement word compiles to, so
	     the builder cannot say `wall` and lay the blocks out in one column. */
	const layout = layout_of(config_of(node).arrangement);

	/* ⚠ THE WRAPPER IS THE CONTAINER THE ARRANGEMENTS QUERY. `main-aside` becomes one
	     column under 34rem, and a box cannot answer its own container query — so the
	     grid needs a parent that measures. `build.css` puts `container-type` here. */
	return div.c("build-blocks-box", () => {
		div.c("build-blocks").ac("build-arrange-" + layout.replace(".", "-"))
			.append(() => blocks.forEach(block => draw_block(block, node, page)));
	});
}

function draw_block(block, node, page){
	if (block.type === "prose") return div.c("build-block build-block-prose", () => md(block.text ?? ""));
	if (block.type === "cards") return cards(block, node);
	return template(block, page);
}

/* A CARD WALL. `from: "children"` draws this page's own children — which is what
   core's `previews()` will draw once the page is on disk; `from: "templates"` is the
   eleven template families, read from the templates realm's own list. */
function cards(block, node){
	if ((block.from ?? "children") === "templates") return families();

	const kids = node.children ?? [];

	return div.c("build-block build-cards", () => {
		if (!kids.length){ p.c("muted", "A card wall of this page's children — and it has none yet."); return; }

		kids.forEach(kid => div.c("build-card-item", () => {
			icon(kid.icon ?? "description");
			span.c("build-card-title", kid.title);
			p.c("muted", kid.description || "No description yet.");
		}));
	});
}

/* ⚠ THE FAMILIES ARE IMPORTED LAZILY, and that is not caution — `families.js` pulls
     the magazine, the blog's manifest, the shells and two ux modules down with it,
     which is a lot to load on a page that may never ask for a template block. The
     import is fired on first use and the box is filled in a CALLBACK: nothing may
     build DOM after an `await`. */
function families(){
	return div.c("build-block build-cards", $wall => {
		$wall.append(() => { p.c("muted", "Reading the template families..."); });

		import("../templates/families.js")
			.then(({ FAMILIES }) => $wall.empty(() => FAMILIES.forEach(it => div.c("build-card-item", () => {
				icon(it.icon);
				a.c("build-card-title", it.title).href("/imagine/paging/templates/" + it.name + "/");
				p.c("muted", it.card_line);
			}))))
			.catch(() => $wall.empty(() => { p.c("muted", "The template families did not load. They live at /imagine/paging/templates/."); }));
	});
}

// ONE FAMILY, drawn by the family's OWN module — the same call its own page makes.
function template(block, page){
	return div.c("build-block build-block-template", $box => {
		$box.append(() => { p.c("muted", "Loading the " + (block.family ?? "magazine") + " family..."); });

		import("../templates/families.js")
			.then(({ family }) => {
				const it = family(block.family ?? "magazine");
				$box.empty(() => {
					if (it) it.example(page, false);
					else p.c("muted", "There is no family called " + block.family + ".");
				});
			})
			.catch(() => $box.empty(() => { p.c("muted", "That family did not load."); }));
	});
}

export default draw_blocks;
