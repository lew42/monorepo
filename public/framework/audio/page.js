import { Doc, div, a, h2, md } from "/app.js";
import { View, icon, span } from "../core/View/View.js";
import MicStream from "./MicStream/MicStream.js";
import MicPicker from "./MicPicker/MicPicker.js";
import LevelMeter from "./LevelMeter/LevelMeter.js";
import Recorder from "./Recorder/Recorder.js";
import PushToTalk from "./PushToTalk/PushToTalk.js";
import Transcriber from "./Transcriber/index.js";

View.stylesheet(import.meta, "audio.css");

const PARTS = [
	{ name: "MicStream", slug: "MicStream/", icon: "mic", Klass: MicStream },
	{ name: "MicPicker", slug: "MicPicker/", icon: "settings_voice", Klass: MicPicker },
	{ name: "LevelMeter", slug: "LevelMeter/", icon: "graphic_eq", Klass: LevelMeter },
	{ name: "Recorder", slug: "Recorder/", icon: "fiber_manual_record", Klass: Recorder },
	{ name: "PushToTalk", slug: "PushToTalk/", icon: "campaign", Klass: PushToTalk },
	{ name: "Transcriber", slug: "Transcriber/", icon: "subtitles", Klass: Transcriber.Whisper },
];

const ASSEMBLIES = [
	{ name: "Sound recorder", slug: "sound-recorder/", icon: "album" },
	{ name: "Push-to-talk stream", slug: "push-to-talk/", icon: "record_voice_over" },
	{ name: "Mic → Whisper → text", slug: "mic-to-text/", icon: "transcribe" },
];

/* One card per part: a small linked header (name → its own page), then the
 * part's own live ROW view — nothing started, so it reads "no microphone
 * open" / "idle" rather than a blank box, exactly what the state view is
 * FOR (`code` skill §9, the item-ui pattern). Never an anchor wrapping the
 * whole card: `MicPicker`'s `<select>` and `PushToTalk`'s own button are
 * real controls, and a link swallowing a click meant for either of them
 * would be broken, not just messy. */
function part_card({ name, slug, icon: name_icon, Klass }){
	return div.c("card pad flex v gap-50 audio-index-part", () => {
		a.c("flex gap-25 v-center audio-index-part-head", () => { icon(name_icon); span(name); }).href(slug);
		new Klass().row_view;
	});
}

function assembly_tile(it){
	return a.c("card pad flex v gap-25 audio-index-assembly").href(it.slug).append(() => {
		icon(it.icon).ac("audio-index-assembly-icon");
		span.c("h4", it.name);
	});
}

export default new Doc({
	meta: import.meta,
	title: "audio",
	description: "A library of pure audio building blocks — microphone, level, recording, streaming, transcription — no AI.",
	icon: "graphic_eq",

	files: "Part.js audio.css page.js readme.md",
	notes: "decisions",

	children: "MicStream MicPicker LevelMeter Recorder PushToTalk Transcriber sound-recorder push-to-talk mic-to-text",

	content(){
		md("Six small classes for anything with a microphone, each shown here by its own live state — not started, so every part reads idle. Open any one for what it does, its `Use` code, and a live demo you can actually press.");

		div.c("wide grid gap auto", () => PARTS.forEach(part_card)).style("--column", "18em");

		h2("Three assemblies, same parts");

		md("Recombined three ways — a plain recorder, a Discord-style push-to-talk stream, and mic-to-text through Whisper.");

		div.c("wide grid gap auto", () => ASSEMBLIES.forEach(assembly_tile)).style("--column", "14em");

		md.details(import.meta, "readme.md", "Readme");
	},
});
