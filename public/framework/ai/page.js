import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "AI",
	description: "One page per working day — what the sessions changed, decided, and queued.",
	icon: "smart_toy",
	children: "2026-08-12 2026-08-11 2026-08-10 2026-08-09 2026-08-08",

	content(){
		md("One page per working day: what changed, what was decided, and the tasks queued for the next autonomous session. The newest day is the state of play.");
		this.previews();
	},
});
