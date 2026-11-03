import { Page } from "/app.js";
import Watch from "./Watch.js";

export default new Page({
	meta: import.meta,
	title: "Watch a tree being built",
	label: "Watch",
	description: "Step through it: every object shows as it is made and changed, and every line it saves sits beside it.",
	icon: "visibility",
	width: "wide",
	content(){ new Watch().ac("wide"); },
});
