import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "The Serapeum",
	description: "24 multi-ton granite and diorite boxes under Saqqara — copper saws and sand versus a straightedge reading of 0.0002 inch, and why nobody has re-checked the numbers.",
	icon: "square_foot",
	width: "large",

	content(){ return md.file(import.meta, "../serapeum.md", { h1: false }); },
});
