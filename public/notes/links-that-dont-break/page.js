import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. This spread asks three routing questions and the site has a WRITTEN
   VERDICT on each — including one that says the note's own preferred answer cannot
   work. Those verdicts are the deliverable; a demo of a router is the router. */

export default new NotesNote({
	meta: import.meta,
	title: "Links that don't break",
	icon: "link",
	description: "Ignorant routing, pg.link(), and the sentence that sizes the whole framework honestly.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is still on repo shape, and getting tired of it.**

> What if git submodules are the way? Only b/c I don't want a bundler?
>
> Class Builder = hashed string composer = git?
>
> We want a super file system… → Use git & ai to automate git submodules?
>
> Focus on CSS & Layout & Basic UI?
>
> But, how do we organize modularly? → **Just put it all in \`framework/\`?**
>
> ✳ \`main\` is for the simple template starter
>
> ✳ fork the whole repo for addons? Ext? ↳ sub?
>
> \`framework.lew42.com\` ↰ importmap "framework" ↲
> ① cons of importmap? ☑ one/all index ☑ can't dynamic inject
> ✳ 2 Views?
>
> Site-specific things/modules might use diff Classes causing dupes or version mismatch

That "✳ 2 Views?" is the real cost of the import-map idea, and it is a nasty one: two
copies of the same class, and nothing tells you.

**The right page turns to navigation**, and it is the half worth reading twice.

> Do all imports after an index, follow importmap?
>
> If the site-specific modules use \`"framework/*"\`, and it maps to… \`framework.lew42.com\`
> … or \`framework.local/*\` ?
>
> So, the whole framework could be hosted locally just like the \`fw.lew42.com\` "CDN"…
> ☑ Updates could happen "live"?

Then, under a rule across the page:

> **Navigation:**
> ① Links that don't break = \`import\` & ~~sub~~ \`pg.link()\`
>
> Meh: **Ignorant Routing**: only reg routes that are imported?
>   → Might not work if back or other bookmark or something
>   → But, if no registered route, just fallback?

and then the sentence that sizes the whole project honestly:

> In essence this fw is just slightly better than static html?
> ~~However~~, it has **potential**

The last block is what SPA routing would take:

> For SPA-like & ✳ pushState routing via "auto-import" of pages?
> import/add all pages · they auto-add to router?
> \`app.pages[name]\` or \`app.pages.get("/one/two")\`?`);

		md(`## What it points at

Each of the three navigation questions has a written answer, and one of them says the
note's own instinct was right to distrust it.

- [The registry gate, removed](/framework/core/Router/doc/registry-gate/) — *"Ignorant
  Routing: only reg routes that are imported?"*, answered: it **cannot** work. A registry
  can only hold pages that have been imported, and the set of real URLs is larger than
  that by construction — \`route()\` mints URLs from data and \`child()\` probes for names
  nobody declared. The verdict is the note's own fallback line: try the walk, and hand
  the URL to the browser if it fails.
- [\`link()\`](/framework/core/Page/) — *"links that don't break = import &
  pg.link()"*, built. You ask the page for its link, so a moved page moves its own URL
  and nothing has to be re-typed.
- [core/Router](/framework/core/Router/) — the pushState routing the last block asks for,
  built without the "import/add all pages" step: the walk imports one \`page.js\` per
  segment, on the way down.
- [\`children:\`](/framework/core/Page/doc/declaring/) — "just put it all in
  \`framework/\`" is what happened, and this is the one word that keeps a flat directory
  navigable: a page exists once its parent names it.
- [ext/Doc](/framework/ext/Doc/) — "focus on CSS & Layout & Basic UI" as it landed: the
  docs tier that made all three legible.
- [/framework/ai/](/framework/ai/) — "updates could happen live" is real in this repo,
  though not the way the note guessed: the dev server pushes changes to open tabs over a
  socket, and the AI board streams its own log into the page without a reload.

*"In essence this fw is just slightly better than static html; however it has
potential"* is the fairest sentence anyone has written about it — and it is close to the
design goal rather than an insult. The site really is static HTML plus a walk.`);

		md(`Nothing is built on this page. Its three questions are answered by three doc
pages, and one of those answers is a "no" the note had already half-guessed.`);
	}
});
