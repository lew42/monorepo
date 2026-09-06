import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose keeps the measure. Own layout: `.md` flow. Two regions, no children. Preview: the
   photo thumb.

   Nothing is built here. The spread is a launch decision and a hosting decision — what to
   put at the root of a domain, whether to run ads, which Cloudflare product holds user
   data. None of it is a screen, and the two things on it that ARE screens (page previews,
   folders) exist already and are linked. */

export default new NotesNote({
	meta: import.meta,
	title: "Build my platform? Realtime Web Design",
	icon: "rocket_launch",
	description: "One big json bundle, or the fs as the UI.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page starts with the loop the site is for.**

> ☑ Publish ideas — *Premiums ⇒ Points (Shares?)*
> ☑ Get feedback
> ⇒ **Mastermind…**

Then the blog, as an API:

> **Lew42 Blog** — \`new Page({ title, etc })\`?
>
> \`app.page\` = current page?
> \`{ page } = page("Title", () => { … })\`?

Then the idea the page is really about — where a site's content lives:

> Use one big **json data bundle** for pages, content, md, etc?
> → **the fs is nice… & could be the UI**
> → use \`directory.json\` to generate proper imports & config?
>     \`page.js\` · \`page.md\`?

and a database question, answered on the same line it is asked:

> **Neon + CF Hyperdrive?** ↓ *Prob not necessary?*

**The right page is the launch.**

> \`framework.lew42.com\`?
> → actually the framework repo? hosted @ root (no \`public/\`)
> ☑ needs own \`index.html\`, then own \`app.js\`? use lew42?

> **Framework-site?** ← *Pretty bare…*

> **Launch \`lew42.com\`:** → blog? **+ me + video**
> ☑ fly ☑ 3D scroll ☑ framework

> or, **go all in on the Agency**, & run ads for ☑ marketing ☑ web ☑ social

Then hosting, in three lines:

> **Cloudflare KV: No storage cap?** — *25MB per value, slows it down?*
> ✱ **SIMPLE AUTH W/ KV ONLY?** ✱
>
> **Use R2 for user data?** ☑ Not queryable… ☑ Cheap ☑ priv & pub…

A sketch of a page with a rail and a card sits beside:

> import & preview pages ⇒ **Layout Collections?**
> ☑ new page  ☑ organize ⇒ **folders**

and the last line on the spread, which is the note's name:

> **Build my platform? ⇒ Realtime Web Design**  ☑ my framework?`);

		md(`## What it points at

- [/blog/](/blog/) — "Lew42 Blog — \`new Page({title})\`?" shipped exactly that way: a post
  is a Page like any other page on the site, so it gets the same nav, the same previews and
  the same routing for free.
- [The data decision](/imagine/platform/decisions/data/) — the record that rules on "one big
  json bundle" versus the filesystem, and on KV versus R2 for user data. Its answer keeps
  the filesystem for curated content and sends live writes to a database, which is the note's
  own instinct made specific.
- [Cloudflare research](/imagine/platform/research/cloudflare/) — the KV cap, the R2
  trade-off and what each product actually costs, dug and rated. "25MB per value, slows it
  down" is checked there.
- [core/Layout](/framework/core/Layout/) — "Layout Collections", under the name it got: a
  layout is a named tree you can import and preview, not a folder of screenshots.
- [Paging · make](/imagine/paging/make/) — "new page ☑ organize ⇒ folders", built. This is
  the editor where a page is created and moved, and the one place on the site that saves.
- [/imagine/platform/](/imagine/platform/) — "Build my platform?" as a research program:
  nine graded topics, five decision records, and one MVP slice that spends them all.
- [core/Page](/framework/core/Page/) — \`directory.json\` is real and does generate the
  routing, but not the imports: a page exists once its parent's \`children:\` names it.
  Nothing crawls.`);

		md(`**Nothing here is buildable.** The spread weighs a launch (blog and video, or an
agency and ads) and a hosting choice (KV, R2, Neon). Both are decisions, and both already
have a page that argues them with numbers — a demo would only repeat the sketch.`);
	}
});
