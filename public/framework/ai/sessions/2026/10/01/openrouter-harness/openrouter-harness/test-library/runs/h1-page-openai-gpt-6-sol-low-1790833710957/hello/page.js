import { Page, h1 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "hello",
	description: "A greeting from the floor test.",
	content(){
		h1("Hello from the floor test");
	}
});
