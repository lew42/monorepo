import { Page, h2, md } from "/app.js";

/* The patch. Importing it is what puts `demo()` on every Page — the ext/tabs move. */
import "../shell.js";

/* Three EXISTING pages, imported and rendered as demos. Nothing below configures a
   layout: the shell is the same three times, and the only words that differ are the
   ones the owner asked to be configurable. */
import feed from "../../../styles/layouts/feed/page.js";
import finder from "../../../core/Page/overview/columns/finder/page.js";
import generator from "../../../core/Page/generator/page.js";

export default new Page({
	meta: import.meta,
	title: "Shell",
	description: "page.demo() — one demo UX, worn by three existing pages.",
	icon: "deployed_code",

	content(){

		md(`**\`page.demo()\`** — the merge, prototyped. Any page, imported and rendered
through one shell: the **path** above, the **width readout** under the render, the
**source beside** the render where there is room and under it where there isn't, and
**no height** — only a floor. Six words configure it; there is deliberately no
\`height\`, which is what cuts 17 demos off today.

The audit and the migration plan: [ai/2026-08-30/demo-merge/](/framework/ai/2026-08-30/demo-merge/).`);

		h2("A block page");
		md("`styles/layouts/feed` — a leaf, so no app mode. `page.js` is the source column.");
		feed.demo();

		h2("A columns demo");
		md("`core/Page/overview/columns/finder` — app mode, because it has children: the path strip follows the columns as they open, and the box has no height, so a fifth column cannot be cut off.");
		finder.demo({ min: "26em" });

		h2("A generated page");
		md("`core/Page/generator` — the same shell, code off. `widths: false` would drop the presets too.");
		generator.demo({ code: false });
	},
});
