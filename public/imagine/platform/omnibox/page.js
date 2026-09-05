import { Page, md, span } from "/app.js";
import { Omnibox } from "/framework/ext/Omnibox/Omnibox.js";

/* Container: a COLUMN under /imagine/platform/ in /imagine/'s columns host (the
   mastermind wires this in via the hub's `children:` — never edited here). Size:
   `large`, 28–64em — prose, one live widget capped at 32em, three short result
   lists. Own layout: prose + the widget. Regions: one. Preview: the default card.

   The box is bound to `this.parent` (Platform), not to this page: this page has no
   subtree of its own to search inside, so scenario 2 needs a real topic context —
   its own parent is the nearest one with real children, and it is a genuine `Page`,
   never a stand-in built for the demo. */

export default new Page({
	meta: import.meta,
	title: "Omnibox",
	description: "Keyboard-first search, live over 1,056 site urls.",
	icon: "search",
	width: "large",

	content(){
		md(`**\`ext/Omnibox\`, live over this site's real index** — built from \`/directory.json\`, the same generated file the dev server already writes. No crawl, no fake tree: every result below is a real url on this site, right now.`);

		let $stats;

		new Omnibox({
			app: this.app,
			page: this.parent,
			built: index => $stats.text(`${index.rows.length.toLocaleString()} urls indexed in ${index.ms.toFixed(1)}ms`),
		});

		$stats = span.c("muted", "indexing…");

		md("Open it with **`/`** (nothing else focused) or **Ctrl/Cmd K**, from anywhere on this page. Arrows move, **Enter** goes, **Tab** completes the top match, **Esc** closes. The interaction-model verdicts — why a visible field, what \"strong\" means, the Space-bar call — are in [`ext/Omnibox/doc/decisions.md`](/framework/ext/Omnibox/doc/decisions/).");

		md("## Three ways in\n\nEach is a real query against the real index — try it in the box above.");

		md(`### 1 · Find a topic from cold

Type **\`gam\`**. Nothing under this box's own subtree (Platform — bound below) matches,
so it falls straight through to a pure global search and lands on **Game** —
\`/imagine/game/\`, one clean prefix match, no local subtree to prefer.`);

		md(`### 2 · Search inside the current topic first

This box is bound to **Platform** — neither it nor this page claims \`is: "topic"\`, so
that is the fallback rule itself: *a page's own subtree, when it has no topic ancestor.*

Type **\`res\`**. **Research** (\`/imagine/platform/research/\`) — inside Platform — comes
first, ahead of *Resume*, *Respond* and three other pages also named or prefixed
"Research" elsewhere on the site. Local wins on tier, not luck.

Now type the WHOLE word, **\`model\`**. Platform has "Topic Model" — a local
**word-start** match — but the page titled exactly **Model**
(\`/framework/styles/layouts/model/\`), elsewhere on the site, is a **strong** match (its
whole title equals your query) and jumps ahead of it anyway. Locally close is not the
same as an exact hit.`);

		md(`### 3 · Jump to a page you half-remember

You don't remember the name, only a fragment. Type **\`board\`** — not a prefix of
anything obvious — and the substring tier still finds **Dashboard**, four times over,
plus **Board**. Nothing here needed the exact word, only a piece of it.`);

		md(`## Not now

Three things the brief named and this prototype deliberately leaves alone: **users**
(nobody is signed in to have a personal history), **content search inside a page**
(only titles are indexed, never a page's own prose), and **chat** (the command mode
below is three hardcoded links, not a conversation).`);
	},
});
