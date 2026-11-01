import { Page, div, h4, demo, md } from "/app.js";
import Voice from "./Voice.js";

const example = () => {
	const voice = new Voice();
	return div.c("flex v gap", () => { new Voice.Controls({ subject: voice }); });
};

const sizes = () => {
	const voice = new Voice();
	return div.c("flex wrap gap", () => {
		div.c("flex v gap-25", () => { h4.c("muted", "icon"); voice.icon_view; });
		div.c("flex v gap-25", () => { h4.c("muted", "row"); voice.row_view; });
		div.c("flex v gap-25", () => { h4.c("muted", "panel"); voice.panel_view; });
	});
};

export default new Page({
	meta: import.meta,
	title: "Voice",
	description: "Text to speech — the browser's own SpeechSynthesis reads text out loud.",
	icon: "record_voice_over",

	content(){
		demo(example, "Type something, press Speak. Pause/Resume and Stop work mid-sentence. Speed and pitch apply on the NEXT Speak.");

		md("## Use");
		md("```js\nimport Voice from \"/framework/audio/Voice/Voice.js\";\n\nconst voice = new Voice();\nnew Voice.Controls({ subject: voice });   // the text box + buttons\nvoice.speak(\"Hello there.\");                // or call it directly, no UI needed\nvoice.row_view;                              // its live state, one line\n```");

		md("## The three sizes of its live state");
		demo(sizes, "`Voice.View` (reached as `voice.icon_view` / `.row_view` / `.panel_view`) — the state, not the controls: idle/speaking/paused, whether it's speaking right now, and the start of whatever it's saying.");

		md("## Watch out");
		md("- **The voice list can start empty.** `voice.voices()` only fills in once the browser has loaded it, which can happen a moment after the page does — `Voice.Controls` waits for `on_voices_ready()` rather than reading the list once. Until then the picker above just says \"default voice\", which still speaks fine.");
		md("- **This demo is the browser's voice.** The local voice (recite-server, Kokoro) is `voice.render()`, and [Recite](../Recite/) reads whole replies with it.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
