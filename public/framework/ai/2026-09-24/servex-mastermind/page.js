import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Servex mastermind",
	description: "What the systems architect saw go wrong in the agent system today, and the fix proposed for each.",
	icon: "monitoring",

	content(){
		return md.file(import.meta, "proposals.md", { h1: false });
	},
});
