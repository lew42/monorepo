import { Page, div, h4, button, span, demo, md } from "/app.js";
import MicStream from "../../MicStream/MicStream.js";
import LevelMeter from "../LevelMeter/LevelMeter.js";
import Transcriber from "../../Transcriber/index.js";

const example = () => {
	const mic = new MicStream();
	const meter = new LevelMeter().watch(mic);
	const t = new Transcriber.Whisper();

	return div.c("flex wrap gap", () => {
		div.c("flex v gap", () => {
			meter.view;
			new Transcriber.Transcript({ subject: t });
			div.c("flex gap", () => {
				button("Start").click(async function(){
					await mic.start();
					await t.start(mic);
					this.el.disabled = true;
				});
				button("Stop").click(() => { t.stop(); mic.stop(); });
			});
			span.c("muted", "Needs whisper-server reachable — start it, or open this page where /whisper/ proxies to it.");
		});

		// Live state, beside the assembly — updates as you speak.
		div.c("flex v gap-25", () => {
			h4.c("muted", "MicStream");
			mic.row_view;
			h4.c("muted", "Transcriber.Whisper");
			t.panel_view;
		});
	});
};

export default new Page({
	meta: import.meta,
	title: "Mic → Whisper → text",
	description: "MicStream + Transcriber.Whisper — the level, the growing guess, then the settled text.",
	icon: "transcribe",

	content(){
		demo(example, "MicStream opens the mic; Transcriber.Whisper reads its buffer and resends the growing segment until a pause closes it. The right column is each part's own live state.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
