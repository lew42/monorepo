import { Page, div, demo, md } from "/app.js";
import MicPicker from "./MicPicker.js";

const example = () => {
	const picker = new MicPicker({ on_pick: (id, label) => console.log("audio/MicPicker: picked", label || id) });
	return div.c("flex v gap", () => { picker.view; });
};

export default new Page({
	meta: import.meta,
	title: "MicPicker",
	description: "The microphone chooser — lists every audioinput device and remembers the pick with ux/Dictate's own storage key.",
	icon: "settings_voice",

	content(){
		demo(example, "A real `<select>` of every microphone Chrome can see. Pick one — it's remembered for `MicStream`, `Dictate`, everything.");

		md("## Use");
		md("```js\nimport MicPicker from \"/framework/audio/MicPicker/MicPicker.js\";\n\nconst picker = new MicPicker({ on_pick(id, label){ … } });\nawait picker.devices();   // [{ deviceId, label, kind }, …]\npicker.pick(id, label);    // remembers it (ux/Dictate's remember_device), fires on_pick\n```");

		md.details(import.meta, "readme.md", "Readme");
	},
});
