import { Page, div, demo, md } from "/app.js";
import MicStream from "../MicStream/MicStream.js";
import PushToTalk from "./PushToTalk.js";

const example = () => {
	const ptt = new PushToTalk();
	return div.c("flex v gap", () => {
		new PushToTalk.View({ subject: ptt, mic_factory: () => new MicStream() });
		md("Hold the button (or Space) to open the mic; release to close it.");
	});
};

export default new Page({
	meta: import.meta,
	title: "PushToTalk",
	description: "Hold a button or a key to open a MicStream; release to close it.",
	icon: "campaign",

	content(){
		demo(example);

		md("## Use");
		md("```js\nimport MicStream from \"/framework/audio/MicStream/MicStream.js\";\nimport PushToTalk from \"/framework/audio/PushToTalk/PushToTalk.js\";\n\nconst ptt = new PushToTalk({ key: \" \" });\nptt.on_start = stream => …;\nptt.on_stop = () => …;\nawait ptt.press(new MicStream());\nptt.release();\n```");

		md.details(import.meta, "readme.md", "Readme");
	},
});
