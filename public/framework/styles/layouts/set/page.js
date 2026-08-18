import { Page, demo, div, h2, h3, p, md } from "/app.js";

/* Figma node 54:1055, frame "Frame 10". `survey.md` called it "Layout (×5), wrapper
   sections" — get_metadata (verified 2026-08-18) shows SIX top-level frames, and every
   one of them is literally named "Layout" with no distinguishing name at all. The owner
   on this node: "this could be worked up as one set" — one page, not six directories.

   All six turn out to be the SAME two primitives `wire/` and `anatomy/` already built
   and measured for two sibling Figma frames tonight: `flex three` (peers) and
   `flex auto` with `--grow` (a fluid track twice its neighbour). Nothing new to ship —
   see the table at the bottom for which of the six is which. */

const card = (label, tone = "") => div.c("pad flex v gap surface " + tone, () => {
	if (label) h3(label);
	p.c("muted measure start", "Et commodo turpis orci porta auctor curabitur vel sed.");
}).style("--gap", "0.4em");

const heading = () => div.c("flex v gap", () => {
	h3("Section Title");
	p.c("muted measure start", "Et commodo turpis orci porta auctor curabitur vel sed.");
}).style("--gap", "0.3em");

/* Frame 54:980 — a centred header over three equal cards. `flex three` clamps
   straight from three tracks to one; it never shows two-and-an-orphan. */
function three(){
	return div.c("pad flex v gap", () => {
		heading();
		div.c("flex three gap", () => { card("Vitae Volutpat"); card("Vitae Volutpat", "wash"); card("Vitae Volutpat"); })
			.style("--column", "16em");
	}).style("--gap", "1.4em");
}

/* The other five frames (54:994, 54:1040, 61:1251, 61:1271, 65:1306) — a rail, a fluid
   centre twice their width, a second rail. `--grow: 2` on the centre is the whole seam;
   the frames differ only in whether a full-width band wraps the row (a `flex v` nest,
   already proved by `anatomy/burger-columns`) and what sits inside the centre track
   (three stacked cards, or — 54:994 — two side by side; "nesting has no floor"). */
function columns(){
	return div.c("pad flex v gap", () => {
		heading();
		div.c("flex auto gap", () => {
			card("Left", "tint");
			card("Centre").style("--grow", "2");
			card("Right", "tint");
		}).style("--column", "12em");
	}).style("--gap", "1.4em");
}

export default new Page({
	meta: import.meta,
	title: "Set",
	description: "Six frames from one Figma node, all literally named \"Layout\" — and the two class strings they turn out to be.",
	icon: "view_agenda",
	group: "Reference",

	content(){

		md("**Six frames, one name, two primitives.** `survey.md` described this node as "
			+ "\"Layout (×5), wrapper sections\"; `get_metadata` shows six top-level frames, "
			+ "every one of them literally named `Layout` — no `-3440`/`-1920`/`-400` suffix, "
			+ "no distinguishing label at all. The owner's own words on this node: *\"this "
			+ "could be worked up as one set\"* — so this is one page, not six directories, "
			+ "and the six turn out to need nothing new.");

		h2("Three across");

		md("A centred header over three equal cards — the whole row is `flex three` and "
			+ "one `--column`. Exactly [Wire → Three Full "
			+ "Columns](/framework/styles/layouts/wire/columns/), already built and measured "
			+ "at four widths.");

		demo.stage(three).ac("bleed");
		demo.source(three);

		h2("Rail, centre, rail");

		md("A left-aligned header, then a row that reads as a fixed rail, a centre twice "
			+ "its width, a second rail — `flex auto` and `--grow: 2` on the centre, the "
			+ "word that shipped earlier tonight. This is "
			+ "[Anatomy → Columns](/framework/styles/layouts/anatomy/columns/) with real "
			+ "cards in it, and the populated, real-content version of the same row is "
			+ "[Docs](/framework/styles/layouts/docs/): a menu rail, an article, a table of "
			+ "contents — same three tracks, same `flex auto` row underneath.");

		demo.stage(columns).ac("bleed");
		demo.source(columns);

		h2("What the six frames actually are");

		md("| frame | shape | already built as |\n|---|---|---|\n"
			+ "| `54:980` | header, three equal cards | `flex three` — this page, and "
			+ "[Wire → Three Full Columns](/framework/styles/layouts/wire/columns/) |\n"
			+ "| `54:994` | header, rail + a centre that is itself two cards side by side | "
			+ "`flex auto` + `--grow`, nested — "
			+ "[Anatomy → Columns with Burger](/framework/styles/layouts/anatomy/columns-burger/) "
			+ "is the same nesting (a burger in the centre track; here it's a second row) |\n"
			+ "| `54:1040` | header text, a full-width band, rail-centre-rail, a closing band | "
			+ "`flex v` around the row — "
			+ "[Anatomy → Burger with Columns](/framework/styles/layouts/anatomy/burger-columns/), "
			+ "and the toggleable header/footer version is [Shell](/framework/styles/layouts/shell/) |\n"
			+ "| `61:1251` | header text, a full-width band, rail-centre-rail | same, footer band "
			+ "omitted — a `parts:` checkbox in "
			+ "[Anatomy → Burger with Columns](/framework/styles/layouts/anatomy/burger-columns/) |\n"
			+ "| `61:1271` | header text, then the bare row, no full-width band | "
			+ "[Anatomy → Columns](/framework/styles/layouts/anatomy/columns/) as drawn — the "
			+ "\"Rail, centre, rail\" demo above |\n"
			+ "| `65:1306` | same as `61:1271`, different `--column`/height tuning | same string, "
			+ "different numbers — not a new shape |");

		md("**Nothing here needed new CSS or a new directory.** `wire/` and `anatomy/` "
			+ "already proved both primitives, at four widths each, for two sibling Figma "
			+ "frames tonight; this node is the same two words wearing lorem-ipsum cards "
			+ "instead of wireframe bands.");
	},
});
