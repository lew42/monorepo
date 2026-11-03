import { View, div, span, button, input } from "../../core/View/View.js";
import { row } from "../../dev/DevBar/parts.js";
import Hotkeys from "./Hotkeys.js";

View.stylesheet(import.meta, "row.css");

/**
 * hotkeys_section() — the settings UI: a plain text filter, then one row per
 * registered action (its label, its current binding as readable text, and a
 * "press a key or button…" button). Each row is built from `dev/DevBar/parts.js`'s
 * own `row()`, so it looks like every other settings row on the site, not a
 * one-off style.
 *
 * ⚠ Does NOT wrap itself in `parts.js`'s `section(title, fn)` — the caller does
 * that (`ext/drawer/tabs/settings.js` already calls
 * `section("hotkeys", () => hotkeys_section())`), so this only draws the filter
 * and the rows. Wrapping it here too would stack two titles ("hotkeys" then
 * "Hotkeys") on that page. doc/decisions.md.
 *
 * Called directly inside whatever is capturing right now (a settings tab, this
 * module's own demo page) — same contract as `tools.js`'s `route()`/`server()`:
 * it appends itself and returns nothing.
 */
export function hotkeys_section(){
	let query = "", $list;

	input().attr("type", "text").attr("placeholder", "Filter hotkeys…").ac("dev-hotkeys-filter")
		.on("input", function(){
			query = this.el.value.trim().toLowerCase();
			draw();
		});

	$list = div.c("flex v gap ux-hotkeys-rows");

	draw();

	function draw(){
		$list.empty(() => {
			const actions = Hotkeys.all().filter(a => a.label.toLowerCase().includes(query));

			if (!actions.length){
				span.c("muted", "No hotkey matches.");
				return;
			}

			actions.forEach(action_row);
		});
	}

	// `row()` already appends its value span into the right place; building the
	// button INSIDE `$val.append(fn)` (rather than constructing it first and
	// handing it over as a value) keeps it captured correctly the first time —
	// a View appends itself to whatever is capturing at the moment it is built.
	function action_row(action){
		const $val = row(action.label, action.text + " ");

		$val.append(() => {
			const $btn = button.c("dev-knob", "press a key or button…").attr("type", "button");

			$btn.click(() => {
				$btn.text("press anything…");

				// Escape backs out. Without this, there was no way to cancel at
				// all — the very next key OR button anywhere became the new
				// binding, Escape included (found live, fresh-eyes review,
				// 2026-10-03). A CAPTURE-phase listener (the `true` below) runs
				// before `Hotkeys.listen()`'s own document listener — registered
				// at import time, bubble phase — ever sees the event, so Escape
				// itself is never handed to `Hotkeys.capture()`'s callback as a
				// binding.
				function on_escape(e){
					if (e.key !== "Escape") return;
					e.preventDefault();
					e.stopImmediatePropagation();
					document.removeEventListener("keydown", on_escape, true);
					Hotkeys.capturing = null;
					$btn.text("press a key or button…");
				}
				document.addEventListener("keydown", on_escape, true);

				Hotkeys.capture(binding => {
					document.removeEventListener("keydown", on_escape, true);
					Hotkeys.bind(action.name, binding);
					draw();
				});
			});
		});
	}
}
