import { Page, p, div, textarea, span } from "/app.js";
import Dictate from "./Dictate.js";

/* THE FROZEN SNAPSHOT, kept reachable on its OWN url forever — the owner's own rule:
 * "even if the AI deems it not useful... we want at least to save the snapshot of
 * version one so I could click back to the first version." `./Dictate.js` here is its
 * OWN module, a byte-for-byte copy of `ux/Dictate/Dictate.js` from before the
 * 2026-09-29 mobile-nav task — NOT the live one that new work keeps changing
 * (`ai/2026-09-29/mobile-nav/review.md`, finding 6: importing the live file meant this
 * page silently changed every time `Dictate.js` did, which defeats the whole point of
 * a snapshot). See that file's own header comment for exactly what "frozen" means. */
const SAMPLES = [
	"so I was thinking we should build the playground",
	"what do you think about the layout",
	"let's also add the audio source panel and the live level meter",
];

export default new Page({
	meta: import.meta,
	title: "v1 — today's box",
	description: "Frozen from before 2026-09-29: one caption line, growing settled text, a grey guess.",
	icon: "mic",

	files: "Dictate.js Dictate.css",

	content(){
		p("This is the ORIGINAL `Dictate` widget, frozen exactly as it worked before the 2026-09-29 mobile-nav task — one caption line under the button, the settled text growing in the page's own ink, the still-moving guess shown grey. It is its own copy of the file (`Dictate.js`, above), not the live one, so it can never quietly change again while every other variant keeps evolving.");

		let $ta, $out;
		div.c("flex v gap", () => {
			const dictate = new Dictate({ $input: () => $ta });
			$ta = textarea.c("ux-dictate-demo-box").attr("rows", "3")
				.attr("placeholder", "click 🎤 and talk — or type here")
				.on("input", () => $out.text($ta.el.value || "(empty)"));
			$out = span.c("muted", "(empty)");
			dictate.sample(SAMPLES);
		}).style("--gap", "calc(var(--gap) * 0.5)");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => { new Dictate({}).sample(SAMPLES); })); },
});
