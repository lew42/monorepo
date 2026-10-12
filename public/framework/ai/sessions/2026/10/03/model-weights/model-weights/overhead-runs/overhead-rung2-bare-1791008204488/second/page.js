import { Page } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Second child",
	description: "Second child page.",

	content(){
		this.previews();
	}
});
