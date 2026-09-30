import { Page, div, md } from "/app.js";
import PartsDictate from "./Parts.js";

export default new Page({
	meta: import.meta,
	title: "Parts",
	description: "Dictate's whisper half rebuilt on audio/'s MicStream + rolling-window Transcriber.Whisper — same caption, same log, same revise:, fewer hallucinated seams.",
	icon: "graphic_eq",

	files: "Parts.js",

	content(){
		md("Press 🎤 and talk. Looks and behaves exactly like the default Dictate — the caption, the level bar, the log, `revise:` if you set it. What changed is UNDER it: instead of cutting a segment on a pause or a 15-second cap and sending it once, this reads a live [`MicStream`](/framework/audio/MicStream/) and commits only the words two consecutive guesses AGREE on ([`Transcriber.Whisper`](/framework/audio/Transcriber/), the rolling local-agreement window).");

		div.c("pad card", () => new PartsDictate({}));

		md("Measured against the default's engine with a real monologue: **0 hallucinations / 0 lost words**, vs. 2 hallucinations / 1 lost word for the cut-and-append segments the default still uses — [`audio/doc/decisions.md`](/framework/audio/doc/decisions.md), \"Rolling window\".");

		md("This is a **pipeline** variant, not a look — it overrides `start_whisper()`, `on_level()`, `heartbeat()` and `stop()` (never `build_output()`/`draw_caption()`, so the caption you see is the exact same one every other variant draws). See [`Parts.js`](Parts.js) for why, and the browser's own `SpeechRecognition` engine is untouched.");

		md("**Not yet the default** — the owner tries this on its own url first ([`readme.md`](/framework/ux/Dictate/readme.md) links here) and switches `Dictate` itself over once it's proven in daily use. [v1](/framework/ux/Dictate/variants/v1/) keeps working exactly as it always has, either way.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new PartsDictate({}))); },
});
