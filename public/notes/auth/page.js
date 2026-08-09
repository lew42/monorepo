import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Auth, accounts and teams",
	label: "Auth & teams",
	icon: "lock",
	description: "Design record — nothing built yet. GitHub OAuth, a signed cookie, D1, and why points are derived.",

	// The record IS the page. md.file returns a promise; View.append_promise
	// places it into a container that was captured synchronously.
	content(){ return md.file(import.meta, "readme.md", { h1: false }); }
});
