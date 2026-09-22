import { Doc, md, demo, div, span, textarea } from "/app.js";
import Dictate from "./Dictate.js";

/* The card's own context — a real textarea, dictated into live. `$out` mirrors
 * the box's value so a screenshot of the DEMO proves the wire without a
 * console open, same trick as Tags/Menu's own pickers. */
const demo_box = () => {
	let $ta, $out;

	const $box = div.c("flex v gap", () => {
		new Dictate({ $input: () => $ta });
		$ta = textarea.c("ux-dictate-demo-box").attr("rows", "3")
			.attr("placeholder", "click 🎤 and talk — or type here")
			.on("input", () => $out.text($ta.el.value || "(empty)"));
		$out = span.c("muted", "(empty)");
	}).style("--gap", "calc(var(--gap) * 0.5)");

	return $box;
};

const words = () => div.c("flex v gap-2em", () => {
	div.c("flex v gap", () => { div.c("h4 muted", "default"); demo_box(); }).style("--gap", "calc(var(--gap) * 0.5)");
	div.c("flex v gap", () => { div.c("h4 muted", "ui-contrast ui-compact"); demo_box().ac("ui-contrast ui-compact"); }).style("--gap", "calc(var(--gap) * 0.5)");
});

export default new Doc({
	meta: import.meta,
	title: "Dictate",
	description: "A mic button with a state you can always see and an error said in plain words — whisper running on this machine first, the browser's own recognition second.",
	icon: "mic",

	files: "Dictate.js capture.js pcm-worklet.js Dictate.css page.js readme.md",
	notes: "decisions",

	children: [
		demo.page("words", words, {
			note: "The same box twice, the lower one wearing `ui-contrast ui-compact`. A **ux never ships a compact mode** — both tiers read the same framework tokens, so a [config word](/framework/ui/words/) on the section re-skins it in one pass." }),
	],

	content(){

		md("**Press 🎤 and talk.** The small text beside it names which engine answered — `whisper (local)` when `whisper-server` is running on this machine, `Chrome's built-in recognition` when it is not. Words appear GREYED while whisper is still guessing at the sentence in the air, and turn solid the moment a pause settles it — that live guess is what the old control never showed.");

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(demo_box, steer).ac("bleed"),
			def: demo_box,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**idle → listening → (a pause) → transcribing → idle**, or **error** the moment either engine says something is wrong — never silence. Off `localhost`, or with neither engine reachable, no 🎤 is drawn at all.",
		});

		md("## Why it was silent before");

		md("`ext/Ask/mic.js` (the old control) already called `on_error` when the browser fired an `error` event — but Chrome can finish a WHOLE session hearing nothing, firing neither a result NOR an error, and that is exactly what this control's watchdog catches now: six seconds of silence with nothing heard becomes a plain sentence, not nothing. The engine order also changed: whisper — private, and answering a 10-second clip in well under a tenth of a second on this GPU — is tried first; the browser is the fallback, not the only path.");

		md("## What actually moved");

		md("Whisper is not streaming, so **live** is faked on purpose: the growing recording is re-sent to `whisper-server` about every 1.5s while the owner keeps talking, shown grey after the settled text, and replaced with the real answer the moment a ~700ms pause (or 15s) closes that segment — full mechanics, the epoch guard that stops a stale answer from painting over a newer segment, and the RMS numbers behind the level meter: [`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/).");

		md("**`ext/Ask/reply.js`'s reply mic and dictate box now build this instead of the old `Mic` class** — same call shape (`dictate(() => this.$input, opts)`), so neither call site needed to change beyond the import.");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", demo_box)); },
});
