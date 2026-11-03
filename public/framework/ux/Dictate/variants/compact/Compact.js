import { View, div } from "../../../../core/View/View.js";
import Dictate from "../../Dictate.js";

View.stylesheet(import.meta, "Compact.css");

/**
 * **The compact desktop inline variant.** Meant to sit inside a toolbar or a single
 * form row — never a growing block of history, only ONE short line: the live guess
 * while talking, or the last finished sentence once it settles, truncated from the
 * front so the newest words are always the ones still visible.
 *
 * Overrides two methods — everything else (the button, the engine name, every error
 * message, the start sound's real timing) is the same `Dictate` as the full-size widget:
 *
 * - `build_output()` — the same one `$caption` line, wearing an extra class so the
 *   compact CSS (below) applies from the very first render, not only once something has
 *   actually been said.
 * - `draw_caption()` — shows only the LAST piece of text, truncated from the front,
 *   instead of the base class's whole capped history.
 */
export default class CompactDictate extends Dictate {

	build_output(){
		this.ac("ux-dictate-compact");   // marks the ROOT — Compact.css uses it to hide the "stop after a
		                                  // pause" checkbox row too: a real option, but real bulk a one-line
		                                  // toolbar mic can't afford. `mode: "open"` would hide it for free,
		                                  // but would also stop this variant writing into a target `$input`,
		                                  // which its own page explicitly offers it for ("a single-line
		                                  // quick note field") — so this hides ONLY the extra row instead.
		this.$caption = div.c("ux-dictate-caption ux-dictate-caption-compact muted");
	}

	draw_caption(){
		const shown = this.partial_text || this.settled_lines?.at(-1) || "";
		this.$caption.text(shown.length > this.compact_chars ? "…" + shown.slice(-this.compact_chars) : shown);
	}
}

CompactDictate.prototype.compact_chars = 60;   // how much of the last sentence stays visible; CSS ellipsis catches the rest
