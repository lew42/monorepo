import { Doc, md, demo, div, span, textarea, h2, icon, a, small, h4 } from "/app.js";
import Dictate from "./Dictate.js";
import chat, { new_session_button } from "./chat.js";
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

// Linked from the page's own prose (below), not the tab strip — ask 7, see content().
const words = () => div.c("flex v gap-2em", () => {
	div.c("flex v gap", () => { div.c("h4 muted", "default"); demo_box(); }).style("--gap", "calc(var(--gap) * 0.5)");
	div.c("flex v gap", () => { div.c("h4 muted", "ui-contrast ui-compact"); demo_box().ac("ui-contrast ui-compact"); }).style("--gap", "calc(var(--gap) * 0.5)");
});

/* THE WORKBENCH (one-dictation, "the Dictate page is the workbench" — the owner,
 * 2026-10-01). Before this, the main demo was a bare `new Widget({level, source,
 * debug})`, with no session wired up, so nobody ever answered it. Now it's a real
 * `chat()` mount — the exact same call the ✦ sheet, the ☰ drawer and every card
 * sidebar make (`doc/chat.md`) — so a fix proved right here reaches every one of
 * them. `keep: false`: this demo gets its OWN session, same as a real conversation
 * (the first thing said really does start two real agents), but never remembered —
 * leave this page and the mic stops; come back and it's a brand new, empty mount,
 * never the old one resumed. The global, kept-forever session (the ✦ rail's own
 * reason to exist) is never touched by this demo. `new_session_button()` (item 3)
 * is the one button every surface shares — this demo gets it too, so a reader can
 * clear this one demo's own session without affecting anything else on the site.
 *
 * ONE WIDGET, NOT TWO (merge 11, "one widget," 2026-10-01): this call used to pass
 * `level: true, source: true, debug: true`, plus a `mode` set by a Dictate | Chat
 * switch drawn above the box — the owner used this page and the ✦ sheet and found
 * they "look alike but behave differently," and that extra config was most of the
 * difference. This is now the EXACT SAME `chat()` call the sheet makes
 * (`ext/drawer/rail.js`'s `ensure_mount()`): only `keep` differs, because this demo's
 * own conversation is never the owner's real one. `level`/`source`/`debug` are still
 * real `Widget` options (`Widget.js`'s own class doc) — turning them off here doesn't
 * remove them, it just stops using them here: the debug views already live one click
 * away at [playground](/framework/ux/Dictate/playground/), and the level bars are
 * being replaced everywhere by the pulsing dot (merge 12). `doc/decisions.md` has the
 * owner's own words for why the Dictate | Chat switch went entirely: autosend after a
 * pause is the default now, and the only behaviour — there is no second mode to
 * switch to any more besides `live` (merge 13). */
function demo_mount(){
	let $slot, mount;
	const $box = div.c("flex v gap", () => {
		div.c("flex wrap gap v-center", () => {
			new_session_button(() => mount);
			span.c("muted", "This demo has its own session. It starts fresh when you leave the page.");
		});
		$slot = div.c("ux-dictate-page-demo");
	}).style("--gap", "calc(var(--gap) * 0.5)");

	mount = chat($slot.el, { placeholder: "say something", keep: false });

	// LEAVING THE PAGE: there is no framework-wide "unmount" hook to hang a cleanup
	// on (`Dictate.js`'s own `hotkey()` doc names the same gap) — this watches for
	// the slot itself leaving the page's DOM, the same trick `ext/drawer/tabs/ai.js`'s
	// own mount cleanup uses, then stops the mic and drops the mount so its private
	// session is gone for good, not just hidden.
	const mo = new MutationObserver(() => {
		if ($slot.el.isConnected) return;
		mo.disconnect();
		mount.panel?.stop_mic();
		mount.remove();
	});
	mo.observe(document.body, { childList: true, subtree: true });

	return $box;
}

export default new Doc({
	meta: import.meta,
	title: "Dictate",
	description: "A mic button with a state you can always see and an error said in plain words — whisper running on this machine first, the browser's own recognition second.",
	icon: "mic",

	files: "Dictate.js capture.js pcm-worklet.js Dictate.css Widget.js Widget.css chat.js page.js readme.md",
	notes: "handover decisions silence https-lan widget chat",

	children: [
		"demo",
		demo.page("words", words, {
			note: "The same box twice, the lower one wearing `ui-contrast ui-compact`. A **ux never ships a compact mode** — both tiers read the same framework tokens, so a [config word](/framework/ui/words/) on the section re-skins it in one pass." }),
		"playground",
		"variants",
		"surfaces",
		"v1",
	],

	content(){

		// FEWER TABS ON MOBILE (ask 7, the owner's phone: the tab row "takes three
		// rows"). `ext/tabs` itself only scrolls a strip (doc/overflow.md) — it has no
		// grouping or "more ▾", and it is shared by every page on the site (out of this
		// task's fence). `core/Page/Log.js`'s own `tab({name, nav:false})` line is
		// already how a tab is pulled OUT of the strip while staying a real, reachable
		// page (`ext/Doc/Doc.js`'s own Overview/API/Docs/Files use the opposite,
		// `nav:true`, to PIN theirs) — so "words" (the same demo box under two config
		// words, a detail) and "v1" (kept reachable, not a front door) are marked
		// `nav:false` here: two fewer tabs in the strip, both still one click away from
		// a link in this page's own prose, below.
		this.tab({ name: "words", nav: false });
		this.tab({ name: "v1", nav: false });
		this.nav_redraw();   // the strip is already drawn by the time content() runs — repaint it

		// THE WIDGET FIRST (the owner, 2026-09-30, from the phone: "there's so much text
		// on the page before anything useful… the button is so far down the page… then
		// the actual transcription is below another paragraph or two"). Right under the
		// title and tabs Doc already draws, no paragraph above it — press 🎤 and see a
		// bubble the instant a sentence settles. `debug` opens the SAME five tabs the old
		// Overview led with (Widget.Debug reuses `pg.widget()`, never rebuilds it); `level`
		// and `source` add the meter and the mic picker. The OLD Overview, unchanged, is
		// one click away at "v1" (deliverable 5, "never destroy a viable version").
		//
		// THIS IS THE WORKBENCH NOW (one-dictation, 2026-10-01) — not a bare `new
		// Widget(...)` any more, but a real `chat()` mount (`demo_mount()`, above): say
		// something here and the fast/smart pair actually answers, same as every other
		// surface. See `demo_mount()`'s own doc for why `keep: false`.
		demo_mount();

		md("**The same widget as the ✦ sheet, now actually answered** — say something, or talk into the mic. [Docs](doc/) has the rest.");

		h2("How it works");
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

		md("**Press 🎤 and talk.** With `whisper-server` running on this machine nothing else shows; without it, the small text beside the button says `the browser's recognizer`. Words appear GREYED while whisper is still guessing at the sentence in the air, and turn solid the moment a pause settles it — that live guess is what the old control never showed.");

		md("**This plain mic button is what other pages embed** — no tabs, no diff view, just the one control. Want a different LOOK on top of the same mic — a wall of prompt cards, a one-line compact toolbar mic? See [Variants](/framework/ux/Dictate/variants/). Want to see the SAME `chat()` widget live on every real surface — the ✦ sheet, the drawer, a card, the dev bar — side by side, saying the same thing at once? See [Surfaces](/framework/ux/Dictate/surfaces/). The same box under `ui-contrast ui-compact` is at [words](words/); the [old Overview](v1/) (the five-tab playground leading) is still one click away.");

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
