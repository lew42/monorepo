import { Page, demo, md, div, span, label, input, button } from "/app.js";

const live = (el, fn) => new ResizeObserver(fn).observe(el);

// No title: an `h1` is a main-track block like any other, and this box is short.
const sample = () => new Page({
	content(){
		div.c("surface pad", () => md("main")).style("--pad", "0.4em");
		div.c("bleed surface wash pad", () => md("bleed — it starts where the gutter ends")).style("--pad", "0.4em");
	},
});

/* ⚠ `thumb` is the wall card calling. In a thumb the page wears `default`, never
   `active-page` — one of those inside a `.page-preview-thumb` makes the Doc above match
   `.active-ancestor:has(.page.active-page)` (Page.css:8) and stay on screen as a PEER of
   the routed leaf, halving the region. The box drops `pages` with it: Page.css:42-45
   rewrites a `.default` that is a DIRECT child of `.pages` into the region's empty state
   (`display: block` + its own padding), which would flatten the grid this card is about. */
const board = thumb => {
	let $page, $out;

	/* Everything is read back, nothing is asserted: `--page-pad` is the OPT-OUT, and the
	   only proof of that is `padding` following it and `--pad-y` going quiet. */
	const report = () => {
		const style = getComputedStyle($page.el);
		const [gutter, main] = (style.gridTemplateColumns.match(/[\d.]+px/g) ?? []).map(n => Math.round(parseFloat(n)));
		const pad = style.getPropertyValue("--page-pad").trim();

		$out.empty(() => {
			md("computed `padding: " + style.padding + "` · gutter track **" + gutter + "px** · main track **" + main + "px**");
			md(pad
				? "`--page-pad: " + pad + "` is set — it is the whole padding shorthand, so **`--pad-y` does nothing**."
				: "`--page-pad` is unset, so the `var()` fallback fires and **`--pad-y` is the padding**.");
		});
	};

	// returns what un-declares it: a slider at 0 still SETS the token, and "set to zero"
	// and "never set" are the whole lesson apart.
	const knob = (token, max) => {
		let $range, $value;

		label.c("flex gap v-center", () => {
			span.c("h4", token).style("flex", "0 0 8.5em");
			$value = span.c("muted", "—").style("flex", "0 0 4em");

			$range = input().attr("type", "range").attr("min", 0).attr("max", max).attr("step", 2).attr("value", 0)
				.style("flex", "1")
				.on("input", function(){
					$page.style(token, this.el.value + "px");
					$value.text(this.el.value + "px");
					report();
				});
		});

		return () => {
			$page.el.style.removeProperty(token);
			$range.el.value = 0;
			$value.text("—");
			report();
		};
	};

	div.c(thumb ? "surface" : "pages surface", () => { $page = sample().render().ac(thumb ? "default" : "active-page"); }).style("height", "9em");

	div.c("flex v gap").style("--gap", "0.4em").append(() => {
		const clear = knob("--page-pad", 60);
		knob("--gutter-x", 90);
		knob("--pad-y", 60);

		button("clear --page-pad").click(clear).style("alignSelf", "flex-start");
	});

	$out = div.c("muted");
	live($page.el, report);
};

export default new Page({
	meta: import.meta,
	title: "Inset",
	group: "The box",
	description: "--page-pad, --gutter-x, --pad-y: which one wins, and what it costs.",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50", () => board(true))); },

	content(){
		md("`--page-pad` flows down **from the region** — it is the one token a region hands a page that actually arrives. `--gutter-x` and `--pad-y` are the page's own, declared on `.page` and read by the two gutter tracks and the block padding.");

		md("**Drag `--page-pad` off 0, then press clear.** It is a `padding` shorthand, so the moment it exists `--pad-y` is dead — which is why `.doc-section { --pad-y: 1.5em }` has never once fired inside a tab panel that sets `--page-pad: 0`.");

		demo.stage(() => board()).ac("bleed");
		demo.source(board, "Source");
	},
});
