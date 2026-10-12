import { Page, h1 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Hello",
	description: "The new page the floor test asked for.",

	content(){
		h1("Hello from the floor test");
	}
});
