import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. The one buildable idea on the spread — "1 page to document all the
   styles" — already exists as a whole tier of the site (/framework/styles/), so the link
   is the deliverable. Everything else is a hosting decision or a plan. */

export default new NotesNote({
	meta: import.meta,
	title: "OOP course + responsive web design = freedom",
	icon: "school",
	description: "Where the framework lives, one page for all the styles, and what the monorepo costs.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is nearly empty** — three lines, and the ghost of the previous page
showing through the paper:

> \`lew42.com/framework/\`
>
> \`framework.lew42.com?\`
>
> Basic web dev? → via codepen?

One question: is the framework a *path* on the site, or its own *subdomain*?

**The right page answers it, and then keeps going.**

> \`framework/styles/\`?      \`/name/framework/\`
> \`/name/styles/\`?           \`/styles/\`
>
> **1 page to document all the styles**
>
> ✳ If you use \`@util\`, then try to use them on top of "default" styles, the utils
> break? → not necessarily, but the overwrite (?) potential does…
>
> \`gitpm\` → app  [a small three-column sketch]
>
> — *Paying for this progress is slow… Hopefully they put their AI to work.*
>
> **MARKETING:**
> ☑ YouTube Videos
> ☑ \`framework.lew42.com\`? w/ \`/framework/\`? or \`/core/\`? \`/server/\`?
>     ↓ monorepo? cdn?
>
> I think the monorepo just gets messy, and individual sites can be zero to hero

Then the line the page is named for, underlined:

> **OOP Course** & Responsive Web Design = **FREEDOM**

and the last word on the spread, which is the honest one:

> Moving from this v0.0.0 monorepo towards a full featured framework = a lot of
> decisions, ~~dozen~~ time, etc.`);

		md(`## What it points at

- [/framework/styles/](/framework/styles/) — "1 page to document all the styles", built,
  and then some: rules, layers, elements, stacks, layouts and sections, each shown live
  rather than listed.
- [The cascade](/framework/styles/rules/cascade/) — the \`@util\` worry, settled. Every rule
  in the repo lives in a **layer** (\`base theme site util\`), the order is fixed once in
  \`framework.css\`, and a utility beating a component is then a fact you can read off the
  order instead of a surprise.
- [styles/elements](/framework/styles/elements/) — the "default styles" half of that
  argument: plain HTML that already looks right before any class is added.
- [/blog/](/blog/) — the marketing half, as it actually happened: working notes on the
  framework, the tools built on it, and the board that watches it get built.
- [/web/](/web/) — the guide tier. The closest thing on the site to the note's "OOP
  course + responsive web design": how to build things on the web, shown live.
- [/framework/](/framework/) — the docs, at a **path** on the main site. That is the
  answer the note was looking for on its left page, and it is the one that shipped.

The monorepo question is still open, and the note's own worry about it is the honest
state of things: the setup, branch and deploy steps live in the repo's root \`readme.md\`,
a file in the checkout rather than a page on the site.`);

		md(`Nothing is built on this page. The note is a set of hosting decisions and a
plan, and both already have somewhere better to live.`);
	}
});
