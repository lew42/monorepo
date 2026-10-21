import { Page } from "/app.js";
import WhisperDemo from "./WhisperDemo.js";

export default new Page({
	meta: import.meta,
	title: "Whisper",
	description: "Every answer the speech server sends back, live: guesses that amend themselves, then the final.",
	icon: "mic",
	children: "log",

	content(){
		new WhisperDemo();   // the one demo: audio/Whisper/doc/demo.md
	},
});
