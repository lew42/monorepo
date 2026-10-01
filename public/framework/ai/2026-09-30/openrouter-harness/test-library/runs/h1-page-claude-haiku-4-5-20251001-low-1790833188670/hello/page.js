import { Page, h1 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Hello",
	description: "A page with an H1 saying 'Hello from the floor test'.",

	content(){
		h1("Hello from the floor test");
	}
});
