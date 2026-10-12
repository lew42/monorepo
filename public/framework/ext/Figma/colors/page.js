import { Page, div, p, h4, md } from "/app.js";
import { parse, over, ratio, floorOf } from "/framework/styles/stacks/stacks.js";

/* Figma Sept-2026, Page 7, frame "Color Schemes" (112:11362). Figma's nested cards
   are a black-or-white overlay at an alpha, so one rule works on any parent — our
   system already has that rule: `.card` inside `.card` steps one notch darker by
   itself, no overlay per level (styles/doc/architecture.md §3). So this page draws
   real `.card bg-*` boxes and reads the truth back off them instead of a guessed
   RGB triple — which is why the Prime card below shows OUR `--prime` (an orange),
   not Figma's blue.

   ⚠ A page here is built DETACHED, so `getComputedStyle` has nothing to answer with
   until the box is actually in the document. A `ResizeObserver` is the trigger that
   fires once it is (styles/system/studies/color/study.js already found this). */

function live_contrast($box, $line){
	new ResizeObserver(() => {
		const own = parse(getComputedStyle($box.el).backgroundColor);
		if (!own[3]) return;                                   // not laid out yet
		// a nested card's own fill is often translucent (`--bg-darken-amt`) — composite
		// it over the real floor behind it, the same move stacks.js's own study makes.
		const bg = own[3] === 1 ? own : over(own, floorOf($box.el));
		const fg = parse(getComputedStyle($line.el).color);
		$line.text(`Text on this card: ${ratio(fg, bg).toFixed(1)} : 1 contrast`);
	}).observe($box.el);
}

// One ground card, `depth` more `.card`s nested straight inside it.
function card(cls, label, depth){
	div.c(cls, $box => {
		h4(label);
		const $line = p("Text on this card: — : 1 contrast");
		p.c("muted", "Secondary text specimen");
		live_contrast($box, $line);
		if (depth > 0) card("card", "↳ Nested card", depth - 1);
	});
}

export default new Page({
	meta: import.meta,
	title: "Color Schemes",
	description: "Figma's nested cards rebuilt in the real system: `.card` steps one notch darker inside itself, and the contrast number is read off the rendered pixels, not guessed.",
	icon: "palette",
	content(){
		md("Each card sits on the one before it. A nested card is just a `.card` inside a `.card` — the system's own one-step darken, never a hand-picked overlay per level. Under every title is the contrast of its own text, read straight off the rendered pixels.");

		div.c("wide grid gap auto", () => {
			card("card bg-white", "White", 1);
			card("card bg-prime", "Prime", 1);
			card("card bg-dark", "Dark", 1);
		}).style("--column", "20em");

		md("## Can a card nest four deep?\nSame `.card`, four levels down. The step does not compound — level two reads exactly like level one, because every nested `.card` on this ground reads the same `--bg-darken-amt`. One step is the whole claim; a page that wants to go darker on purpose reaches for `.darken-2` / `.darken-3`, not another layer of nesting.");

		div.c("wide grid gap auto", () => {
			card("card bg-white", "White", 4);
		}).style("--column", "20em");
	},
});
