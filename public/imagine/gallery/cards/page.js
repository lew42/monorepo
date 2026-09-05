import { Page, md, div, h4, img } from "/app.js";
import { wall } from "../foreign.js";

/**
 * The card restyle, side by side. The rule that paints the surface today lives in
 * `core/Page/Page.css` (`.page-preview`, the "EVERY card wears the surface" block), so
 * the proposal is shown here scoped to `.gal-flat` rather than shipped site-wide.
 */

// A picture of the page's own before/after row — a card thumb is never a live
// instance. Regenerate with `make-thumbs.mjs` (session scratchpad) if the pair changes.
const THUMB = new URL("./thumb.jpg", import.meta.url);

// Thumbed cards — the case the owner is talking about: a white render on a white card.
const THUMBS = "mail dashboard docs landing".split(" ").map(n => "/framework/styles/layouts/" + n + "/");

// The same kind of page drawn thumbless — title and description only.
const PLAIN = "list prose rail crumbs".split(" ").map(n => "/framework/core/Page/overview/" + n + "/");

const pair = (paths, column, plain) => {
	div.c("gal-pair", () => {
		div.c("flex v gap", () => {
			h4("Today — a card");
			wall(paths, { plain }).style("--column", column);
		});

		div.c("gal-flat flex v gap", () => {
			h4("Proposed — no card, a shadow");
			wall(paths, { plain }).style("--column", column);
		});
	});
};

export default new Page({
	meta: import.meta,
	title: "Cards",
	description: "Previews on the wash instead of on a white card — the restyle, side by side.",
	icon: "wallpaper",
	width: "full",

	// Show the restyle instead of naming it: a static shot of the page's own first pair.
	preview(nav){
		return this.preview_card(nav, () => img().attr("src", THUMB).attr("alt", "Today's card next to the proposed shadow restyle")
			.style({ width: "100%", height: "100%", objectFit: "cover" }));
	},

	content(){
		md("> don't put the previews on a white card, just put them directly on the light gray bg. that way, if the preview uses white, it shows more clearly. maybe preview cards should have a drop shadow, so if they're light gray, they'll still show up.\n\nLeft is today. Right is the proposal, scoped to `.gal-flat` on this page. Switch the theme to dark and look again — a shadow on a near-black floor is invisible, so the dark answer is the shadow **plus** a hairline ring.");

		md("#### A card with a render in it");
		pair(THUMBS, "15em");

		md("#### A card with only words in it\n\nThe same four pages, drawn with core's own `preview_card()` — a title and a description, no thumb. There is no picture to be the object here, so the **card** is the object and keeps a surface. It swaps its border for the same shadow, and the two kinds read as one family.");
		pair(PLAIN, "14em", true);

		md("#### The rule\n\nThe surface is painted in `core/Page/Page.css` — one block, `EVERY card wears the surface, 2026-08-17`. This is the whole change:\n\n```css\n.page-preview { padding: 0; background: none; border-color: transparent; }\n\n.page-preview-thumb,\n.page-preview:not(:has(> .page-preview-thumb)) {\n\tborder-radius: var(--radius);\n\tbackground: var(--surface);\n\tbox-shadow: 0 0 0 1px var(--card-ring), 0 1px 2px var(--card-shadow), 0 6px 18px var(--card-shadow);\n}\n\n.page-preview:not(:has(> .page-preview-thumb)) { padding: 0.9em 1em; }\n```\n\nwith the two colours as tokens beside `--surface`, because the answer differs by mode:\n\n```css\n--card-shadow: light-dark(rgba(0,0,0,0.13), rgba(0,0,0,0.5));\n--card-ring:   light-dark(transparent, var(--line));\n```\n\nIt keeps the 2026-08-17 finding that killed the last attempt — *\"the label sits under a picture with nothing around either\"* — because the picture still has a boundary. The boundary is a shadow instead of a border, so a white render reads as white against the wash rather than as a card with a white hole in it.");
	},
});
