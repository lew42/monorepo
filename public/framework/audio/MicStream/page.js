import { Page, div, h4, button, demo, md } from "/app.js";
import MicStream from "./MicStream.js";

const example = () => {
	const mic = new MicStream();
	return div.c("flex v gap", () => {
		mic.view;
		div.c("flex gap", () => {
			button("Start").click(async function(){ await mic.start(); this.el.disabled = true; });
			button("Stop").click(() => mic.stop());
		});
	});
};

const sizes = () => {
	const mic = new MicStream();
	return div.c("flex wrap gap", () => {
		div.c("flex v gap-25", () => { h4.c("muted", "icon"); mic.icon_view; });
		div.c("flex v gap-25", () => { h4.c("muted", "row"); mic.row_view; });
		div.c("flex v gap-25", () => { h4.c("muted", "panel"); mic.panel_view; });
		button("Start").click(async function(){ await mic.start(); this.el.disabled = true; });
	});
};

export default new Page({
	meta: import.meta,
	title: "MicStream",
	description: "Opens a microphone and hands out its live MediaStream, raw samples and a level — everything else in audio/ subscribes to one of these.",
	icon: "mic",

	content(){
		demo(example, "Press Start, then talk — the dot lights up with `on_level()`.");

		md("## Use");
		md("```js\nimport MicStream from \"/framework/audio/MicStream/MicStream.js\";\n\nconst mic = new MicStream();       // or { device_id }\nconst off = mic.on_level(level => …);  // 0..1, as often as you like\nawait mic.start();                   // mic.stream is now a MediaStream\nmic.stop();\n```");

		md("`mic.snapshot()` / `mic.cut()` / `mic.loudness()` / `mic.wav()` are the buffer `Transcriber.Whisper` sends to whisper-server — extracted from `ux/Dictate/capture.js`, which this does not import (read-only for this task) but copies: see [readme.md](readme.md).");

		md("## The three sizes of its live state");
		demo(sizes, "`mic.icon_view` / `.row_view` / `.panel_view` — the same `MicStream.View`, built at a different size. Panel falls through to the generic property tree, so `chunks`, `chunk_levels` and the browser's own track settings all show up with no extra code.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
