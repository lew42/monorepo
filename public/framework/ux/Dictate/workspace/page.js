import { Page, md, a } from "/app.js";
import Workspace from "./Workspace.js";

export default new Page({
	meta: import.meta,
	title: "Workspace",
	description: "A dictation workspace where each sentence becomes an item you can see and move, while raw transcript stays beside it.",
	icon: "space_dashboard",

	classes: "full pad",

	content(){
		md("# Dictation Workspace\nSomewhere to see a long dictation as it grows. Each sentence becomes a structured card you can see, edit and reorder, while the raw transcript stays beside it.");

		new Workspace();
	}
});
