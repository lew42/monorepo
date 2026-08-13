import { Page, md, demo, div, p, span, kbd, code } from "/app.js";
import { keys } from "./kbd.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran. `shortcut()` is a two-line helper, which
// is exactly what a `const` in the calling file is for.
const shortcut = (label, ...names) => div.c("flex gap v-center split", () => {
	span(label);
	keys(...names);
});

const list = () => div.c("surface pad flex v gap", () => {
	shortcut("Command palette", "Ctrl", "K");
	shortcut("Go to file", "Ctrl", "P");
	shortcut("Dismiss", "Esc");
}).style("--gap", "0.6em");

const rows = () => div.c("flex v gap", () => {
	keys("Ctrl", "Shift", "P");
	keys("⌘", "K");
	keys("Esc");
}).style("--gap", "0.6em");

const bare = () => div.c("flex v gap", () => {
	p(() => { span("Bare: press "); span.c("code", "Ctrl"); span(" then "); span.c("code", "K"); });
	p(() => { span("Keyed: press "); kbd.c("ui-key surface", "Ctrl"); span(" then "); kbd.c("ui-key surface", "K"); });
}).style("--gap", "0.8em");

export default new Page({
	meta: import.meta,
	title: "Keys",
	description: "keys() is the one function here — the box and the row are markup.",
	icon: "keyboard",

	children: [
		demo.page("keys", rows, {
			note: "`keys(...names)` puts a `+` **span** between real `<kbd>` elements rather than baking the separator into the text — so a screen reader still reads three keys, and the plus can be `--subtle` without dimming them. That interleave is the whole reason there is a function here at all." }),

		demo.page("bare", bare, {
			note: "The same words twice. Above, `kbd`'s inherited mono; below, `ui-key surface` — the shared surface plus three declarations. **The lip is the whole illusion**, and it is one of them: `border-bottom-width: 2px`." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(list, steer).ac("bleed"),
			def: list,
			file: new URL("kbd.js", import.meta.url).pathname,
			note: "**`keys()` stays; `key()` and `shortcut()` are gone.** The interleave loop that puts a `+` *between* keys is real logic — `key()` wrapped two class names, and `shortcut()` was a flex row with a label at one end. `flex gap v-center split` is that row: a label at one end, the keys at the other, no basis and no `flex-1`.",
		});

		md("## What `framework.css` already decided");

		code.css(`pre, code, kbd, samp, .code { font-family: var(--mono); }`);

		md("`kbd` is in the mono list *by meaning* — one of four elements the base theme claims — and that is where the base stops. It never draws the box, and it shouldn't: a key looks like a chip on one site and like a word on another, so the box is the component's.");

		md("The size is the one judgement call: `0.85em`, which is the optical correction `.demo-code` already makes for a mono pane, not a new level in the [type scale](/framework/styles/layers/theme/). Mono at body size reads a size larger than the words beside it.");

		md("Back to [UI](/framework/ui/) — the rail, and the encapsulation rule.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", list)); },
});
