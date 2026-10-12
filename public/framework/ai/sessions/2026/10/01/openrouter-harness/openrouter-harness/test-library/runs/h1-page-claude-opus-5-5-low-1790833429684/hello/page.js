import { Page, h1 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Hello",
	description: "A child page whose H1 greets the floor test.",

	content(){
		h1("Hello from the floor test");
	}
});
