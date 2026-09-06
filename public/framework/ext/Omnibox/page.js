import { Doc, md, h2 } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Omnibox",
	description: "Moved into core on 2026-09-06 — the search box is core/Search, mounted once for the whole site.",
	icon: "search",

	files: "Omnibox.js page.js readme.md",
	notes: "decisions",

	content(){

		md("**The Omnibox is not an extension any more.** It is [`core/Search`](/framework/core/Search/), and `app.js` mounts exactly one of it for the whole site — so it is on this page right now. Press **`/`** (when you are not already typing) or **Ctrl/Cmd K**, and it opens at the bottom of the window.");

		md("This directory is a **pointer**, kept so that a page still importing `ext/Omnibox/Omnibox.js` keeps working: constructing it draws one line saying where the box went, with a button that opens it.");

		h2("What graduated, and what did not");

		md(`| From the prototype | Now |
|---|---|
| \`/\` and Ctrl/Cmd K to open, Esc to close | kept |
| the index built from \`/directory.json\` | kept as the LIST of urls — every row is then loaded by \`Page.load()\`, so a result cannot promise a page the Router fails to open |
| ranking by title tier | kept, and a description tier added under it |
| an always-visible field | kept, and moved to the bottom-centre |
| **Tab** completes the top match | **dropped** — Tab has to reach the filter chips and the *show more* button |
| **Space** on an empty box switches to command mode | **dropped** — three hardcoded links were never a command palette, and the trigger collided with any query starting "space" |
| the highlighted row's borrowed \`preview()\` | **dropped** — the results are a wall of forty cards now, so every match shows itself and no single row is special |

The verdicts behind each of those, and the ones that replaced them, are in [core/Search's decisions](/framework/core/Search/doc/decisions/). This module's own record is on its **Docs** tab.`);

		md.details(import.meta, "readme.md", "Readme");
	},
});
