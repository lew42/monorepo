import { Page, div, p, button, textarea, demo, md } from "/app.js";
import Recite from "./Recite.js";

const SAMPLE = "Here is a reply, read aloud. Recite splits it into sentences and reads them one after another, so it starts in under a second. "
	+ "Press pause, then play, and it picks up where it stopped. The back button jumps ten seconds, even into the sentence before. "
	+ "Turn on the ear button and start talking: it pauses to listen, checks with Whisper whether that was a voice or just wind, and remembers its place.";

/** The one demo: a reply in a text box, the Read button, and the control line under it. */
const example = () => {
	const recite = Recite.shared;
	return div.c("flex v gap", () => {
		const $text = textarea.c("audio-recite-demo-text").attr("rows", "4");
		$text.el.value = SAMPLE;
		div.c("flex gap v-center wrap", () => {
			button("Read it aloud").click(() => recite.read($text.el.value));
			const $server = p.c("muted", "checking recite-server…");
			recite.check().then(s => $server.text(s === "online" ? `recite-server is online (${recite.url})` : `recite-server is offline — the browser's own voice reads instead. ${recite.error}`));
		});
		recite.bar;
	});
};

export default new Page({
	meta: import.meta,
	title: "Recite",
	description: "Reads the AI's replies aloud with a local voice: pause, back 10 s, restart, and it pauses when you talk.",
	icon: "volume_up",

	content(){
		demo(example, "Press **Read it aloud**. The line under it is the whole control: play or pause, back 10 s, from the beginning, the voice, and the ear (pause when I talk) with how loud counts as talking.");

		md("## Use");
		md("```js\nimport Recite from \"/framework/audio/Recite/Recite.js\";\n\nconst recite = Recite.shared;   // one per page, so two chat views never talk over each other\nrecite.read(\"A reply to read.\");   // or recite.queue(text) to add after what is playing\nrecite.bar;                        // the one-line control\n```");

		md("## Watch out");
		md("- **A phone plays sound only after a tap on the page.** Pressing the mic or any button counts; until then the bar says to tap play.");
		md("- **Back 10 s and the progress line need recite-server.** With the browser's voice (server down) it steps by sentence instead.");
		md("- **Speakers leak into the mic.** The browser's echo cancelling removes most of it, and Recite ignores what Whisper hears when it matches the sentence being read. Headphones are best on a walk.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
