import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Versions",
	icon: "layers",
	description: "New versions of the AI dashboard, tried beside the old one.",
	children: "2 3",
	content(){ md("Each child is a whole new take on the AI dashboard. The old one stays where it is until a new one wins."); },
});
