import { Page, h2, demo } from "/app.js";
import { download_demo, download_outline_demo } from "../../parts.js";

export default new Page({
	meta: import.meta,
	title: "Download Button",
	description: "A real `<a download>`, a data: url standing in for a file.",

	content(){
		demo(download_demo, "A real `<a download>`; a `data:` url stands in for a file so the demo has something to actually download.").ac("mb");

		h2("Outline").ac("mb");
		demo(download_outline_demo, "Same anchor, `.btn` without `.prim`, a border instead of a fill.");
	}
});