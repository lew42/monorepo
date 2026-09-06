import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. Every sketch on this spread is a NAVIGATION mechanism, and the site
   has a whole realm that shows all of them side by side at real widths —
   /imagine/paging/navigation/. Redrawing one tab bar in a note would be the worse copy. */

export default new NotesNote({
	meta: import.meta,
	title: "Mobile tabs are tricky",
	icon: "tab",
	description: "Tabs that don't fit, two-level documentation nav, and whether BACK should always work.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page starts with a tab bar that doesn't fit.** At the top, a sketch:
**HOME** and **SETTINGS** as two tabs, beside a wide field reading *General* with a ▾ on
it — a tab strip whose overflow has become a dropdown. Under it, the warning:

> ⚠ Mobile tabs are tricky…
> → H Scroll  or  ⇒ dropdown

Then a second sketch — **A**, **B**, **C** stacked down the left, a small \`0/8\` counter,
the word **DOCUMENTATION**, and *Getting Started?* off to the right — a vertical tab list
instead of a horizontal one.

Then the question of where a page's children come from:

> In order to get optimal setup…
> ☑ We need \`directory.json\`?
> or ☑ manually import sub pages?  ← ☑ automatically imports all subs?
> or ☑ Use Vite to pull them?
>
> ☑ \`(mk() → icon-item?)\`   ☑ \`preview()\`

and one about the app shell:

> App Tabs, like VSCode?
>   ↳ Needs some sort of session mgmt?
> ✳ Should **BACK** always work?

**The right page works out documentation navigation.** A sketch of a *Documentation* tab
beside a big *Documentation* heading, with a second row under it. Then the structure:

> Getting Started
> Concepts / Guides ⇒ 2-Level
> API Reference
>
> ?? Nav Item → Full Page?
>
> Inner tabs are tricky (mobile? ⇒ tabs?)
> Simple Menu might be better… →

— drawn as a left rail beside a menu panel with three items — and immediately the cost:

> But then it takes more clicks?

The last block on the page is the routing shortcut:

> **HashRouter** is the only way to get simple routing:
> ☑ tells server/browser which \`page.js\` to load
> ☑ can then import… & lazy render?`);

		md(`## What it points at

- [/imagine/paging/navigation/](/imagine/paging/navigation/) — nine navigation mechanisms
  built and compared at real widths. Its thesis is this note's warning, measured: a nav
  that changes shape as you move through it reads as jumpy, and a **stable** one wins.
- [ext/tabs](/framework/ext/tabs/) — tabs, built. Horizontal, vertical and block, with
  the overflow behaviour the note's first sketch is about.
- [ext/Doc](/framework/ext/Doc/) — the two-level documentation nav, built: a module's
  page carries its properties, methods, notes and files as one tier, and the detail is
  one click down.
- [core/Router](/framework/core/Router/) — the answer to *HashRouter*: no hash. Real
  paths, walked one segment at a time, with each \`page.js\` dynamically imported on the
  way down — so "tells the browser which page.js to load" and "lazy render" both happen
  without a \`#\`.
- [The registry gate, removed](/framework/core/Router/doc/registry-gate/) — and the answer
  to *"Should BACK always work?"*: yes. The router intercepts optimistically and hands
  the URL to the browser when the walk fails, so history is never a special case.
- [\`children:\`](/framework/core/Page/doc/declaring/) — of the note's three
  options, the middle one won, spelled as one string. Nothing crawls, and there is no
  \`directory.json\` and no Vite in the page path.
- [previews](/framework/core/Page/doc/previews/) — the note's \`preview()\` line, built:
  a page describes its own card, and its parent renders a wall of them.

The repo's rule behind all of this is worth saying out loud: **no build step**. That
takes Vite off the table for loading pages, which is why the answer had to be a walk.`);

		md(`Nothing is built on this page — the mechanisms it sketches are all standing at
[/imagine/paging/navigation/](/imagine/paging/navigation/), where you can put them beside
each other at 400 and at 3440.`);
	}
});
