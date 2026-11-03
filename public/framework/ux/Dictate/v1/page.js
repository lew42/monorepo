import { Doc, md, demo, div, span, textarea, h2, icon, a, small, h4 } from "/app.js";
import Dictate from "../Dictate.js";
import { pg } from "../playground/Playground.js";
import { page_work_strip } from "/framework/core/Page/ai/work.js";

/* THE OLD OVERVIEW, FROZEN (kept reachable, 2026-09-30 — "never destroy a viable
 * version"). This is the Dictate Overview exactly as it read before the widget-first
 * pass: the big five-tab playground at the top, THEN the four-part pipeline diagram,
 * the concept tiles and the rest. The current Overview (one click away, at
 * `/framework/ux/Dictate/`) leads with the new compact `Widget` instead — see
 * `../page.js` and `../Widget.js`. Nothing here is wired to anything new; it is a
 * plain copy, so it keeps working exactly as it always did even as the real page
 * changes around it. */

const CONCEPTS = [
	{ name: "The mic button", icon: "mic", href: "../demo/", blurb: "press it, watch the state — idle → listening → transcribing" },
	{ name: "Playground", icon: "science", href: "../playground/", blurb: "raw whisper text, the fast assistant's corrections, and the live diff" },
	{ name: "Variants", icon: "style", href: "../variants/", blurb: "v1, Cards, Compact — same engine, three different looks" },
	{ name: "Decisions", icon: "menu_book", href: "../doc/decisions/", blurb: "the install, the segment/resend mechanics, who starts whisper-server" },
];

const pipeline_tiles = () => div.c("flex wrap gap v-center wide ux-dictate-pipeline", () => {
	const tile = (title, sub, href) => a.c("card pad flex v gap ux-dictate-pipeline-tile").href(href).append(() => {
		h4(title);
		span.c("muted", sub);
	});
	tile("Audio", "the microphone, levels, recording", "/framework/audio/");
	span.c("ux-dictate-pipeline-arrow muted", "→");
	tile("Whisper", "raw text — its exact words, nothing edited", "/framework/audio/Transcriber/");
	span.c("ux-dictate-pipeline-arrow muted", "→");
	tile("Revise", "clean · edit · summary", "/framework/ux/Revise/");
	span.c("ux-dictate-pipeline-arrow muted", "→");
	tile("Where it goes", "a card, a composer, the prompt log", "/framework/ai2/");
}).style("--gap", "0.6em");

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

export default new Doc({
	meta: import.meta,
	title: "Dictate — v1 Overview",
	description: "The old Dictate Overview, kept reachable exactly as it was before the widget-first pass — the playground leads, the pipeline diagram and concept tiles come after it.",
	icon: "mic",

	notes: "handover decisions silence https-lan",

	content(){
		md("**This is the old Overview** — [the current one](/framework/ux/Dictate/) now leads with the compact widget instead. Nothing here changed; it's kept one click away so this exact page never disappears.");

		md("**Press 🎤 and talk** (or ▶ Sample, no mic needed). Five tabs show one session five ways:");
		md("- **Raw** — Whisper's exact words, never edited.\n- **Chunks** — every guess as Whisper hears more, one row each.\n- **Corrections** — what Revise (at the picked level) changed, as a diff.\n- **Live** — the same diff, fading into the clean text.\n- **Side by side** — Raw and Revised in two plain columns.");
		pg.widget();

		h2("How it works");
		md("**Dictation, assembled from four parts.** Talk into a mic; Whisper turns the sound into raw text; Revise cleans, edits or summarizes it; then it lands wherever it's going — a card, a composer, a prompt log.");

		pipeline_tiles();

		div.c("wide flex auto gap", () => {
			CONCEPTS.forEach(c => a.c("card flex v gap-35").href(c.href)
				.style({ textDecoration: "none", color: "var(--ink)" })
				.append(() => {
					icon(c.icon).style({ fontSize: "2rem" });
					span(c.name).style({ fontWeight: "700" });
					small.c("muted", c.blurb);
				}));
		}).style("--column", "14rem");

		h2("What's in flight");
		div.c("card pad", $box => page_work_strip($box, {
			match: ["dictat", "mic", "whisper"],
			page: this,
		}));

		md("**Press 🎤 and talk.** With `whisper-server` running on this machine nothing else shows; without it, the small text beside the button says `the browser's recognizer`. Words appear GREYED while whisper is still guessing at the sentence in the air, and turn solid the moment a pause settles it — that live guess is what the old control never showed.");

		md("**This plain mic button is what other pages embed** — no tabs, no diff view, just the one control. The playground at the top is the full view of the same pipeline. Want a different LOOK on top of the same mic — a wall of prompt cards, a one-line compact toolbar mic? See [Variants](/framework/ux/Dictate/variants/): a variant is a subclass overriding one or two methods, and today's box above is variant v1, kept reachable forever.");

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
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", demo_box)); },
});
