import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "AI docs",
	description: "The AI system's long-form docs: decisions, flows, archives. The index is the readme.",
	icon: "description",

	content(){
		md.file(import.meta, "readme.md", { h1: false });
	},
});
