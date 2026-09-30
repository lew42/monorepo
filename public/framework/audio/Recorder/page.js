import { Page, div, h4, demo, md } from "/app.js";
import Recorder from "./Recorder.js";

const example = () => {
	const rec = new Recorder();
	return div.c("flex v gap", () => { new Recorder.Controls({ subject: rec }); });
};

const sizes = () => {
	const rec = new Recorder();
	return div.c("flex wrap gap", () => {
		div.c("flex v gap-25", () => { h4.c("muted", "icon"); rec.icon_view; });
		div.c("flex v gap-25", () => { h4.c("muted", "row"); rec.row_view; });
		div.c("flex v gap-25", () => { h4.c("muted", "panel"); rec.panel_view; });
	});
};

export default new Page({
	meta: import.meta,
	title: "Recorder",
	description: "Record, play back and save (download) one clip — MediaRecorder underneath.",
	icon: "fiber_manual_record",

	content(){
		demo(example, "Record opens a plain mic (or whatever `on_record` wires in), Stop finishes the clip, Save downloads it.");

		md("## Use");
		md("```js\nimport Recorder from \"/framework/audio/Recorder/Recorder.js\";\n\nconst rec = new Recorder();\nnew Recorder.Controls({ subject: rec });   // the buttons\nrec.row_view;                                // its live state, one line\n```");

		md("## The three sizes of its live state");
		demo(sizes, "`Recorder.View` (reached as `rec.icon_view` / `.row_view` / `.panel_view`) — the state, not the controls: idle/recording/recorded, whether it's recording right now, the clip length once there is one, and (panel) every other property.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
