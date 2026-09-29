import { div } from "../../../../core/View/View.js";
import Dictate from "../../Dictate.js";

/**
 * **The mobile "prompt cards" flow** the owner asked for: "it just, maybe it opens up
 * like a little transcription window, and as you start saying things, it converts that
 * prompt into little cards — that's really what it should be, a prompt item." Every
 * finished utterance becomes its own small card in a stack, instead of one running line
 * of text — the shape `ext/drawer/rail.js`'s bottom sheet already builds by hand; this is
 * the same idea turned into a genuine `Dictate` variant, so any other page can use it with
 * one `new CardsDictate({...})` instead of copying that sheet's own drawing code.
 *
 * Overrides exactly two methods, per the owner's own rule ("extending the classes...
 * cherry pick a specific method") — everything else (engines, errors, the start sound's
 * real timing fixed in `ai/2026-09-29/mobile-nav/`) is inherited from `Dictate` untouched:
 *
 * - `build_output()` — a vertical card list instead of one caption line.
 * - `draw_caption()` — repaints the WHOLE list from `this.settled_lines` (every commit()
 *   already pushes here, in both modes) each time a segment settles or the live guess
 *   changes; the still-moving guess is its own last, muted card.
 *
 * Defaults to `mode: "open"` (the mic stays on, nothing is ever written into a box) —
 * exactly the "start listening, cards keep appearing" flow being asked for. A caller can
 * still pass `mode: null` and a `$input` to use it as a plain dictation box with cards
 * instead of a caption, since nothing here reads `mode` directly.
 */
export default class CardsDictate extends Dictate {

	build_output(){
		this.$cards = div.c("ux-dictate-cards flex v gap");
	}

	draw_caption(){
		// `.card` is framework.css's own framed-box utility (background, border,
		// padding, radius, all for free) — a new stylesheet here would only repeat it.
		this.$cards.empty(() => {
			for (const line of this.settled_lines ?? []) div.c("ux-dictate-card card", line);
			if (this.partial_text) div.c("ux-dictate-card card muted", this.partial_text);
		});
	}
}

CardsDictate.prototype.mode = "open";
