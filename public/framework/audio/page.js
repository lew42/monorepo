import { Doc, div, a, h4, span, md } from "/app.js";
import { View, icon } from "../core/View/View.js";
import MicStream from "./MicStream/MicStream.js";
import Recorder from "./Recorder/Recorder.js";
import Transcriber from "./Transcriber/index.js";

View.stylesheet(import.meta, "audio.css");

// Links resolve against this module, never the document: the index also draws beside a child
// page, where a bare "MicStream/" resolved under the child and 404d (page-audit, 2026-09-30).
const here = new URL(".", import.meta.url).pathname;

const TOOLS = [
	{ name: "MicStream", slug: "MicStream/", icon: "mic", blurb: "opens a mic; hands out its stream, level and device choice" },
	{ name: "Recorder", slug: "Recorder/", icon: "fiber_manual_record", blurb: "records, plays back, saves a clip" },
	{ name: "Transcriber", slug: "Transcriber/", icon: "subtitles", blurb: "turns a stream into text — Whisper or Chrome" },
];

/** How long to wait for whisper-server before giving up on it and using the
 *  browser's own engine instead (fix 3, 2026-09-30: the transcript must
 *  appear even with whisper-server down). A plain `fetch` with no body —
 *  any HTTP answer at all, even a 404, means the box is there; a thrown
 *  error (refused connection) or this timeout means it is not. */
async function whisper_reachable(url){
	try {
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), 800);
		await fetch(url, { signal: ctrl.signal });
		clearTimeout(timer);
		return true;
	} catch { return false; }
}

/** The ONE live demo, at the top of the page (the owner, 2026-09-30: "maybe
 *  some of these things need to be combined into a single demo"). Every
 *  part's own live-state view sits INSIDE its own step's card, right next to
 *  the controls that drive it — not in a separate list, so what moved is
 *  never more than an inch from what you just pressed:
 *
 *  1. `MicStream.Controls` (with `show_mode_switch`) picks the mic, shows
 *     the level, and a Hold/Toggle switch changes how the button works —
 *     plus `mic.row_view` right there, so "connected" / the level number
 *     are visible without hunting for them.
 *  2. `Transcriber.Transcript` shows the growing grey guess then the
 *     settled text. `t.start()` is overridden below to fall back to
 *     `Transcriber.Browser` (Chrome's own engine) the moment whisper-server
 *     is unreachable, so the transcript still appears either way — a small
 *     label says which engine actually answered.
 *  3. `Recorder.Controls` is optional — record the same stream, play it
 *     back — plus `rec.row_view`.
 */
function one_demo(){
	const mic = new MicStream({ mode: "toggle" });
	const t = new Transcriber.Whisper();
	const rec = new Recorder();
	let listening = false;
	let $engine_label;

	// Fall back to the browser's own engine when whisper-server can't be
	// reached, WITHOUT swapping the `t` object itself — `Transcriber.Transcript`
	// and `t.row_view` above are already bound to this exact instance, so the
	// fallback engine's events are re-fired through `t.note_partial`/
	// `note_final` instead (same on_partial/on_final a caller already wired).
	const whisper_start = t.start.bind(t);
	const whisper_stop = t.stop.bind(t);
	t.start = async mic => {
		if (await whisper_reachable(t.whisper_url)){
			$engine_label?.text("Engine: Whisper");
			return whisper_start(mic);
		}
		$engine_label?.text("Engine: Chrome (SpeechRecognition) — whisper-server unreachable");
		const fallback = t._fallback = new Transcriber.Browser();
		fallback.on_partial = text => t.note_partial(text);
		fallback.on_final = text => t.note_final(text);
		return fallback.start(mic);
	};
	t.stop = () => {
		if (t._fallback){ t._fallback.stop(); t._fallback = null; return; }
		return whisper_stop();
	};

	return div.c("flex wrap gap", () => {
		div.c("flex v gap card pad", () => {
			h4("1 — pick a mic, start it");
			new MicStream.Controls({ subject: mic, show_mode_switch: true });
			mic.row_view;
		});

		div.c("flex v gap card pad", () => {
			h4("2 — say something");
			new Transcriber.Transcript({ subject: t });
			$engine_label = span.c("muted", "Engine: checking…");
			t.row_view;
		});

		div.c("flex v gap card pad", () => {
			h4("3 — optional: record it too");
			new Recorder.Controls({
				subject: rec,
				on_record: async () => { if (!mic.active) await mic.start(); rec.start(mic.stream); },
			});
			rec.row_view;
		});
	}).append(() => {
		// MicStream starts/stops on its own (the mode switch's button); the
		// transcriber follows it — starts the moment the mic opens, stops the
		// moment it closes.
		const prior = mic.on_change;
		mic.on_change = () => {
			prior?.();
			if (mic.active && !listening){ listening = true; t.start(mic); }
			else if (!mic.active && listening){ listening = false; t.stop(); }
		};
	});
}

function tool_tile({ name, slug, icon: name_icon, blurb }){
	return a.c("card pad flex v gap-25 audio-index-tool").href(here + slug).append(() => {
		div.c("flex gap-25 v-center", () => { icon(name_icon); span.c("h4", name); });
		span.c("muted", blurb);
	});
}

export default new Doc({
	meta: import.meta,
	title: "audio",
	description: "Three building blocks for anything with a microphone — MicStream, Recorder, Transcriber — shown here working together.",
	icon: "graphic_eq",

	files: "Part.js audio.css page.js readme.md",
	notes: "decisions",

	children: "MicStream Recorder Transcriber v1 MicPicker LevelMeter PushToTalk sound-recorder push-to-talk mic-to-text",

	content(){
		// "audio v1" OUT OF THE TAB STRIP (fix 5) — same `tab({nav:false})` +
		// `nav_redraw()` move `ux/Dictate/page.js` makes for its own "v1": still a
		// real, routed page (declared in `children:` above), just not competing
		// for room in the strip. One line under the tool tiles links to it instead.
		this.tab({ name: "v1", nav: false });
		// The six old URLs, kept as aliases to v1, also stay out of the strip.
		for (const name of ["MicPicker", "LevelMeter", "PushToTalk", "sound-recorder", "push-to-talk", "mic-to-text"]) this.tab({ name, nav: false });
		this.nav_redraw();

		md("Pick a mic, talk, watch the transcript settle.");

		div.c("audio-index-demo wide", () => one_demo());

		div.c("wide grid gap auto", () => TOOLS.forEach(tool_tile)).style("--column", "16em");

		md("The old six-class version (MicPicker, LevelMeter, PushToTalk as separate classes) is still reachable at [v1](./v1/) for comparison.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
