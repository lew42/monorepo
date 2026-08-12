import { div, kbd, span } from "../../core/View/View.js";
import { component, css } from "../parts.js";

/* `framework.css` puts `kbd` in the mono list by MEANING and stops there — a key
 * looks like a chip on one site and like a word on another, so the box is the
 * component's. The heavier bottom border is the whole illusion. */
css(`@layer theme {
	.ui-key {
		padding: 0.1em 0.45em;
		border-bottom-width: 2px;
		font-size: 0.85em;
	}
	.ui-keys-sep { color: var(--subtle); font-size: 0.75em; }
}`);

/* keys("Ctrl", "K") — the separator is a span, so each key stays a real <kbd>
 * and a screen reader still reads two of them. */
export const keys = component((...names) => div.c("ui-keys flex v-center gap", () =>
	names.forEach((name, i) => {
		if (i) span.c("ui-keys-sep", "+");
		kbd.c("ui-key surface", name);
	})).style("--gap", "0.3em"));

export default keys;
