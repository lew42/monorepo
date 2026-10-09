import { Page, md } from "/app.js";
import Whisper from "./Whisper.js";

export default new Page({
	meta: import.meta,
	title: "Whisper",
	description: "The local whisper-server as an object, and one logged session per dictation surface.",
	icon: "mic",

	content(){
		const whisper = Whisper.shared;
		new Whisper.View({ subject: whisper });
		whisper.check();
		md("`Whisper` is the server (up or down, ping, restarts). Each dictation surface, such as the [Refine](/framework/ext/Refine/) page, adds a `WhisperSession` that logs every request. This page shows this browser tab's own instance.");
	},
});
