import View, { div, p, span, ul, li, code } from "/app.js";
import { menu } from "/framework/ext/Layout/controls.js";

View.stylesheet(import.meta, "panes.css");

/* The pieces both pane pages share: what an editor type draws, the pane that wears
   one, and the divider between two panes. `page.js` composes them from a fixed
   nesting; `split/page.js` lets the reader cut new ones at runtime. */

export const EDITORS = {
	Outline: () => ul(() => "Frame Header Row Card Footer".split(" ").forEach(name => li(name))),

	Canvas: () => div.c("grid gap auto", () => [1, 2, 3, 4].forEach(n => div.c("pad surface", "Block " + n)))
		.style({ "--column": "5em", "--gap": "0.4em", "--pad": "0.6em" }),

	Properties: () => [["display", "flex"], ["gap", "1em"], ["column", "14em"], ["pad", "1em"]]
		.forEach(([key, value]) => div.c("flex split gap", () => { span.c("muted", key); code(value); })),

	Console: () => ['page{/studio/}.render()', 'router.go("/studio/color/")', "container() → app.$pages"]
		.forEach(line => p.c("muted", () => code(line))),

	Timeline: () => div.c("flex gap", () => [4, 7, 3, 9, 6, 2, 8].forEach(n =>
		div.c("wash flex-1").style("height", n * 0.4 + "em")))
		.style({ "--gap": "0.2em", alignItems: "flex-end" }),
};

export const TYPES = Object.keys(EDITORS);

// One pane: a type menu, whatever that type draws, and whatever the caller adds.
export function pane(type, actions){
	let $body;

	return div.c("apps-pane surface flex v", () => {
		// ⚠ `wrap`: a pane can be split down to a few ems, and a bar that cannot wrap
		// is a bar whose buttons the pane's own `overflow: hidden` silently eats.
		div.c("apps-pane-bar flex v-center wrap gap wash pad")
			.style({ "--gap": "0.3em", "--pad": "0.25em 0.4em" })
			.append(() => {
				menu(TYPES, next => $body.empty(() => EDITORS[next]()), type);
				actions?.();
			});

		$body = div.c("apps-pane-body flex-1 pad", () => EDITORS[type]()).style("--pad", "0.5em");
	});
}

export const grip = () => div.c("apps-grip wash").on("pointerdown", resize);

/* Drag a divider: the two panes on either side swap pixels and nothing else moves.
   The stage handle's shape — pointer capture, listeners on the grip, `preventDefault`
   so the drag is not a text selection. */
function resize(e){
	e.preventDefault();

	const grip = this.el;
	const prev = grip.previousElementSibling;
	const next = grip.nextElementSibling;
	if (!prev || !next) return;

	const row = !grip.parentElement.classList.contains("v");
	const from = row ? e.clientX : e.clientY;
	const a = row ? prev.offsetWidth : prev.offsetHeight;
	const b = row ? next.offsetWidth : next.offsetHeight;

	grip.setPointerCapture(e.pointerId);

	// ⚠ Clamped to the pair, so neither neighbour can be dragged out of existence.
	const drag = ev => {
		const delta = Math.max(40 - a, Math.min(b - 40, (row ? ev.clientX : ev.clientY) - from));

		prev.style.flex = "0 0 " + (a + delta) + "px";
		next.style.flex = "0 0 " + (b - delta) + "px";
	};

	grip.addEventListener("pointermove", drag);
	grip.addEventListener("pointerup", () => grip.removeEventListener("pointermove", drag), { once: true });
}
