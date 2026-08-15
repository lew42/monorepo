import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Persistence stack",
	description: "The council's 16 rulings and the exact agreed API — the spec the four workers built from.",
	icon: "gavel",

	content(){
		return md.file(import.meta, "requirements.md");
	},
});
