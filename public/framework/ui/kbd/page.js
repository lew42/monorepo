import { Page, md, demo, div, p, span, code } from "/app.js";
import { palette } from "../parts.js";
import { key, keys, shortcut } from "./kbd.js";

export default new Page({
	meta: import.meta,
	title: "Keys",
	description: "A real <kbd>, given the one thing the base theme leaves it without.",
	icon: "keyboard",

	content(){

		palette(
			["ui.key(…)", () => key("Esc")],
			["ui.keys(…)", () => keys("Ctrl", "Shift", "P")],
			["ui.shortcut(…)", () => shortcut("Command palette", "Ctrl", "K")],
			["a shortcut list", () => div.c("ui-surface pad flex v gap", () => {
				shortcut("Command palette", "Ctrl", "K");
				shortcut("Go to file", "Ctrl", "P");
				shortcut("Dismiss", "Esc");
			}).style("--gap", "0.6em")],
		);

		md("## Calling it");

		demo(() => {
			div.c("flex v gap", () => {
				shortcut("Command palette", "Ctrl", "K");
				shortcut("Dismiss", "Esc");
			}).style("--gap", "0.6em");
		}, "Three functions, smallest first: `key()` is one boxed `<kbd>`, `keys()` joins them with a `+`, `shortcut()` puts a label at one end and the keys at the other. **`split` is the utility this component was waiting for** — a two-part row needs no basis and no `flex-1`.");

		md("## What `framework.css` already decided");

		code.css(`pre, code, kbd, samp, .code { font-family: var(--mono); }`);

		md("`kbd` is in the mono list *by meaning* — one of four elements the base theme claims — and that is where the base stops. It never draws the box, and it shouldn't: a key looks like a chip on one site and like a word on another, so the box is the component's.");

		demo(() => {
			div.c("flex v gap", () => {
				p(() => { span("Bare: press "); span.c("code", "Ctrl"); span(" then "); span.c("code", "K"); });
				p(() => { span("Keyed: press "); key("Ctrl"); span(" then "); key("K"); });
			}).style("--gap", "0.8em");
		}, "The same words twice. Above, `kbd`'s inherited mono; below, `ui-key ui-surface` — the shared surface plus three declarations. **The lip is the whole illusion**, and it is one of them: `border-bottom-width: 2px`.");

		md("## The separator is markup, not text");

		demo(() => {
			div.c("flex v gap", () => {
				keys("Ctrl", "Shift", "P");
				keys("⌘", "K");
				keys("Esc");
			}).style("--gap", "0.6em");
		}, "`keys(...names)` puts a `+` **span** between real `<kbd>` elements rather than baking the separator into the text — so a screen reader still reads three keys, and the plus can be `--subtle` without dimming them.");

		md("The size is the one judgement call: `0.85em`, which is the optical correction `.demo-code` already makes for a mono pane, not a new level in the [type scale](/framework/styles/layers/theme/). Mono at body size reads a size larger than the words beside it.");

		md("Back to [UI](/framework/ui/) — the wall, and the encapsulation rule.");
	},
});
