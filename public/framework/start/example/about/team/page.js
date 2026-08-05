import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Team",

	content(){
		md("Three levels deep, and still **nothing was configured**.");
	},
});
