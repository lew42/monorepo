import { Page, h1 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Hello",
	description: "The floor test's new child page — just says hello.",

	content(){
		h1("Hello from the floor test");
	}
});
