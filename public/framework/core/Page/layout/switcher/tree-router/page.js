import { Page, p } from "/app.js";

/**
 * See tree-styles/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "router.js",
	description: "Demo file for the switcher's file-tree skin.",
	icon: "description",

	content(){
		p("This is what /fs will eventually route to for real — file_link() from task-mastermind-file-system's work once it lands (see doc/decide.md's convergence note).");
	},
});
