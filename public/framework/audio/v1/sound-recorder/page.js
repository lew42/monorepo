import { Page, div, h4, demo, md } from "/app.js";
import MicPicker from "../MicPicker/MicPicker.js";
import MicStream from "../../MicStream/MicStream.js";
import LevelMeter from "../LevelMeter/LevelMeter.js";
import Recorder from "../../Recorder/Recorder.js";

const example = () => {
	const mic = new MicStream();
	const meter = new LevelMeter().watch(mic);
	const rec = new Recorder();
	const picker = new MicPicker({ on_pick: (id, label) => { mic.device_id = id; mic.device_label = label; } });

	return div.c("flex wrap gap", () => {
		div.c("flex v gap", () => {
			picker.view;
			meter.view;
			new Recorder.Controls({
				subject: rec,
				// Wire the shared mic in, instead of Recorder's own standalone
				// getUserMedia fallback — one microphone for the whole assembly.
				on_record: async () => { await mic.start(); rec.start(mic.stream); },
			});
			// Chain onto Recorder.Controls' own `on_change`, never replace it, so
			// the shared mic still releases once the clip is saved.
			const draw = rec.on_change;
			rec.on_change = () => { draw?.(); if (rec.state === "recorded") mic.stop(); };
		});

		// The live state, beside the controls — updates as you talk and record
		// (task-mastermind-audio, 2026-09-29: "the row and panel beside each assembly").
		div.c("flex v gap-25", () => {
			h4.c("muted", "MicStream");
			mic.row_view;
			h4.c("muted", "Recorder");
			rec.panel_view;
		});
	});
};

export default new Page({
	meta: import.meta,
	title: "Sound recorder",
	description: "The same parts as any other recorder app: pick a mic, watch the level, record and save.",
	icon: "album",

	content(){
		demo(example, "MicPicker + LevelMeter + Recorder — three independent classes, wired by one page. The right column is each part's own live state.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
