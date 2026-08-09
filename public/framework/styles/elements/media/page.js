import { Page, md, demo, div, span, img, video, audio, iframe, figure, figcaption, icon } from "/app.js";

/* No stylesheet — see base/page.js. */

// The site's own mark, so the img demos need no fixture.
const logo = "/assets/img/m_svg.svg";

export default new Page({
	meta: import.meta,
	title: "Media",
	description: "One reset declaration covers five replaced elements — and misses two that have factories.",
	icon: "image",
	content(){

		demo(() => {
			img().attr("src", logo).attr("alt", "the lew42 mark").style({ width: "6em" });
		}, "`img, picture, video, canvas, svg { display: block; max-width: 100% }` is the whole media stylesheet. **`display: block` is the load-bearing half:** an inline image sits on the text baseline, so its container grows a few pixels of descender space underneath it — a gap you can spend a long time hunting. `max-width: 100%` is what stops an image wider than its column from overflowing.");

		md("There's no `height: auto` in that rule, which is worth knowing: an image with a `width` attribute and no `height` scales correctly, but one with **both** attributes will squash when `max-width` kicks in. Set `height: auto` yourself, or size it in CSS as above.");

		md("## figure and figcaption");

		demo(() => {
			figure(() => {
				img().attr("src", logo).attr("alt", "the lew42 mark").style({ width: "5em" });
				figcaption("The mark — a caption is plain text, so no backticks here.");
			});
		}, "`figcaption` isn't styled at all. `figure` has exactly one declaration — `figure { margin: 0 }` — and finding out why it needed one is the best thing this page did: the browser's default is `margin: 1em 40px`, and the flow rules in `framework.css` zero only `margin-block`, so the **40px inline margins survived** and every figure on the site sat indented from everything around it. Set the spacing you want where you use it; the base's job was only to stop the browser inventing one.");

		md("## video");

		demo(() => {
			video().attr("controls", "").style({ height: "5em", background: "var(--wash)" });
		}, "The empty player box — no `src`, so there's nothing to play. `video` is in the reset's list, so it's a block and it can't overflow its column. Everything else about it is the browser's shadow tree, and the framework has no rules for it.");

		md("## The two the reset misses");

		demo(() => {
			div.c("flex v gap", () => {
				audio().attr("controls", "");
				iframe().attr("srcdoc", "<p>an iframe</p>").attr("title", "example").style({ height: "4em" });
			});
		}, "`audio` and `iframe` both have factories and **neither is in `img, picture, video, canvas, svg`** — so both stay inline-replaced, both carry the baseline gap that rule exists to remove, and an `iframe` wider than its column overflows the page instead of shrinking. Adding them to the list is a two-word change; it's on the design record because nothing on this site embeds either one, and an unexercised rule is a guess.");

		md("## svg");

		demo(() => {
			div().html_unsafe(`<svg viewBox="0 0 64 24" width="128" height="48" aria-hidden="true">
				<rect width="64" height="24" rx="3" fill="var(--wash)"/>
				<circle cx="12" cy="12" r="7" fill="var(--prim)"/>
				<circle cx="32" cy="12" r="7" fill="var(--subtle)"/>
			</svg>`);
		}, "`svg` is in the reset's list and there is **no `svg()` factory** — and there can't be a naive one: `document.createElement(\"svg\")` builds an HTML element that happens to be called svg, in the wrong namespace, and renders nothing at all. Real SVG needs the HTML parser (`html_unsafe`, above), `createElementNS`, or an `<img src=…>`. The payoff is on the fills: an inline SVG inherits the document's custom properties, so `fill=\"var(--prim)\"` retints with the theme.");

		md("An `<img>` pointing at an SVG file can't do that — an image has no access to the page's tokens. That's why `/styles.css` paints the site's mark with a CSS `mask` instead: the file's alpha channel is the shape and `--prim` is the paint, so the logo follows the theme and never drifts from the artwork.");

		md("## Icons");

		demo(() => {
			div.c("flex gap v-center", () => {
				icon("dashboard");
				icon("text_fields");
				icon("palette");
				span.c("material-icons", "favorite");
				span("plain text, for scale");
			});
		}, "`icon(\"dashboard\")` emits `span.material-icons.icon`. Material Icons is a **ligature font** — the span really does contain the word `dashboard`, and the font's `liga` feature swaps in the glyph. Two consequences: an unloaded font shows the *word* rather than a blank box, and an inherited `text-transform` or `letter-spacing` would break the ligature match, which is why `.material-icons` resets both. Those are the font's requirements, not a look.");

		md("`.icon` is a **separate class** and it is only sizing — `font-size: 1.25em; line-height: 1; flex: 0 0 auto`. `em`, so an icon scales with the text beside it; `line-height: 1`, so it never grows the line box; `flex: 0 0 auto`, so it doesn't stretch in a row. The fourth icon above wears `.material-icons` without it, which is how an icon from any other set borrows the sizing.\n\nThe font is fetched by `app.font(\"Material Icons\")` — [`Font`](/framework/core/App/) loads it through the FontFace API and `App` waits for it before first paint, so icons never flash as words.");

		md("Next: [Misc](/framework/styles/elements/misc/) — `details`, focus rings, and the long list of elements with no rule at all.");
	}
});
