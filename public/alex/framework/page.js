import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "The classes that run everything, and how a url becomes a page.",
	icon: "widgets",

	children: "app view",

	nav: {
		app:  { label: "App",  icon: "settings" },
		view: { label: "View", icon: "code" },
	},

	content(){
		md("Four core classes. Two of them you write yourself in every project:");

		md(`| | |
|---|---|
| \`View\` | one DOM element, chainable — **every line you write** |
| \`Page\` | a url, a title, some content, and children |
| \`Router\` | walks the url and activates the pages it finds |
| \`App\` | boots once, owns the container everything mounts into |

\`Router\` and \`App\` you almost never touch directly.`);

		this.previews();
	},
});
