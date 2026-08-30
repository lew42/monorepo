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
	description: "page.demo() — one demo UX, and every demo page on the site wears it.",
	icon: "deployed_code",

	content(){

		md(`**\`page.demo()\`** — the site's one demo UX, and every demo page on the site
is now this. Any page, imported and rendered through one shell: the **path** above,
the **width readout** under the render, the **source beside** the render where there
is room and under it where there isn't, and **no height** — only a floor. There is
deliberately no \`height\`, which is what used to cut 17 demos off.

\`demo.exhibit()\`, \`demo.page()\`, \`demo.tree()\` and \`demo.layout()\` are
\`children:\` factories over it — page shapes, not four more ways to draw a demo —
so 231 call sites moved onto this by changing four files. The audit and the
five-step order: [ai/2026-08-30/demo-merge/](/framework/ai/2026-08-30/demo-merge/).`);

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
