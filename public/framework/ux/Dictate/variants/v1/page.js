import { Page, p, div, textarea, span } from "/app.js";
import Dictate from "../../Dictate.js";

/* Today's UI, kept reachable on its OWN url. Nothing here changes as new variants are
 * added — the owner's own rule: "even if the AI deems it not useful... we want at least
 * to save the snapshot of version one so I could click back to the first version" — this
 * page IS that snapshot. Same widget the plain `ux/Dictate` demo shows. */
export default new Page({
	meta: import.meta,
	title: "v1 — today's box",
	description: "The dictation box exactly as it has always worked: one caption line, growing settled text, a grey guess.",
	icon: "mic",

	content(){
		p("This is the ORIGINAL `Dictate` widget, unchanged — one caption line under the button, the settled text growing in the page's own ink, the still-moving guess shown grey. Every other variant on this site is a subclass that overrides one or two of its methods; this page exists so this exact look never quietly disappears while that happens.");

		let $ta, $out;
		div.c("flex v gap", () => {
			new Dictate({ $input: () => $ta });
			$ta = textarea.c("ux-dictate-demo-box").attr("rows", "3")
				.attr("placeholder", "click 🎤 and talk — or type here")
				.on("input", () => $out.text($ta.el.value || "(empty)"));
			$out = span.c("muted", "(empty)");
		}).style("--gap", "calc(var(--gap) * 0.5)");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => { new Dictate({}); })); },
});
