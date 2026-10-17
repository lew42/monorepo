import { Page } from "/app.js";
import WhisperLog from "../WhisperLog.js";

export default new Page({
	meta: import.meta,
	title: "Whisper log",
	description: "Every event between the microphone and the page, in order: Whisper's own replies (interim and final, with everything the server sends), then what each stage did with them.",
	icon: "receipt_long",

	content(){
		new WhisperLog();
	},
});
