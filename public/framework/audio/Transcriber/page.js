import { Doc, div, h4, button, span, demo, md } from "/app.js";
import MicStream from "../MicStream/MicStream.js";
import Transcriber from "./index.js";

const example = () => {
	const mic = new MicStream();
	const t = new Transcriber.Whisper();
	return div.c("flex v gap", () => {
		new Transcriber.Transcript({ subject: t });
		div.c("flex gap", () => {
			button("Start (Whisper)").click(async function(){
				await mic.start();
				await t.start(mic);
				this.el.disabled = true;
			});
			button("Stop").click(() => { t.stop(); mic.stop(); });
		});
		span.c("muted", "Needs whisper-server reachable at /whisper/ or 127.0.0.1:8178 — otherwise the segment errors and nothing is unsafe, it just never answers.");
	});
};

const sizes = () => {
	const mic = new MicStream();
	const t = new Transcriber.Whisper();
	return div.c("flex wrap gap", () => {
		div.c("flex v gap-25", () => { h4.c("muted", "icon"); t.icon_view; });
		div.c("flex v gap-25", () => { h4.c("muted", "row"); t.row_view; });
		div.c("flex v gap-25", () => { h4.c("muted", "panel"); t.panel_view; });
		button("Start").click(async function(){ await mic.start(); await t.start(mic); this.el.disabled = true; });
	});
};

export default new Doc({
	meta: import.meta,
	title: "Transcriber",
	description: "An audio stream in, a text stream out — swappable engines: local Whisper, or Chrome's own recognizer.",
	icon: "subtitles",

	files: "Transcriber.js Whisper.js Browser.js WhisperSegments.js index.js page.js readme.md",
	notes: "streaming",

	content(){
		md("## The three sizes of its live state");
		demo(sizes, "`Whisper.View` adds request latency and whether a request is in flight right now to `Transcriber.View`'s row (engine, listening, segment count). Panel shows the last 20 requests, each with its own `ms`.");

		md("## Try it");
		demo(example, "The grey line is `on_partial()` — the growing guess, resent every ~1s while you keep talking. It settles into the list on `on_final()` once two consecutive guesses agree.");

		md("## Use");
		md("```js\nimport MicStream from \"/framework/audio/MicStream/MicStream.js\";\nimport Transcriber from \"/framework/audio/Transcriber/index.js\";   // every engine attached\n\nconst mic = new MicStream();\nconst t = new Transcriber.Whisper();      // or Transcriber.Browser()\nt.on_partial = text => …;\nt.on_final = text => …;\nawait mic.start();\nawait t.start(mic);\nt.stop();\n```");

		md("`Transcriber.Whisper` keeps `ux/Dictate`'s own silence rule: a segment with under 120ms of actual speech is never sent, and a whisper annotation (`[BLANK_AUDIO]`, `*shriek*`) never reaches `on_final`. It's also the rolling local-agreement window measured against the old cut-and-append engine (still reachable as `Transcriber.WhisperSegments`) in [`../doc/decisions.md`](/framework/audio/doc/decisions.md), \"Rolling window\".");

		md.details(import.meta, "readme.md", "Readme");
	},
});
