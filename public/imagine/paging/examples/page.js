import { div, p, h3, a, code, md } from "/app.js";
import { Paging, leaf } from "../paging.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s row (no page grid; `.page-column-prose`).
   2 SIZE       `large` — 28–64em: 421px at 1280, 1005 at 1920, 1152 at 3440.
   3 OWN LAYOUT prose, then five example blocks. Each block is a two-track row —
                framework's own `.cols.half` — with the RESULT in one track and the
                CODE in the other. `--cols-floor` is dropped to 20rem in paging.css
                so the pair sits side by side from about 660px of column and stacks
                below that, result first. At 1280 this column is 421px, so they
                stack; at 1920 and 3440 they are side by side.
   4 REGIONS    one — core's. The five examples are children of this page and open
                as columns of the same row; `index: true` (Paging's default) leaves
                core's rail out, since every example is already drawn below.
   5 PREVIEW    core's default card.

   THE POINT OF THIS PAGE, in one line: a reader scrolls five blocks and, for each
   one, sees the picture and the four lines of code that produced it at the same
   time. Nothing is behind a tab and nothing has to be opened first.

   ⚠ THE CODE IS DERIVED FROM THE LIVE PAGE, never typed twice. `config_text()` and
     `pick_text()` below read each example's own current mode off the page object,
     so the snippet cannot drift from the picture beside it — including after a
     reader opens an example and changes a chip.                                 */

const AXES = ["style", "content", "mech"];

/* THE FIVE. In this order on purpose: each one changes exactly ONE word from the
   example above it, so "what does this word do" is answerable by comparing two
   pictures rather than by reading a definition. */
const EXAMPLES = [
	{
		name: "plain",
		label: "1 · The plainest page",
		takeaway: "This is what you get when you ask for nothing: the site's own floor, one line of content, and a click that opens a column to the right.",
		mode: { style: "plain", content: "s", mech: "launch" },
		rows: ["Alpha", "Beta"],
		why: "`plain` is the default surface, `s` is the second of five content rungs, and `launch` is what a click does everywhere on this site unless something says otherwise.",
	},
	{
		name: "card",
		label: "2 · The same page, on a card",
		takeaway: "One word changed — `style` — and nothing else. Same content, same rows, same mechanism. The box is white and padded now, and the rows went a light grey so they still read against it.",
		mode: { style: "card", content: "s", mech: "launch" },
		rows: ["Alpha", "Beta"],
		why: "A card floats on the floor, so the column keeps the floor colour and only the box inside it goes white. The rows are painted with a rung of the alpha ladder (`--fill-a08`), which composites to light grey here and to a light rung inside the dark island with nothing restated.",
	},
	{
		name: "swap",
		label: "3 · The same page, but a click swaps",
		takeaway: "One word changed again — `mech`, from `launch` to `swap`. Click a row: no column opens, the box does not move, and its content becomes the row you clicked. The selected row stays marked so you always know which one you are looking at.",
		mode: { style: "tint", content: "s", mech: "swap" },
		rows: ["Alpha", "Beta"],
		why: "`swap` and `expand` never navigate, so they have no url — they are gestures inside one box. Every swapped view offers the way back in the same place.",
	},
	{
		name: "more",
		label: "4 · The same page with more content",
		takeaway: "Only the content chip changed, from `s` to `l`. Look closely: the line that was there is STILL there. `l` is `s` plus a paragraph plus four cards — the rungs add, they never replace.",
		mode: { style: "card", content: "l", mech: "launch" },
		rows: ["Alpha", "Beta"],
		why: "The four cards are the `ui/` card template verbatim — real markup from [/framework/ui/card/](/framework/ui/card/), not a placeholder drawn for this page.",
	},
	{
		name: "takeover",
		label: "5 · A page that takes the whole screen",
		takeaway: "Two words changed: the surface went `dark`, and the page declares `width: \"full\"`. Open it and every page behind it — the rail, the Paging hub, this page — collapses into the crumb strip along the top. Nothing was closed; click a crumb and the row is back.",
		mode: { style: "dark", content: "m", mech: "takeover" },
		rows: ["Alpha", "Beta"],
		width: "full",
		why: "`full` and `takeover` are the same word said twice — one as a size, one as a mechanism. The page grows an `exit fullscreen` chip in its toolbar as well, because at 3440 the crumb strip is a long way from where your eye is.",
	},
];

/* ONE EXAMPLE, AS A REAL PAGE. Every one is a child with a real url, so the picture
   on this page and the page you open by clicking it are the same object. */
const example = spec => new Paging({
	name: spec.name,
	title: spec.label,
	label: spec.label,
	description: spec.takeaway.split(".")[0] + ".",
	takeaway: spec.takeaway,
	icon: "play_circle_filled",
	width: spec.width,
	axes: "style content mech",
	mode: spec.mode,
	children: spec.rows.map(row => leaf(row, "Opened from example " + spec.name + ". Which mechanism brought you here is the word on the chip you left behind.")),
	why: spec.why,
	content(){ this.lede(); this.paging(); },
});

// The constructor call a reader would write to get exactly the box beside it.
const config_text = page => [
	"new Paging({",
	"\ttitle: " + JSON.stringify(page.label) + ",",
	page.declared() ? "\twidth: " + JSON.stringify(page.declared()) + "," : null,
	"\tmode: { " + AXES.map(axis => axis + ': "' + page.at(axis) + '"').join(", ") + " },",
	"\taxes: \"style content mech\",",
	"\tchildren: [ " + [...page.children.keys()].map(name => 'leaf("' + name + '", "…")').join(", ") + " ],",
	"\tcontent(){ this.lede(); this.paging(); },",
	"});",
].filter(Boolean).join("\n");

// The same three words, as the calls the chips make at runtime. One seam: a chip
// click IS `pick(axis, value)`, so these lines are not a description of the UI —
// they are what it runs.
const pick_text = page => AXES.map(axis => 'page.pick("' + axis + '", "' + page.at(axis) + '");').join("\n");

export default new Paging({
	meta: import.meta,
	title: "Examples",
	description: "Five pages, each showing the result beside the code that made it.",
	icon: "list_alt",
	width: "large",
	index: true,
	axes: "",

	takeaway: "**Five small pages, and for each one the result and the code that made it, side by side.** Read them in order: every example changes exactly ONE word from the one above it, so you can see what each word does by comparing two pictures.",

	children: EXAMPLES.map(example),

	content(){
		this.lede();

		md("Every box below is a real page — the same object you get by clicking its link, not a screenshot of one. The snippet beside it is generated from that page's own current state, so the two cannot disagree.");

		this.children.forEach(child => this.example(child));

		md("Now that you have seen the words used: [all four mechanisms on one page](/imagine/paging/mechanisms/) · [all five surfaces](/imagine/paging/styles/) · [both size axes, live](/imagine/paging/sizes/) · [make a page of your own](/imagine/paging/make/).");
	},

	/* ONE BLOCK — heading, takeaway, then the result beside the code.
	   `.cols.half` is framework.css's own two-track row (a RATIO, not a wrap
	   threshold); `paging-example-row` only lowers its stacking floor. */
	example(child){
		return div.c("paging-example", () => {
			h3(child.title);
			p.c("paging-teach-say", child.takeaway);

			/* ⚠ THE 2:3 SPLIT IS INLINE, and cannot be a rule. `.cols` and `.cols > *`
			     are in `@layer util`; paging.css is `@layer theme`, which loses to it at
			     any specificity, so a `--cols-w` written there read back as 50/50
			     (measured at 1920, 2026-09-04). An inline custom property beats every
			     author layer. A snippet needs the wider of the two tracks — six lines of
			     JavaScript do not wrap. */
			div.c("cols half paging-example-row", () => {
				div.c("paging-example-result", () => {
					p.c("paging-example-cap", "the result");
					child.still();
				}).style("--cols-w", "2");

				div.c("paging-example-code", () => {
					p.c("paging-example-cap", "the configuration that made it");
					code.js(config_text(child));
					p.c("paging-example-cap", "…and the same three words as the calls its chips make");
					code.js(pick_text(child));
				}).style("--cols-w", "3");
			}).style("--cols-sum", "5");

			md(child.why ?? "");
			a.c("page-link", "Open it as a page, with its chips live →").href(child.url);
		});
	},
});
