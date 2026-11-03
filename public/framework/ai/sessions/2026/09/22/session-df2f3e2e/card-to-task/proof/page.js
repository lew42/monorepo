import { Page, h1 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Proof",
	description: "Says hello and the current time — nothing else.",

	content(){
		h1("hello — " + new Date().toLocaleString());
	},
});
