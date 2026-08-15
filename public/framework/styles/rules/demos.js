/* Live examples for the rules. Every verdict on these pages is MEASURED by
 * ext/LayoutTool at render time, not asserted in prose — so a rule that stops
 * being true stops claiming to be true. */

import { View, div, p, h3, h4, span, code, table, thead, tbody, tr, th, td } from "/app.js";
import { analyze } from "/framework/ext/LayoutTool/LayoutTool.js";

View.stylesheet(import.meta, "rules.css");

const WORDS = "A card holds a heading and a sentence or two. The question is how much room "
	+ "the frame should leave around them, and whether that answer changes with the width.";

/* Mike's question, rendered: "when you have a card with 20px padding, that's
 * 1000px wide, it looks off". Three widths, the same 20px, then the same three
 * with padding that scales — and the measured ratio under each. */
export function padding_ladder(){
	const widths = [240, 480, 1000];

	div.c("rules-demo flex v gap").append(() => {
		h4("The same 20px at three widths");
		row(widths, w => ({ width: `${w}px`, padding: "20px" }), "20px");

		h4("Proportional — `clamp(0.75em, 3.5%, 3.5em)`");
		row(widths, w => ({ width: `${w}px`, padding: "clamp(0.75em, 3.5%, 3.5em)" }), "clamp");
	});
}

function row(widths, style, label){
	div.c("rules-row flex gap wrap").append($row => {
		widths.forEach(w => {
			div.c("rules-cell flex v gap").append(() => {
				const $card = div.c("rules-card").style(style(w))
					.append(() => { h3("Card"); p(WORDS); });

				span("").ac("rules-verdict muted").append($v =>
					requestAnimationFrame(() => $v.el.textContent = verdict($card.el, w, label)));
			});
		});
	});
}

/* The measurement, taken from the DOM rather than computed from the source — so
 * `clamp()` reports what it actually resolved to at this width. */
function verdict(el, w, label){
	const pad = parseFloat(getComputedStyle(el).paddingLeft);
	const pct = (pad / w * 100).toFixed(1);
	const want = Math.min(w * 0.035, parseFloat(getComputedStyle(el).fontSize) * 3.5);
	const ok = pad >= want - 0.5;   // the same half-pixel tolerance the rule uses

	return `${w}px wide · ${Math.round(pad)}px padding · ${pct}% of width · `
		+ (ok ? "proportionate" : `wants ~${Math.round(want)}px (${(want / w * 100).toFixed(1)}%)`);
}

/* The nesting table, with a live column: each combination is actually built and
 * measured, so "safe" is a result rather than a claim. */
const NESTS = [
	["block in block", "The default. Nothing to get wrong.",
		() => div().append(() => { p(WORDS); p(WORDS); })],

	["flex child, no min-width", "A flex item's `min-width: auto` refuses to shrink below its content.",
		() => div().style({ display: "flex", width: "320px" }).append(() => {
			div().append(() => p("averyveryverylongunbreakabletokenthatcannotwrap"));
		})],

	["flex child, min-width: 0", "The same, told it may shrink.",
		() => div().style({ display: "flex", width: "320px" }).append(() => {
			div().style({ minWidth: "0", overflow: "hidden" }).append(() => p("averyveryverylongunbreakabletokenthatcannotwrap"));
		})],

	["grid, 1fr track", "`1fr` is `minmax(auto, 1fr)` — the `auto` floor is the content.",
		() => div().style({ display: "grid", gridTemplateColumns: "1fr 1fr", width: "320px" }).append(() => {
			div().append(() => p("averyveryverylongunbreakabletokenthatcannotwrap"));
			div().append(() => p(WORDS));
		})],

	["grid, minmax(0, 1fr)", "The floor removed. This is almost always what was meant.",
		() => div().style({ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", width: "320px" })
			.append(() => {
				div().style({ overflow: "hidden" }).append(() => p("averyveryverylongunbreakabletokenthatcannotwrap"));
				div().append(() => p(WORDS));
			})],

	["fixed height, growing content", "The content wins and leaves the box, or the box clips it.",
		() => div().style({ height: "60px", overflow: "hidden", border: "1px solid var(--line)" })
			.append(() => { p(WORDS); p(WORDS); })],
];

export function nesting_table(){
	div.c("rules-nests flex v gap").append(() => {
		NESTS.forEach(([name, why, build]) => {
			div.c("rules-nest flex v gap").append(() => {
				div.c("flex gap v-center wrap").append(() => {
					code(name).ac("rules-name");
					span(why).ac("muted");
				});

				div.c("rules-stage").append($stage => {
					$stage.append(build);
					span("").ac("rules-verdict muted").append($v =>
						requestAnimationFrame(() => {
							const r = analyze($stage.el);
							$v.el.textContent = r.counts.high
								? `${r.counts.high} high · ${r.leading[0]?.rule}: ${r.leading[0]?.detail}`
								: r.counts.total ? `${r.counts.total} minor · ${r.leading[0]?.rule}` : "clean";
						}));
				});
			});
		});
	});
}
