import { Page, demo, md, div, span, label, input, button } from "/app.js";

const live = (el, fn) => new ResizeObserver(fn).observe(el);

/* `gridTemplateColumns` computes to `[bleed-start] 48px [wide-start main-start] 611px …`,
   so dropping the line names leaves gutter · main · wide · gutter. */
const tracks = el => (getComputedStyle(el).gridTemplateColumns.match(/[\d.]+px/g) ?? [])
	.map(n => Math.round(parseFloat(n)));

/* Every `--measure` declaration in the loaded CSS, off the CSSOM, kept to the ones that
   actually land on THIS page or its region. Read, never typed: the audit's proposal may
   move the declaration, and this list has to stay true when it does. */
const declared = el => {
	const out = [];

	const walk = rules => [...rules].forEach(rule => {
		const value = rule.style?.getPropertyValue("--measure");
		if (value && rule.selectorText) out.push([rule.selectorText, value.trim()]);
		if (rule.cssRules) walk(rule.cssRules);   // @layer, @media — and a style rule nests too
	});

	[...document.styleSheets].forEach(sheet => { try { walk(sheet.cssRules); } catch { /* cross-origin */ } });
	return out.filter(([sel]) => { try { return el.matches(sel) || el.parentElement.matches(sel); } catch { return false; } });
};

// No title: an `h1` is a main-track block like any other, and this box is short.
const sample = () => new Page({
	content(){
		div.c("surface pad", () => md("main")).style("--pad", "0.4em");
		div.c("wide surface wash pad", () => md("wide")).style("--pad", "0.4em");
	},
});

/* ⚠ `thumb` is the wall card calling. In a thumb the page wears `default`, never
   `active-page` — one of those inside a `.page-preview-thumb` makes the Doc above match
   `.active-ancestor:has(.page.active-page)` (Page.css:8) and stay on screen as a PEER of
   the routed leaf, halving the region. The box drops `pages` with it: Page.css:42-45
   rewrites a `.default` that is a DIRECT child of `.pages` into the region's empty state
   (`display: block` + its own padding), which would flatten the grid this card is about. */
const board = thumb => {
	let $page, $range, $value, $out, $where;

	const report = () => {
		const [gutter, main, wide] = tracks($page.el);

		$out.empty(() => {
			md("main **" + main + "px** · wide **" + wide + "px** · gutters " + gutter + "px");
			md(wide > 1
				? "The **cap** is binding — `--measure` is smaller than the room, so `wide` has " + wide + "px to hand a `.wide` child."
				: "The **width** is binding — `100% - two gutters` is under the cap, so `wide` is 0px and `main` is the whole page.");
		});

		$where.empty(() => {
			md("**Declared where, right now** — matched against this page, live:");
			declared($page.el).forEach(([sel, value]) => md("- `" + sel + "` → `--measure: " + value + "`"));
		});
	};

	const set = value => { $page.style("--measure", value); $value.text(value); report(); };

	div.c(thumb ? "surface" : "pages surface", () => { $page = sample().render().ac(thumb ? "default" : "active-page"); });

	div.c("flex gap v-center wrap").append(() => {
		label.c("flex gap v-center flex-1", () => {
			span.c("h4", "--measure").style("flex", "0 0 7em");
			$range = input().attr("type", "range").attr("min", 8).attr("max", 90).attr("step", 1).style("flex", "1")
				.on("input", function(){ set(this.el.value + "em"); });
		});

		$value = span.c("muted").style("flex", "0 0 4em");
		button("100%").click(() => set("100%"));
		button("reset").click(() => { $page.el.style.removeProperty("--measure"); start(); });
	});

	$out = div.c("muted");
	$where = div.c("muted");

	// The slider starts wherever the cascade already is — a control that stamps its own
	// default silently narrows a page nobody touched (ext/layout/controls.js says so).
	const start = () => {
		const em = parseFloat(getComputedStyle($page.el).getPropertyValue("--measure")) || 40;
		$range.el.value = em;
		$value.text(em + "em (inherited)");
		report();
	};

	live($page.el, report);
	requestAnimationFrame(start);
};

export default new Page({
	meta: import.meta,
	title: "Measure",
	group: "The box",
	description: "The one token that caps the main track — and where it is really declared.",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50", () => board(true))); },

	content(){
		md("`--measure` caps the `main` track: `min(var(--measure), 100% - two gutters)`. **Drag it.** Whichever of the two is smaller wins, and the line under the numbers says which — narrow it and `wide` grows; press `100%` and the cap can never bite, so `main` eats the page and `wide` is 0px.");

		md("Never `--measure: none`. `min(none, …)` is invalid at computed-value time and **silently drops the whole template**, so the page falls back to implicit columns — which is why `.page` re-declares the token instead of inheriting one, and why `100%` is the opt-out.");

		demo.stage(() => board()).ac("bleed");
		demo.source(board, "Source");
	},
});
