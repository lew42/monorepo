import { Page, div, h2, p, a, img, figure, figcaption, span, md } from "/app.js";

const here = new URL(".", import.meta.url).pathname;
const shots = here + "../shots/";

/* ── The closed set ──────────────────────────────────────────────────────
   The owner's question (2026-09-01): "how do we lock in on a small set of
   approved layouts, that never break?" The [layout study](../) already found
   the answer's shape: the site only ever IS three shells plus a wall and one
   escape hatch. This page makes that a CONTRACT: five names, each with the
   floors-and-ceilings that make it unbreakable, and nothing else without the
   owner's sign-off. */
const APPROVED = [
	{ file: "tax-rail-content.jpg", name: "1 · Rail + content",
		pick: "any reading page — docs, notes, an article without a ToC.",
		holds: "the page grid: gutters clamp(2em, 4%, 5em), text capped at the measure, `wide` takes the leftover, `bleed` is paint. Nothing is a bare 1fr." },
	{ file: "tax-reading-column.jpg", name: "2 · Docs three-region",
		pick: "an article long enough to want its own ToC — every blog post has it free.",
		holds: "same grid plus a pinned third region; the rail is clamp(14em, 26%, 22em), so no width starves the article." },
	{ file: "tax-columns-row.jpg", name: "3 · Columns row (Finder)",
		pick: "a world of peers you walk sideways — /imagine/, a workbench, a browser.",
		holds: "every width word is floored AND capped, and since today scales with the row (small 14→24em, default 40→46em, pads 0.9→3em); under 32em the row pages one column at a time." },
	{ file: "tax-tile-wall.jpg", name: "4 · Tile wall",
		pick: "a region of same-shaped children — an index, a dashboard, a gallery.",
		holds: "auto-fill against a real --column (14–22em): 4+ tracks at 3440, one at 390, never a squeezed pair. Lives INSIDE a shell, never beside one." },
	{ file: "tax-solo.jpg", name: "5 · Solo",
		pick: "the one page that opts all the way out (/resume/). Budget: about one per site.",
		holds: "its own render(), its own risk — solo is APPROVED but never DEFAULT, and each new one is the owner's call by name." },
];

const card = s => figure.c("flex v gap").style({ margin: 0, gap: "0.5em" }).append(() => {
	img().attr("src", shots + s.file).attr("alt", s.name)
		.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" });
	figcaption(() => span(s.name).style({ fontWeight: "700" }));
	p(() => { span("Reach for it: ").style({ fontWeight: "600" }); span.c("muted", s.pick); });
	p(() => { span("Why it holds: ").style({ fontWeight: "600" }); span.c("muted", s.holds); });
});

export default new Page({
	meta: import.meta,
	title: "Approved",
	description: "The five approved layouts — a closed set with floors and ceilings at every level — and the contract that keeps a new page from inventing a sixth.",
	icon: "verified",
	width: "full",

	content(){
		md("**Five layouts. A new page picks one by name; a sixth needs the owner.** Locking the set is what \"never breaks\" actually means — every failure the [layout study](/imagine/design/layout/) catalogued came from a page improvising its own shape, and every survivor came from one of these.");

		h2("The set");
		div.c("grid auto gap", () => APPROVED.forEach(card)).style("--column", "20em");

		h2("Why these can't break");
		md("Each one is the same three promises, kept at every level:\n\n" +
			"1. **Every track has a floor AND a ceiling** — no bare `1fr`, no uncapped basis, no fixed px that one width regrets.\n" +
			"2. **Spacing is the two clamped tokens** (`--pad-default`, `--gap-default`, and the columns pads) — never a constant, so 390 and 3440 are the same declaration.\n" +
			"3. **`bleed` is for paint.** A background may butt its container; cards and text never do — a framed box on the edge rides a padded track instead.");

		h2("The gate");
		md("What locks it in, in order of force:\n\n" +
			"- **The words already are the set.** `page`/`rail`/`wall`/`stage`/`solo` and the column width words compile to these five — a page that stays in the vocabulary CANNOT leave the set.\n" +
			"- **The probe is the contract.** Before landing: 400 / 1280 / 1920 / 3440, and the three invariants — no text at x:0, no prose past the measure, no framed box against an edge. `ext/DesignTool`'s `analyze()` says which; the layout skill now says so.\n" +
			"- **The sixth layout is a proposal, not a commit.** It gets a page here, beside the five, with the same shots — and ships when the owner says so.");
	},
});
