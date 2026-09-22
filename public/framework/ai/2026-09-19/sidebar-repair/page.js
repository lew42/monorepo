import { Page, md, div, p, span, img, a, b } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page in `/framework/ai/2026-09-19/`'s board — an ordinary
                page grid: `main` for the prose, `wide` for anything that needs
                the leftover room.
   2 SIZE       the headline pair claims `wide`, because two 256px rails side by
                side plus their captions is ~620px and reads as a postage stamp in
                the 34em main track. Prose stays at `--measure`.
   3 OWN LAYOUT prose, one big pair, one table, one wall of small pairs. Nothing else.
   4 REGIONS    none. Every other shot nests inside one `<details>`.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN. A reader should be able to see what changed without scrolling
     past the fold — so exactly one pair is large, the numbers are a five-row
     table, and the other thirteen shots are a click down.
   ⚠ `new URL(…, import.meta.url)` for every shot: a bare relative `src` resolves
     against the DOCUMENT, and this page is reached at several urls. */

const shot = (phase, name) => new URL(`shots/${phase}/${name}.png`, import.meta.url).pathname;

/* The numbers, measured on the VISIBLE rail at each width — the app keeps a
   visited page's own Sidebar in the DOM at 0px wide, which is what ate the first
   measuring pass and is worth knowing before anyone measures this rail again. */
const NUMBERS = [
	["row pitch", "46.5px", "31.7px", "51.9px", "35.6px"],
	["label x, depth 0", "80px", "57.5px", "90px", "64.8px"],
	["label x, depth 1 / 2", "96 / 112px", "73.5 / 89.5px", "108 / 126px", "82.8 / 100.8px"],
	["label x, a rail with no folds or icons", "80px", "15.4px", "90px", "17.3px"],
	["fold glyph", "8.96px in a 12.5 x 9px box", "12.8px in a 16.6px square", "10.08px in a 14.1px box", "14.4px in an 18.7px square"],
	["icon vs label centre", "the glyph rode high in a box with no frame", "0.08px apart, five rows out of five", "—", "same frame, same result"],
	["filter", "a 210px card, 1px border, inset 22px", "a 255px bar, edge to edge", "a 237px card", "a 287px bar"],
	["the field on it", "grey, 39px further in", "WHITE, on the bar's own edge", "grey", "WHITE"],
	["footer", "52.2px, stopping where the rows stopped", "34.3px, pinned to the bottom", "58.6px", "38.4px"],
];

const SMALL = [
	["home-1920", "The home page — a flat list. Nine labels sat 80px in with nothing to their left."],
	["framework-1920", "/framework/ — the same rail with icons and folds."],
	["ai-1920", "/framework/ai/ — unchanged content, 14px less per row."],
	["menu-400", "400px: the rail is a top bar, and the menu still opens."],
];

const EVERY = [
	["page", "/framework/core/Page/"], ["home", "/"],
	["framework", "/framework/"], ["ai", "/framework/ai/"],
];

