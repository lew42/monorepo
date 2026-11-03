import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "The Giza Coffer",
	description: "The Great Pyramid's granite coffer — Petrie's own saw-mark record, Dunn's single most checkable claim, and why nobody has ever scanned it.",
	icon: "square_foot",
	width: "large",

	content(){ return md.file(import.meta, "../giza-coffer.md", { h1: false }); },
});
