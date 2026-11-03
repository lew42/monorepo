import { Doc, div, a, h2, md } from "/app.js";
import { icon, span } from "../../core/View/View.js";
import MicPicker from "./MicPicker/MicPicker.js";
import LevelMeter from "./LevelMeter/LevelMeter.js";
import PushToTalk from "./PushToTalk/PushToTalk.js";

const PARTS = [
	{ name: "MicPicker", slug: "MicPicker/", icon: "settings_voice", Klass: MicPicker },
	{ name: "LevelMeter", slug: "LevelMeter/", icon: "graphic_eq", Klass: LevelMeter },
	{ name: "PushToTalk", slug: "PushToTalk/", icon: "campaign", Klass: PushToTalk },
];

const ASSEMBLIES = [
	{ name: "Sound recorder", slug: "sound-recorder/", icon: "album" },
	{ name: "Push-to-talk stream", slug: "push-to-talk/", icon: "record_voice_over" },
	{ name: "Mic → Whisper → text", slug: "mic-to-text/", icon: "transcribe" },
];

function part_card({ name, slug, icon: name_icon, Klass }){
	return div.c("card pad flex v gap-50 audio-index-part", () => {
		a.c("flex gap-25 v-center audio-index-part-head", () => { icon(name_icon); span(name); }).href(slug);
		new Klass().view;
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
	title: "audio v1",
	description: "The six-class version of audio/, kept clickable for comparison — MicPicker, LevelMeter and PushToTalk are now absorbed into MicStream on the main page.",
	icon: "history",

	children: "MicPicker LevelMeter PushToTalk sound-recorder push-to-talk mic-to-text",

	content(){
		md("This is the OLD shape of `audio/`, before [MicStream](../MicStream/) absorbed `MicPicker`, "
			+ "`LevelMeter` and `PushToTalk` (2026-09-30). Kept here, unchanged, so you can compare the "
			+ "two side by side — see the [live demo on the main page](../) for the current, three-tool version.");

		div.c("wide grid gap auto", () => PARTS.forEach(part_card)).style("--column", "18em");

		h2("Three assemblies, the old way");

		md("The same parts recombined three ways — a plain recorder, a Discord-style push-to-talk stream, and mic-to-text through Whisper. These pages are unchanged from before the consolidation.");

		div.c("wide grid gap auto", () => ASSEMBLIES.forEach(assembly_tile)).style("--column", "14em");
	},
});