export default new Page({
	meta: import.meta,
	title: "Sidebar repair",
	description: "The rail's rows, its filter and its footer, rebuilt against products people use all day.",
	icon: "view_sidebar",

	content(){

		p("The sidebar was wearing the old flat menu's chrome on a tree: rows ", b("46.5px"), " tall, labels floating 80px into a 256px rail, a 9px fold arrow nobody could hit, and the filter sitting in a bordered white card inside an already-white rail. Here is the same page before and after.");

		this.pair("page", "1920", "/framework/core/Page/ at 1920. Same rail, same width, same content — the whole Core section now fits on one screen.").ac("wide");

		md("| | before, 1920 | after, 1920 | before, 3440 | after, 3440 |\n| --- | --- | --- | --- | --- |\n" +
			NUMBERS.map(r => "| " + r.join(" | ") + " |").join("\n")).ac("wide");

		p.c("muted", "The targets came from the file trees people use all day — GitHub's row pitch is 32px, Notion's 30, VS Code's 22 — not from our own rules. Every length in the row is the ", b("row's own em"), ", never ", b("--pad"), " or ", b("--gap"), ": those are page ramps that cap at 2.6em and had already stood one of these rows 48.7px tall at 3440.");

		md("## The five changes");

		md("1. **The row.** 0.45em of block padding and a 0.35em gap, in the row's own `em`. 31.7px at 1920, against GitHub's 32.\n2. **One square frame**, worn by the fold arrow *and* the icon: `width: var(--ui-tree-frame)`, `aspect-ratio: 1`, `display: grid`, `place-items: center`, `line-height: 1`. `line-height` is the half that fixes the drift — a glyph inheriting the row's 1.4 sits on its own baseline, not in the middle, which is why the icons rode high of their labels.\n3. **The filter is a UI bar.** Full width, no card, no border, on a `darken-2` ground with a **white** field. The white half is not written in the sidebar: `.darken-1/-2/-3` in `framework.css` now carry the ground *and* the `--field-bg` that every `input`, `select` and `textarea` reads, so the next bar anyone builds gets the pair for free. [The live example](/framework/styles/system/).\n4. **The footer is one button row, pinned to the bottom.** The white block under it was `.sidebar-rail` sizing itself to its content — `max-height: 100dvh` only *caps* a box, it never fills one, so on a short tree the footer stopped where the last row stopped. One word (`height`) and the nav takes the slack instead.\n5. **The avatar** holds the anonymous person — a small circle for the head over a bigger one for the body, clipped by the avatar's own edge. Two pseudo-elements, no asset.");

		md("## The rest of the proof");

		div.c("flex wrap gap wide", () => SMALL.forEach(([name, note]) => this.pair_card(name, note)));

		md.details(import.meta, "doc/every-width.md", "Every page at every width — 1280, 1920 and 3440");
	},

	/* ONE PAIR, side by side, captioned. The two shots are the full rail plus 100px
	   of the page beside it, so the rail's edge is visible rather than cropped at it.
	   ⚠ The sizes are `.style()` rather than a class on purpose: they are this one
	     report's geometry, and a throwaway page should not open a CSS namespace. */
	/* ⚠ `maxWidth` on the ROW, not on each image. A rail shot is 356px across (the
	   256px rail plus 100px of the page beside it) and upscaling it to half of a
	   3440 screen makes a blurry picture of two rows. Capped at 46em the two halves
	   land at about the shot's own width, so the type in them is crisp and the row
	   count — which is the whole claim — is countable. */
	pair(name, width, note){
		return div.c("flex v gap-50", () => {
			div.c("flex gap-50", () => {
				this.shot_box("before", `${name}-${width}`, "before", "36em");
				this.shot_box("after", `${name}-${width}`, "after", "36em");
			}).style({ maxWidth: "46em" });
			p.c("muted", note);
		});
	},

	pair_card(name, note){
		return div.c("flex v gap-50 surface pad", () => {
			div.c("flex gap-50", () => {
				this.shot_box("before", name, "before", "18em");
				this.shot_box("after", name, "after", "18em");
			});
			p.c("muted", note);
		}).style({ flex: "1 1 20em", minWidth: "0" });
	},

	/* `object-fit: cover` anchored to the TOP: a rail shot is 1100px tall and the
	   change reads in its first 400 — the brand, the filter and the first rows. A
	   whole-height thumbnail would be 40px wide on screen and show nothing. */
	shot_box(phase, name, label, height){
		return div.c("flex v gap-25", () => {
			span.c("h4 muted", label);
			img().attr("src", shot(phase, name)).attr("alt", "the rail " + label)
				.style({ width: "100%", height, objectFit: "cover", objectPosition: "top left", border: "1px solid var(--line)", borderRadius: "var(--radius)" });
		}).style({ flex: "1 1 0", minWidth: "0" });
	},
});
