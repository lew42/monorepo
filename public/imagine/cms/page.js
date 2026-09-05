import { Page, md, div, img, View } from "/app.js";

View.stylesheet(import.meta, "cms.css");

const here = new URL(".", import.meta.url).pathname;
// One real screenshot per child, captured 2026-09-05 (ux-rethink pass) — a still of the
// actual page beats the generic icon it replaces (design/, gallery/, shells/, decks/ named
// this the biggest single win of the night). On THIS wall it is not free: only two tracks
// fit at 1280 (`large` is half the width a full-width wall gets), so a thumb costs real
// height even at the shortened `--stage` below — measured +74px at 1280, +25px at 3440.
// Worth it: `preview_card()` drops the description once there is a thumb, and "Welcome"
// went from a bare title with nothing under it to an actual picture of the rendered page.
const SHOTS = { thinking: "thinking.jpg", welcome: "welcome.jpg", edit: "edit.jpg", services: "services.jpg", json: "json.jpg" };

/* Container: /imagine/'s columns row — one more column in it. Size: `large` (28-64em) —
   the critique (2026-09-04) found this page 99/100 on taste yet only 31% wide at 3440,
   a 2180px dead block past a left rail; `large` is the doc's own word for "a grid, a
   table, wide content" and is what its own children (thinking/, services/) already
   picked for the same reason. Own layout: `.flow` + one card wall (`previews()`'s own
   shape, hand-drawn so each card can carry a real screenshot — ux-rethink 2026-09-05,
   see `shots/`). Regions: two —
   this column, plus a THIRD: `Guide`, a rearrangement (not new content) of what used
   to be this page's own closing paragraph, given its own `classes: "default"` column
   so it opens beside CMS instead of scrolling under the wall — the row's own answer to
   "one contiguous dead block", not a wider measure (doc/columns.md, `default` column).

   THE POINT: every "CMS" this repo needs already exists as two seams that were built
   for other reasons. `welcome.md` is a plain markdown file beside this page.js, and
   `Page.file()` turns it into /imagine/cms/welcome/ with no code at all. `edit/` writes
   that same file through the dev socket's `rpc:write`. The content is a file in git —
   so "publish" is `git commit`, and there is nothing to lock in to. */

export default new Page({
	meta: import.meta,
	title: "CMS",
	description: "A CMS out of two seams that already existed: a markdown file is a page, and the dev socket writes files.",
	icon: "edit_document",
	width: "large",

	children: ["thinking", "welcome", "edit", "services", "json", {
		title: "Guide",
		classes: "default",
		content(){
			md(`Start with [**Thinking**](/imagine/cms/thinking/) — five minutes, and it is the part that
decides anything. [**Services**](/imagine/cms/services/) is a mock on purpose: it composes the
\`npx wrangler\` line for each screen and hands it to you rather than holding a token.

[**JSON pages**](/imagine/cms/json/) is the same idea one level deeper — a whole page tree that
exists as \`page.json\` plus an append-only \`page.jsonl\`. Put that pair on the dev socket instead
of fetching it once and you get [**streaming pages**](/imagine/stream/): an edit here, redrawn
there, 9 ms later.

How it is built, and the four traps found on the way: [\`readme\`](/imagine/cms/readme/).`);
		},
	}],

	// My content already draws them as a previews() wall — without this, core adds a
	// second list of the same four names underneath it. `guide` is left out: it is
	// already open beside me (the `default` column), not a fifth card to click.
	index: true,

	content(){
		md(`A **content management system** is three things: content that lives somewhere, a
screen to change it, and a way to publish. This repo already had all three and did not
notice — [\`welcome\`](/imagine/cms/welcome/) is a plain \`welcome.md\` file sitting beside
this \`page.js\`, and core turns any such file into a page ([\`Page.file()\`](/framework/core/Page/doc/declaring/)).
[\`edit\`](/imagine/cms/edit/) writes that file back over the dev socket. Publishing is \`git commit\`.

**No backend was added.** The think-through weighs the ones that were on the table —
git JSON/JSONL, \`node:sqlite\`, Cloudflare D1, Durable Objects, KV, R2 — and lands on a
seam instead of a service.`);

		// A real still per card, not `previews()`'s generic icon — same wall shape
		// (`.page-previews bleed`, `preview_card()`), two substitutions: a thumb, and a
		// letterboxed `--stage` (16/6.5, not the 16/10 default) — this wall's column is
		// only two tracks wide (`large` is ~40-64em, half that per card), so the default
		// aspect drew a thumb tall enough to add 130-230px to the page; the shorter crop
		// still reads as "the real thing" and gives most of that height back.
		div.c("page-previews bleed").style("--stage", "16 / 6.5").append(() =>
			[...this.children].forEach(([name, page]) => {
				if (name === "guide") return;
				const nav = this.nav_for(name);
				this.preview_card(nav, () => img.c("cms-shot").attr("src", here + "shots/" + SHOTS[name]).attr("alt", nav.label));
			}));

		// ⚠ The constant this page was missing: every healthy-growth sibling (platform,
		// blogx, stream) has real prose AFTER its previews wall too, so its exit margin
		// rides `--flow` like the rest of the page. This page stopped cold right after
		// the wall — nothing there to measure but the wall's own tight, non-scaling
		// card-internal gaps (`.page-preview`'s `gap: 0.6em`), which is why its median
		// barely moved between 1280 and 3440 (1.03×, spacing-study 2026-09-05) even
		// after the previews-wall fix.
		// ⚠ TWO blocks, not one: `md()` "adopts" a single root block directly (a bare
		// `<p class="md">`, no `.flow`), so it inherits whatever `--flow` a column has
		// scoped down instead of resetting to the page's own 2em — the exact bug this
		// task just fixed on the wall, one call away from recurring here.
		md(`The **Guide** column beside this one walks the same five in the order to read them.

Either way, [\`edit\`](/imagine/cms/edit/) is the only one that writes anything back.`);
	},
});
