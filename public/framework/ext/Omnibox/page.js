import { Doc, md, code } from "/app.js";
import { Omnibox } from "./Omnibox.js";

export default new Doc({
	meta: import.meta,
	title: "Omnibox",
	description: "A keyboard-first search field, always on screen, that ranks the current topic first and the whole site second.",
	icon: "search",

	files: "Omnibox.js Omnibox.css page.js readme.md",
	notes: "decisions",

	content(){

		code.js(`import { Omnibox } from "/framework/ext/Omnibox/Omnibox.js";

new Omnibox({ app: this.app, page: this });`);

		md("**Type to search this whole site.** Press `/` (nothing else focused) or **Ctrl/Cmd K** to jump into the field below from anywhere on this page — it is already focusable by click too. Arrow keys move, **Enter** goes, **Tab** completes the top match, **Esc** closes.");

		new Omnibox({ app: this.app, page: this });

		md("**A Space on an empty box** switches search → command — try it, then Space again to switch back. [`doc/decisions.md`](./doc/decisions.md) has the verdict, including the one query it gets wrong.");

		md("**The live demo, over the real site index and three scripted scenarios:** [/imagine/platform/omnibox/](/imagine/platform/omnibox/).");

		md.details(import.meta, "readme.md", "Readme");
	},
});
