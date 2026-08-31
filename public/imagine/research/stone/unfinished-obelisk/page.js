import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Unfinished Obelisk",
	description: "A 1,168-ton granite obelisk abandoned mid-quarry at Aswan — dolerite pounding balls, a fire-setting refinement, and the machine-tool claim built on its trench marks.",
	icon: "square_foot",
	width: "large",

	content(){ return md.file(import.meta, "../unfinished-obelisk.md", { h1: false }); },
});
