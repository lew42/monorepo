import track from "../../core/track/track.js";
import ReciteHighlight from "./ReciteHighlight.js";

/**
 * class ReciteTap — `Recite.Tap`: tapping a chat bubble plays or pauses whatever Recite is reading right now, the
 * same gesture as the bar's own Play button, so the owner doesn't need to find the bar to pause mid-reply. A tap on
 * a link, a mention chip or a button inside the bubble is left alone — it does its own thing, never toggling
 * playback. This toggles the one thing Recite is doing now; replaying a DIFFERENT, already-finished bubble from its
 * own place is "resumable bubbles" (readme.md's Open list), not built here.
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

	click(e){
		if (e.target.closest(ReciteTap.IGNORE)) return;
		if (e.target.closest(ReciteHighlight.SKIP)) return;   // the bar's own copy (ReciteHighlight.SKIP), not this class's IGNORE list above
		const root = e.target.closest(ReciteHighlight.ROOTS);
		if (!root) return;   // only inside a chat bubble
		const sel = globalThis.getSelection?.();
		if (sel && sel.toString() && root.contains(sel.anchorNode)) return;   // a drag to select text INSIDE THIS bubble still fires `click` on mouseup — never a tap; a selection left over elsewhere on the page must not block every bubble (review finding, read-aloud-b 2026-11-02)
		if (!this.recite.chunks.length) return;   // nothing to play or pause
		this.recite.toggle();
	}
}

track(ReciteTap);
