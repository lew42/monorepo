import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Notes",
	description: "Short working notes for the team.",
	children: "git-branch-names auth",

	content(){
		this.previews();
		md("Anything that isn't documentation but everyone needs to know once.");
	}
});
