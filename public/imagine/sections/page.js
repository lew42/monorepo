import { Page, md } from "/app.js";

/* STUB — replaced by the sections minion. It exists so the realm resolves while it is built.
   Container: a column in /imagine/'s columns host. Size: `large`. */

export default new Page({
	meta: import.meta,
	title: "Sections",
	description: "Multi-column sections that fill 3440: framed main areas, sticky sidebars confined to their section, stacked or full screen, with nav.",
	icon: "view_agenda",
	width: "large",
	index: true,

	content(){
		md(`**Being built.** Two, three and four column sections that use a wide screen, stacked down a page or as one full-screen layout, with sidebars that stay while the middle scrolls.`);
	},
});
