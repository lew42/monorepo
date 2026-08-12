import { Page, md, demo, div, p, span, kbd, code } from "/app.js";
import { palette, copy } from "../parts.js";
import { keys } from "./kbd.js";

// The template, verbatim — rendered in the palette AND handed to copy(), so the
// code on the page is the code that ran.
const shortcut = (label, ...names) => div.c("flex gap v-center split", () => {
	span(label);
	keys(...names);
});

const list = () => div.c("surface pad flex v gap", () => {
	shortcut("Command palette", "Ctrl", "K");
	shortcut("Go to file", "Ctrl", "P");
	shortcut("Dismiss", "Esc");
}).style("--gap", "0.6em");

export default new Page({
	meta: import.meta,
	title: "Keys",
	description: "keys() is the one function here — the box and the row are markup.",
	icon: "keyboard",

	content(){

		palette(
			["ui.keys(…)", () => keys("Ctrl", "Shift", "P")],
			["a shortcut list", list],
		);

		md("## Copy it");

		copy(list);

		md("**`keys()` stays; `key()` and `shortcut()` are gone.** The interleave loop that puts a `+` *between* keys is real logic — `key()` wrapped two class names, and `shortcut()` was a flex row with a label at one end. One boxed key is `kbd.c(\"ui-key surface\", \"Esc\")`, and the site's one real key rendering used a bare `kbd(\"Ctrl\")` anyway.");

		md("## The separator is markup, not text");

		demo(() => {
			div.c("flex v gap", () => {
				keys("Ctrl", "Shift", "P");
				keys("⌘", "K");
				keys("Esc");
			}).style("--gap", "0.6em");
		}, "`keys(...names)` puts a `+` **span** between real `<kbd>` elements rather than baking the separator into the text — so a screen reader still reads three keys, and the plus can be `--subtle` without dimming them. That interleave is the whole reason there is a function here at all.");

		md("## What `framework.css` already decided");

		code.css(`pre, code, kbd, samp, .code { font-family: var(--mono); }`);

		md("`kbd` is in the mono list *by meaning* — one of four elements the base theme claims — and that is where the base stops. It never draws the box, and it shouldn't: a key looks like a chip on one site and like a word on another, so the box is the component's.");

		demo(() => {
			div.c("flex v gap", () => {
				p(() => { span("Bare: press "); span.c("code", "Ctrl"); span(" then "); span.c("code", "K"); });
				p(() => { span("Keyed: press "); kbd.c("ui-key surface", "Ctrl"); span(" then "); kbd.c("ui-key surface", "K"); });
			}).style("--gap", "0.8em");
		}, "The same words twice. Above, `kbd`'s inherited mono; below, `ui-key surface` — the shared surface plus three declarations. **The lip is the whole illusion**, and it is one of them: `border-bottom-width: 2px`.");

		md("The size is the one judgement call: `0.85em`, which is the optical correction `.demo-code` already makes for a mono pane, not a new level in the [type scale](/framework/styles/layers/theme/). Mono at body size reads a size larger than the words beside it.");

		md("## And the row");

		md("`flex gap v-center split` is the shortcut row — a label at one end, the keys at the other, no basis and no `flex-1`. It was a function called `shortcut()`; it is three words, and above it is a `const` in this file, which is where a two-line helper belongs.");

		md("Back to [UI](/framework/ui/) — the wall, and the encapsulation rule.");
	},

	preview(nav){
		return this.preview_card(nav, () => div.c("zoom-75 pad", () => div.c("flex v gap", () => {
			shortcut("Command palette", "Ctrl", "K");
			shortcut("Dismiss", "Esc");
		})));
	},
});
