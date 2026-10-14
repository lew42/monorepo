import NavModelPage from "./NavModelPage.js";

export default new NavModelPage({
	meta: import.meta,
	title: "Navigation: one model",
	description: "Table of contents or sub pages, nest or swap, where a link opens, workspace or document: one rule each, shown live.",
	icon: "account_tree",
	children: "workspace",
});
