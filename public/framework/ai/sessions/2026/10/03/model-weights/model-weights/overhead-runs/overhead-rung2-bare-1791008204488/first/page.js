import { Page } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "First child",
	description: "First child page.",

	content(){
		this.previews();
	}
});
