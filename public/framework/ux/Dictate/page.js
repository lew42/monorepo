import { Doc, md, demo, div, span, textarea, h2, icon, a, small, h4 } from "/app.js";
import Dictate from "./Dictate.js";
import { pg } from "./playground/Playground.js";
import { page_work_strip } from "/framework/core/Page/ai/work.js";

/* Level 1, above the fold: what the dictation SYSTEM is made of, as linked
   icon tiles — the page skill's "first thing on a page" (5a). Same pattern
   core/Page/ai/page.js uses for its own five parts; a real ux/Content/Concepts
   module (new child pages) would be the graduated version of this once one
   exists for a page whose children are already this settled. */
const CONCEPTS = [
	{ name: "The mic button", icon: "mic", href: "demo/", blurb: "press it, watch the state — idle → listening → transcribing" },
	{ name: "Playground", icon: "science", href: "playground/", blurb: "raw whisper text, the fast assistant's corrections, and the live diff" },
	{ name: "Variants", icon: "style", href: "variants/", blurb: "v1, Cards, Compact — same engine, three different looks" },
	{ name: "Decisions", icon: "menu_book", href: "doc/decisions/", blurb: "the install, the segment/resend mechanics, who starts whisper-server" },
];

/* THE FIRST SCREEN (the owner, 2026-09-29: this page "feels fuzzy"). One line
 * saying what this IS, the pipeline as four linked tiles — audio in, Whisper's
 * raw words out, Revise cleans/edits/summarizes them, then somewhere they
 * land — then the live playground widget right below. Detail (the mechanics,
 * the RMS numbers, why it was silent before) stays further down, one click
 * from a tile or a heading, never repeated up here. */
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
	notes: "handover decisions silence https-lan",

	children: [
		"demo",
		demo.page("words", words, {
			note: "The same box twice, the lower one wearing `ui-contrast ui-compact`. A **ux never ships a compact mode** — both tiers read the same framework tokens, so a [config word](/framework/ui/words/) on the section re-skins it in one pass." }),
		"playground",
		"variants",
	],

	content(){

		md("**Dictation, assembled from four parts.** Talk into a mic; Whisper turns the sound into raw text; Revise cleans, edits or summarizes it; then it lands wherever it's going — a card, a composer, a prompt log.");

		pipeline_tiles();

		// The overview: what the dictation system is made of, shown before anything else.
		div.c("wide flex auto gap", () => {
			CONCEPTS.forEach(c => a.c("card flex v gap-35").href(c.href)
				.style({ textDecoration: "none", color: "var(--ink)" })
				.append(() => {
					icon(c.icon).style({ fontSize: "2rem" });
					span(c.name).style({ fontWeight: "700" });
					small.c("muted", c.blurb);
				}));
		}).style("--column", "14rem");

		// page_work() (core/Page/ai/work.js) — the system's own open work, right
		// after the overview it belongs to. A one-line strip (View B): this
		// page's main topic is the mic, not its own AI tasks, so it stays
		// closed until asked for (page-work-data.md names the match method
		// and why it's a keyword guess, not a real field, today). `page: this`
		// walks `page.parent` up to the root for the collapsed "Parent: …"
		// rows — no more hand-typed `ancestors:` that stopped at "ux" and
		// never showed Framework's own work (review-2.md finding 7).
		h2("What's in flight");
		div.c("card pad", $box => page_work_strip($box, {
			match: ["dictat", "mic", "whisper"],
			page: this,
		}));

		md("**Try it right here** — press 🎤 (or ▶ Sample, no mic needed) and watch the whole pipeline below. Five tabs show one session five ways:");
		md("- **Raw** — Whisper's exact words, never edited.\n- **Chunks** — every guess as Whisper hears more, one row each.\n- **Corrections** — what Revise (at the picked level) changed, as a diff.\n- **Live** — the same diff, fading into the clean text.\n- **Side by side** — Raw and Revised in two plain columns.");
		pg.widget();

		md("**Press 🎤 and talk.** The small text beside it names which engine answered — `Whisper on the PC` when `whisper-server` is running on this machine, `the browser's recognizer` when it is not. Words appear GREYED while whisper is still guessing at the sentence in the air, and turn solid the moment a pause settles it — that live guess is what the old control never showed.");

		md("**This plain mic button is what other pages embed** — no tabs, no diff view, just the one control. The playground above is the full view of the same pipeline. Want a different LOOK on top of the same mic — a wall of prompt cards, a one-line compact toolbar mic? See [Variants](/framework/ux/Dictate/variants/): a variant is a subclass overriding one or two methods, and today's box above is variant v1, kept reachable forever.");

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
