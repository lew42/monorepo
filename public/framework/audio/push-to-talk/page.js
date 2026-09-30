import { Page, div, h4, audio, demo, md } from "/app.js";
import MicStream from "../MicStream/MicStream.js";
import PushToTalk from "../PushToTalk/PushToTalk.js";

const example = () => {
	const ptt = new PushToTalk();
	let $listener;

	return div.c("flex wrap gap", () => {
		div.c("flex v gap", () => {
			h4("Talker");
			new PushToTalk.View({
				subject: ptt,
				mic_factory: () => new MicStream(),
			});
		});

		div.c("flex v gap", () => {
			h4("Listener");
			// Local-only "Discord" shape: the listener's <audio> plays the SAME
			// MediaStream the talker's mic just opened — a real WebRTC connection
			// would carry this across two machines, but on one page a shared
			// MediaStream already proves the wiring (readme.md says which).
			$listener = audio().attr("controls", "").attr("autoplay", "");
			$listener.el.hidden = true;
		});
	}).append($box => {
		ptt.on_start = stream => { $listener.el.srcObject = stream; $listener.el.hidden = false; };
		ptt.on_stop = () => { $listener.el.hidden = true; $listener.el.srcObject = null; };
	});
};

export default new Page({
	meta: import.meta,
	title: "Push-to-talk stream",
	description: "Discord-style: hold to talk, and a listener panel hears it live — local only.",
	icon: "record_voice_over",

	content(){
		demo(example, "Hold Talker's button — Listener's audio element starts playing the same live MediaStream. Release, it stops.");

		md("This is **local only**: the listener's `<audio srcObject>` plays the SAME `MediaStream` object the talker's `MicStream` just opened, in the same tab. A real cross-machine version swaps that one line for a WebRTC `RTCPeerConnection` carrying the track to another browser — the `PushToTalk` class itself does not change, only what `on_start(stream)` does with the stream.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
