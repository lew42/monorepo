import { Page, div, button, demo, md } from "/app.js";
import MicStream from "../../MicStream/MicStream.js";
import LevelMeter from "./LevelMeter.js";

const example = () => {
	const mic = new MicStream();
	const meter = new LevelMeter().watch(mic);
	return div.c("flex v gap", () => {
		meter.view;
		button("Start mic").click(async function(){ await mic.start(); this.el.disabled = true; });
	});
};

export default new Page({
	meta: import.meta,
	title: "LevelMeter",
	description: "A live level bar for any MicStream.",
	icon: "graphic_eq",

	content(){
		demo(example, "`watch(mic)` — a `MicStream`'s `on_level()` drives the bar's `--level` custom property, no layout thrash.");

		md("## Use");
		md("```js\nimport MicStream from \"/framework/audio/MicStream/MicStream.js\";\nimport LevelMeter from \"/framework/audio/LevelMeter/LevelMeter.js\";\n\nconst mic = new MicStream();\nconst meter = new LevelMeter().watch(mic);\nawait mic.start();\nmeter.view;   // a bar that moves\n```");

		md.details(import.meta, "readme.md", "Readme");
	},
});
