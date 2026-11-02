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

	/** Never toggle on a tap here: the bar's own copy, or anything with its own job to do on a tap. */
	static IGNORE = "a, button, input, textarea, select, [role=button], [contenteditable]";

	constructor({ recite }){
		this.recite = recite;
		if (typeof document === "undefined") return;   // node (the core test): no DOM to listen on
		this.handler = e => this.click(e);
		document.addEventListener("click", this.handler);
	}

	click(e){
		if (e.target.closest(ReciteTap.IGNORE)) return;
		if (e.target.closest(ReciteHighlight.SKIP)) return;   // never the bar's own copy
		if (!e.target.closest(ReciteHighlight.ROOTS)) return;   // only inside a chat bubble
		if (globalThis.getSelection?.()?.toString()) return;   // a drag to select text still fires `click` on mouseup — never a tap
		if (!this.recite.chunks.length) return;   // nothing to play or pause
		this.recite.toggle();
	}
}
