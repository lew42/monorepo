import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the `layout` skill's five): the app's main region under /notes/, a plain page
   grid. One reading column; the photo takes `wide` and is capped by HEIGHT in notes.css.
   Two regions — crumbs, then content — and no children.

   Nothing is built here. Every question on this spread was ANSWERED by the router that
   now ships, so the deliverable is the set of links: each line of the note beside the
   doc page that settles it. A second, worse copy of the router in a note would be noise. */

export default new NotesNote({
	meta: import.meta,
	title: "Walk down, or jump to topic?",
	icon: "route",
	description: "How a deep URL finds its page — and what happens if a page imports app too early.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page asks one question: when someone opens \`/m/a/b/c/\`, what loads?**
Three answers are drawn, in order.

> \`/app.js ← /<topic>/page.js ← m/a ← m/a/b\`
>
> or dynamically,
>
> \`/m/a/b/c/\` walks & dynamic imports each
>
> or, jump-to-topic — \`/m/a/b/page.js\` loads \`/m/page.js\` directly
>
> or, always load \`/topic/page.js\`, then let app walk down…?

Then, across the middle of the page in big letters, the reminder that the answer is
probably already lying around:

> **FIND KEYS IN COUCH**

("KEYS" is written over a scribbled-out word.) Under it, four consequences of picking
the walking answer:

> move \`app.routes = new Router()\` in by default?
>
> Page is only View w/ show?
>
> App now does some \`render_url()\` stuff…

and a sketch of versioned files on disk:

> \`/1/Thing1.js\` · \`/1/0/Thing1.0.js\` · \`/1/1/Thing1.1.js\` · \`/1/[last]/Thing1.??.js?\` ·
> \`Thing1.fix.test.js?\`
>
> — "Could get published @ 1.0.x and just stays as *latest 1.0.x* in repo for reference?"

**The right page is what goes wrong.** It opens with the trap:

> pre-loading pages?
>
> If you try to import a page that uses \`app\` — like \`app.$body.ac("theme-1")\` — before
> in app.js, before \`new App()\` has even been created, it blows up…

and works out the way round it:

> Mandating topic import in app.js? If it's a "dormant" \`new Page()\`, it seems fine,
> besides the extra overhead…
>
> If not? You have that whole *import children in parent, & import parent in children*
> thing. ☞ Especially if app → \`/deep/path/page.js\`, directly.
>
> If we change to sequential loading, \`/deep/path/to/\` → \`/deep/page.js\`.
>
> or even \`/page.js\` replaces app.js? → \`deep/page.js\`?

The foot of the page turns to tests:

> test → responsive viewport? · \`test.ui(\` · \`test.r( ui.viewport? {…\` ·
> \`*.node.test.js\` → same test? fn? · stubs? · playwright?

and the last line asks the question the whole spread circles:

> could page import app?`);

		md(`## What it points at

Every question here has an answer on the site now.

- [core/Router](/framework/core/Router/) — the walk won. A deep URL is resolved by
  walking the declared tree one segment at a time and dynamically importing each
  \`page.js\` on the way down: the note's second option, shipped.
- [The registry gate, removed](/framework/core/Router/doc/registry-gate/) — the verdict
  on "always load \`/topic/page.js\`, then let app walk down". A registry can only hold
  pages that were imported, and the set of real URLs is bigger than that by
  construction, so the gate was deleted and cannot come back.
- [core/Page — \`children:\`](/framework/core/Page/doc/declaring/) — "import
  children in parent, & import parent in children" became one word: a parent names its
  children as a string, and nothing crawls the filesystem.
- [A dormant page](/framework/core/Page/) — "if it's a *dormant*
  \`new Page()\`, it seems fine" is exactly how it works: constructing a page registers
  it and renders nothing; \`activate()\` is the separate step.
- [App boot order](/framework/core/App/doc/boot/) — the "it blows up" trap, written down:
  what exists when, and why a module that touches \`app\` at import time is a bug.
- [ext/DesignTool](/framework/ext/DesignTool/) — "test → responsive viewport?", built as
  a measuring tool rather than a test runner. The headless Playwright loop the note
  imagines is real, but it lives in a Claude skill (\`ui-test\`), not on a page.

One import cycle in the note is still a live trap and is written on the wall of the
repo's own \`CLAUDE.md\`: imports flow **down**, and a parent↔child import cycle breaks
only on a deep reload.`);

		md(`Nothing is built on this page — the answers are pages, and they are linked above.
The note's first line names a real directory in this repo whose name is the owner's, so
it is written here as \`/<topic>/page.js\`.
[The original photo](/notes/inbox/2026-09-06-039.jpg) — which only opens on a local
checkout (the inbox is not in the repo) — has it as it was written.`);
	}
});
