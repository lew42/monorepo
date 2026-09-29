import { Page, p } from "/app.js";

/**
 * A stand-in file for the switcher's WIDE demo frame — one of two real, routed
 * children the "wide vs narrow" comparison on core/Page/layout/switcher/ switches
 * between. See core/Page/layout/switcher/page.js.
 */
export default new Page({
	meta: import.meta,
	title: "index.js",
	description: "Demo file for the switcher's wide comparison frame.",
	icon: "description",

	content(){
		p("This is the file the wide frame shows first — a stand-in, so the switcher pattern has something real to route between.");
	},
});
