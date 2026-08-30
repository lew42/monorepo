import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Notes",
	description: "Short working notes for the team.",
	children: "git-branch-names auth team-note",

	// Line first, then the cards — a reader who lands here should know what the
	// section is before deciding which of three notes to open.
	content(){
		md("Anything that isn't documentation but everyone needs to know once.");
		this.previews();
	}
});
