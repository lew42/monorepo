import { Page } from "/app.js";
import WhisperDemo from "../WhisperDemo.js";

export default new Page({
	meta: import.meta,
	title: "Whisper log",
	description: "Every step between the microphone and the page: Whisper's answers, then what Dictate, the composer and Refine did with each.",
	icon: "receipt_long",

	content(){
		new WhisperDemo({ steps: true });   // the same demo as the Whisper page, with every step on: audio/Whisper/doc/demo.md
	},
});
