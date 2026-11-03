import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built — tabs and lazy pages both shipped, and the
   note's own question about them was answered by the prototype. Said at the end. */

export default new NotesNote({
	meta: import.meta,
	title: "Tabs, and lazy pages",
	icon: "tab",
	description: "Tabs add sub pages without being pages, and a link is what loads one.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is the tabs API, worked out in the margin.**

> **Tabs:** not a page, but… adds sub pages? Can we have multiple nested tab groups at
> once? → prob. shouldn't…
>
> \`page.tab("Label", () => {})\` & \`page.tabs();\` — *render here*
>
> beside it: \`tabs(tab => { tab("Label", …) })\`

> \`page.sidebar?\` \`.left\` & \`.right\`? · \`.header()\`?
>
> \`new Page({ … modal? … left() { … } })\`

> Each page could have its own \`.$pages\`? ↳ for sidebar switching?
>
> Can tabs be lazy? The first one would get rendered…

> **Lazy pages:** activated via link → router → activation
>
> ① \`router.go\` → \`root.child(seg)\` → activation on page → \`container.append(page.view)\`

**The right page is about \`lew42.com\` being a separate site.**

> \`lew42.com\` ← should probably be a **fork**?
> \`FRAMEWORK / CORE / LEARN?\` — pulls latest framework (monorepo) · adds own content,
> outside mono

Then a column — \`fw FRAMEWORK · CORE · EXT · One · Two · md · highlight · demo?\` — beside
a note reading *"if all child pages default to swap…"* and a small frame labelled
\`class App\` with tabs \`OVERVIEW · CODE · API\`.

> \`app/home\` nav vs \`framework/\` nav
>
> \`page.views[]\` ← sidebars, page, etc. links?
>
> \`app.render() ⇒ div.app\` · \`app.$nav\`?
>
> What condition/mechanism shows/hides (swaps) navs?
> if \`page.nav\`, assume \`page.$nav\`, & show/hide?`);

		md(`## What it points at

- [ext/tabs](/framework/ext/tabs/) — tabs, built, and built the way the note's first
  instinct wanted: \`tabs("what why")\` returns a view you place. It needs no new class and
  no directory per tab, and **which** children are tabs is decided where you place them,
  not marked on the child.
- [core/Router](/framework/core/Router/) — lazy pages, built. A declared child is imported
  on demand when the router walks to it, so only names in \`children:\` ever cost a
  request, and an invented url cannot shadow a real file.
- [core/Page](/framework/core/Page/) — \`page.views[]\`, sidebars and headers: a page owns
  its regions, and its children mount inside its own view.
- [Templates](/imagine/paging/templates/) — "\`lew42.com\` should probably be a fork":
  the site's answer is a template you start from rather than a fork you maintain.
- [/framework/core/](/framework/core/) — the \`FRAMEWORK / CORE / EXT\` column, as the real
  tree: nine core classes, and \`ext/\` beside it.`);

		md(`Nothing is built on this page. Both of its systems shipped —
[tabs](/framework/ext/tabs/) and [lazy routing](/framework/core/Router/) — and the note's
own worry ("can we have multiple nested tab groups at once? → prob. shouldn't") was
settled by building it: nesting works, and the docs still advise against it.`);
	}
});
