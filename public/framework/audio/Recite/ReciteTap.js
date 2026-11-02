import track from "../../core/track/track.js";
import ReciteHighlight from "./ReciteHighlight.js";

/**
 * class ReciteTap — `Recite.Tap`: tapping a chat bubble plays or pauses whatever Recite is reading right now, the
 * same gesture as the bar's own Play button, so the owner doesn't need to find the bar to pause mid-reply. A tap on
 * a link, a mention chip or a button inside the bubble is left alone — it does its own thing, never toggling
 * playback. A tap on a reply bubble that carries a `Recite.Bubble` control plays or pauses THAT bubble
 * (`recite.tap_bubble`): the one being read pauses or carries on, any other is read again from the word it last
 * stopped at, else from its start. A tap elsewhere in the chat toggles whatever Recite is doing now.
 *
 *   new Recite.Tap({ recite });   // Recite makes one for itself: recite.tap
 */
export default class ReciteTap {

	/** Never toggle on a tap here — every one of these has its own job to do on a tap. */
	static IGNORE = "a, button, input, textarea, select, [role=button], [contenteditable]";

	constructor({ recite }){
		this.recite = recite;
		if (typeof document === "undefined") return;   // node (the core test): no DOM to listen on
		this.handler = e => this.click(e);
		document.addEventListener("click", this.handler);
		this.constructor.track(this);
	}

	/** The chat root a tap at `e` lands in, or null when it is not a tap on bubble text: a link, chip, button or form field has its own job, the bar's copy is skipped, and a drag that left a selection INSIDE THIS root is a select, not a tap (a selection elsewhere on the page must not block every bubble; review finding, read-aloud-b 2026-11-02). */
	static root_of(e){
		if (e.target.closest(ReciteTap.IGNORE)) return null;
		if (e.target.closest(ReciteHighlight.SKIP)) return null;   // the bar's own copy (ReciteHighlight.SKIP), not this class's IGNORE list above
		const root = e.target.closest(ReciteHighlight.ROOTS);   // only inside a chat bubble
		if (!root) return null;
		const sel = globalThis.getSelection?.();
		if (sel && sel.toString() && root.contains(sel.anchorNode)) return null;
		return root;
	}

	click(e){
		if (e.recite_handled || !ReciteTap.root_of(e)) return;
		const B = this.recite.constructor.Bubble, bubble = e.target.closest(B.HOST);
		if (bubble){ this.recite.tap_bubble(B.text_of(bubble), bubble); return; }
		if (!this.recite.chunks.length) return;   // nothing to play or pause
		this.recite.toggle();
	}
}

track(ReciteTap);
