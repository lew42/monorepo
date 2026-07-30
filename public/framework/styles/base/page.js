import { Page, md, demo, div, p, ul, li, img, input, button, textarea, form, fieldset, legend, pre } from "/app.js";

/* No stylesheet: every box below is framework utilities. A page arguing for
 * fewer styles that shipped its own would be arguing against itself. */

// The same markup twice — left with one base declaration reverted inline, right
// as the framework leaves it. One rule per pair, so you see exactly what the
// line buys.
const compare = (without, with_) =>
	div.c("flex gap all-1", () => {
		div(() => { div.c("h4", "without"); without(); });
		div(() => { div.c("h4", "with");    with_(); });
	});

const box = { background: "rgba(0,0,0,0.06)", width: "10em" };

// a 1x1 gif, so the img demo needs no asset
const dot = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

export default new Page({
	meta: import.meta,
	title: "base",
	description: "The reset — ten rules that fix what the browser gets wrong. Nothing here is a look.",
	content(){

		md("```css\n@layer base { … }\n```\n\nThe first layer, so everything beats it. Ten rules, all correcting a browser default that is simply wrong for a modern document. **Nothing in here is a look** — that's the next layer.");

		md("## Sizing");

		demo(() => {
			compare(
				() => div.c("pad").style({ ...box, boxSizing: "content-box" }).text("width: 10em"),
				() => div.c("pad").style(box).text("width: 10em")
			);
		}, "`*, *::before, *::after { box-sizing: border-box }` — padding stops making things wider than you asked for. The one rule nobody has ever wanted reverted.");

		demo(() => {
			compare(
				() => div(() => img().attr("src", dot)
					.style({ width: "4em", height: "2em", display: "inline", background: "#c66" })).style(box),
				() => div(() => img().attr("src", dot)
					.style({ width: "4em", height: "2em", background: "#c66" })).style(box)
			);
		}, "`img, picture, video, canvas, svg { display: block; max-width: 100% }` — inline images sit on the text baseline, so the container grows a few px of descender space under them. The gap on the left is that bug.");

		md("## Text");

		demo(() => {
			compare(
				() => div.c("pad").style({ ...box, overflowWrap: "normal" }).text("Supercalifragilisticexpialidocious"),
				() => div.c("pad").style(box).text("Supercalifragilisticexpialidocious")
			);
		}, "`body { overflow-wrap: break-word }`, repeated for `p` and `h1`–`h6` — one long token stops blowing out the layout. The headings need their own rule because the value doesn't inherit through elements that set it themselves.");

		demo(() => {
			compare(
				() => pre("a very long line of code that will not fit inside this narrow column at all").style("white-space", "pre-wrap"),
				() => pre("a very long line of code that will not fit inside this narrow column at all")
			);
		}, "`pre { overflow-x: auto }` — code scrolls sideways instead of wrapping. Wrapped code is *wrong* code; a scrollbar is honest.");

		demo(() => {
			compare(
				() => ul(() => { li("first"); li("second"); }).style("padding-left", "40px"),
				() => ul(() => { li("first"); li("second"); })
			);
		}, "`ul, ol { padding-left: 1.2em }` — the browser's 40px indent is a fixed pixel value in an `em`-scaled document, so it doesn't hold its proportion when the text resizes.");

		md("`body { margin: 0; line-height: 1.5 }` rounds out the text rules — no demo needed for either, and `-webkit-font-smoothing: antialiased` is a one-line Safari nicety.");

		md("## Forms");

		demo(() => {
			compare(
				() => div.c("flex gap", () => {
					input().attr("value", "text").style({ font: "revert", width: "auto" });
					button("button").style("font", "revert");
				}),
				() => div.c("flex gap", () => {
					input().attr("value", "text").style("width", "auto");
					button("button");
				})
			);
		}, "`input, button, textarea, select { font: inherit }` — form controls opt out of the document font *by default*, in every browser. This opts them back in — font family, size, weight, all of it.");

		demo(() => {
			compare(
				() => form(() => fieldset(() => { legend("Legend"); p("Field"); })
					.style({ border: "2px groove", padding: "0.35em 0.75em", margin: "0 2px" })),
				() => form(() => fieldset(() => { legend("Legend"); p("Field"); }))
			);
		}, "`form, fieldset, legend { border: none; margin: 0; padding: 0 }` — the UA's `groove` border and its odd asymmetric padding are a 1996 look you would never choose.");

		demo(() => {
			compare(
				() => input().attr("placeholder", "auto width").style("width", "auto"),
				() => input().attr("placeholder", "full width")
			);
		}, "`input:not([type=checkbox], [type=radio], [type=submit], …), select, textarea { width: 100% }` — text inputs fill their container instead of defaulting to a mysterious 20-character `size`. The `:not()` list is every control where that would be absurd.");

		demo(() => {
			compare(
				() => textarea("resize me").style("resize", "both"),
				() => textarea("resize me")
			);
		}, "`textarea { max-width: 100%; resize: vertical }` — a textarea can grow taller, never wider than its column. Drag the corner of each.");

		md("## Next");

		md("`base` is the floor. What things actually *look* like starts one layer up — [theme](/framework/styles/theme/).");
	}
});
