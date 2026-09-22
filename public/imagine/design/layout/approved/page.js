import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "This page moved to /layouts/doc/studies/approved/.",
	content(){ md("**This page moved.** It is now [/layouts/doc/studies/approved/](/layouts/doc/studies/approved/) — the closed set of five — a new page picks one by name."); },
});
