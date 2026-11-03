import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Barabar Caves",
	description: "Mirror-polished granite chambers Ashoka dedicated around 250 BCE — a polish technique mainstream archaeology itself calls one of the genuinely unsolved problems.",
	icon: "square_foot",
	width: "large",

	content(){ return md.file(import.meta, "../barabar-caves.md", { h1: false }); },
});
