import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. The right page is a CONTENT INVENTORY — headings, callouts, lists,
   tables, inputs, images — and the site already renders every one of those live at
   /framework/styles/elements/. Re-drawing the list here would be the worse copy of a
   page whose whole job is to be that list. */

export default new NotesNote({
	meta: import.meta,
	title: "There are too many patterns to exemplify?",
	icon: "checklist",
	description: "The content inventory a framework owes you — and the day the owner decided to make the calls.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is short and it is the important half.**

> What's the fix?
> ☐ Easy fs w/ vc…
> ☐ Trees w/ subversions
>
> w/o npm, the minimal site objective is much harder. If trying to "sell" someone
> this framework
>
> Having these guys work autonomously isn't going to work…
>
> I might need to do most of the decision making
>
> There are too many patterns to exemplify?
>
> **DESIGN × DEV** — [a small sketch: a box labelled NAV beside three tall panels]
>
> ✳ Merge pages
> ✳ Make notes & nav

**The right page is the inventory** — everything a framework has to have an answer for
before anyone can build a real page with it:

> Typography, Prose? Content
> Headings, p, callout/blockquote, lists, hr, tables, code, inline
>
> inputs, controls, textareas
>
> images                  Would most sites only need \`/app.js\`? (core modules?)
> layout?!                What about storage, ux, other fancy things?
>
> If server & framework can be npm installed…?
>
> The framework probably shouldn't be edited per site.
> Use \`site.com/module/\` for custom modules?
>
> If starter uses CDN ⇒ no import maps?
> Just \`app.js\` ← \`cdn/framework/App/App.js\`…
>
> Or, maybe \`monorepo/public/framework/\`…?
>
> Using framework via importmap to local \`pub/node-mod\`?
>   ↳ keeps it fully editable
>
> As we start building things…
>
> \`/dev/Thing/page.js\`?`);

		md(`## What it points at

- [styles/elements](/framework/styles/elements/) — the note's whole inventory, built and
  shown rather than listed: text, lists, code, table, forms, media, misc. It is the
  answer to "there are too many patterns to exemplify" — you exemplify them once, on one
  page, and link to it forever.
- [/framework/](/framework/) — "Would most sites only need \`/app.js\`?" The site's own
  \`app.js\` is 100-odd lines: it loads the stylesheets in order, builds the chrome once,
  and constructs the App. That really is most of a site.
- [core/Page](/framework/core/Page/) — the \`/dev/Thing/page.js\` sketch, shipped as the
  blessed shape: \`export default new Page({ meta: import.meta, title, children,
  content(){} })\`, and a dir is a page the moment its parent's \`children:\` names it.
- [/framework/ai/](/framework/ai/) — the note's hardest line, *"having these guys work
  autonomously isn't going to work… I might need to do most of the decision making"*,
  beside what happened next. The board is one page per working day: every task carries
  the ask verbatim, its own log, and what it landed — so the decisions stay with the
  owner and the typing does not.
- [/imagine/design/type/](/imagine/design/type/) — *Typography, Prose? Content*, worked
  out as a scale rather than a list of tags.
- [ext/demo](/framework/ext/demo/) — "Merge pages" and "make notes & nav" in practice:
  one demo shell, so an example is never re-typed to be shown twice.

The two hosting options at the foot of the page are both still open. The repo's
constraint narrows them: **no build step**, so an import map pointing at a local
\`node_modules\` keeps the framework editable, and a CDN URL does not.`);

		md(`Nothing is built on this page. Its own answer to "too many patterns" is the
right one and it is already a page: [styles/elements](/framework/styles/elements/) shows
every one of them, live, in one place.`);
	}
});
