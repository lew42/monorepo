import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. The photo and the swatch strip take
   `wide`; prose keeps the measure. Two regions, no children.

   The right page ends with five status colours, named. That is the one thing on the
   spread you can put on a screen, so it is: five swatches, each drawn in the site's own
   token for that status, so the note's list and the live palette agree or visibly do not. */

/* The note's five, in its order. `token` is the CSS variable the site actually uses; when
   there is none, the swatch falls back to the colour the note names, and says so. */
const STATUS = [
	{ name: "default", note: "gray (alpha)",  token: "--line" },
	{ name: "info",    note: "blue",          token: "--info" },   // no such token — see below
	{ name: "success", note: "green",         token: "--ok" },
	{ name: "error",   note: "red",           token: "--error" },
	{ name: "warn",    note: "yellow/orange", token: "--warn" },
];

function status_swatches(){
	return div.c("surface pad flex gap wrap wide", () => STATUS.forEach(s => {
		div.c("flex v gap").style({ flex: "1 1 8em", minWidth: "7em" }).append(() => {
			// `var(--token, <the note's colour>)`: if the site has the variable the swatch
			// is the site's; if not, it is the note's word, and the caption still reads.
			div().style({ height: "3em", borderRadius: "var(--radius)",
				border: "1px solid var(--line)",
				background: `var(${s.token}, ${s.note.split("/")[0]})` });
			span().style("fontWeight", "700").text(s.name);
			span.c("muted").style("fontSize", "0.85em").text(s.note);
		});
	}));
}

export default new NotesNote({
	meta: import.meta,
	title: "Nested rendering",
	icon: "account_tree",
	description: "Who draws the nav — and the five status colours.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is headed \`NESTED RENDERING?\`** and asks who is responsible for the
chrome.

> When you load (& render?) \`/pages\` by \`/path/page.js\`, instead of letting the end page
> have full control…
>
> ① you don't have to \`app.nav()\` on each page — instead, the root page handles it? ↓
> but, would it? or it asks \`app\` to?

> if we don't need \`app.$nav()\` on each page…
> ① \`app\` needs to render \`nav()\`… → \`app.render()\` override?
> ② each page doesn't need to…?
> ↳ But, either \`app\` **always** does it, **never** does it, or needs config & conditions?

Then the same question about the router:

> **Can \`app\` be independent of router?**
> \`new Router({ mode: "direct" || "sequential" });\`
> or \`app.router.add("path", () => app.router.load(…))\`

and at the foot: \`Page.import?\` · \`pg.child()?\` · \`router.load()? → load/segments()\` ·
\`① app.load → router.load(pathname)\`.

**The right page starts with docs generated from code.**

> \`Class.method.toString()\` — keeps docs & code in sync… ⚠ line numbers change

> ① App auto-dynamic imports root \`page.js\`? It could skip it & go for \`/first/\`
> ② Router then loads \`/each/part/\`

> **CSS** → Chunk matching — \`(Selector + {…})\` } ⇒ Usage · Options/Variants

drawn as a tall \`BIG CSS\` column feeding \`chunk\`, \`used\`, \`unused\` boxes. And then the
five colours the strip below rebuilds.`);

		md(`## What it points at

- [core/Router](/framework/core/Router/) — "can \`app\` be independent of router?", settled
  by construction: \`App\` builds a \`Router\`, the router walks to the url, and a page never
  mentions it. Imports flow down and \`.parent\` links point up — never both, because a
  mutual import breaks only on deep reloads.
- [core/App](/framework/core/App/) — who renders the nav: \`app\` does, once, and a page
  that wants the screen asks for it rather than each page re-deciding.
- [ext/Doc](/framework/ext/Doc/) — "\`Class.method.toString()\` as docs", built: a module's
  documentation is generated from the module, so the two cannot drift.
- [/framework/styles/rules/](/framework/styles/rules/) — **CSS chunk matching**: every
  rule on the site, with what it lands on. \`ext/CSSDoc\` does the live version — it reads
  the CSSOM for the rules that actually hit an element — but ships as a module with no
  page of its own yet.
- [/imagine/design/color/](/imagine/design/color/) — the palette these five statuses live
  in.`);

		md(`## The five status colours

The note's list, each swatch painted with the site's own token for that status. Where the
site has no token for one, the swatch falls back to the colour the note names — so a gap
between the note and the palette shows up as a difference you can see rather than a claim.`);

		status_swatches();

		md(`Four of the five are real tokens in \`framework.css\`: \`--line\`, \`--ok\`,
\`--error\` and \`--warn\`, each defined for light and dark. **Info is the gap.** The site
has no blue: its one accent, \`--prim\`, is a coral red, so the "info" swatch above is
falling back to the note's own word. That is a decision waiting to be made, not a bug —
either info borrows the accent, or the palette gains a fifth colour.`);

		md(`Everything else on this spread is **architecture** — who renders what, in which
order — and the answers are in the classes linked above rather than in a box.`);
	}
});
