import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built — the readme shape and the route registry are
   both decisions, and both were made. Said in one line at the end. */

export default new NotesNote({
	meta: import.meta,
	title: "Readme 1 – N",
	icon: "list_alt",
	description: "A readme is a numbered index, and every doc it names has a page.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is the shape of a readme.**

> **AI docs** — \`path/dir/readme.md\`? · *index?*
>
> **Readme: 1 – N** → summary w/ link to… \`doc/name\`?
>
> a \`sub.page.js\` could export default md? ⇒ at that point, just export a \`pg\`?

Under a rule, three smaller ideas:

> \`theme()\`
>
> \`css.edit(\\\`code\\\`)\` → \`eval'd\`
>
> \`code.demo(() => { … })\` — \`fn.toString()\`…
>
> \`Thing / Name / ThingName\` — or even \`Thing-Name / Thing_Name\` *// mixin?*

**The right page is the router, again.**

> \`page.show()?\` \`.activate()?\` \`.go()?\` — \`page.route?\` \`page.router.go(stages)\`
>
> \`/page.js\` vs \`/app.js\` ↓ *have content · site-wide, nav, plugins, etc*

> **Do we need a route registry?** ⚠ If some sub page dies, just error? *Maybe not?*

> **Top-Down (Sequential)** — ⚠ Will this backfire?
>
> Can we still get, roughly, the same behavior? \`/root/a/b/c/page.js\` — \`/page.js\`??
> & \`TestPage\` or…? — \`/a/page.js\`??

> \`app.route("name", fn)\`? — \`new App({ routes: { no-hyphen: underscores_to_hyphen() {
> … this === app? } } })\`

> \`app.load\` → always load root page? *seems silly, unnecessary.*
>
> Could \`app.js\` import \`/page.js\`? w/o recursion?`);

		md(`## What it points at

- [ext/Doc](/framework/ext/Doc/) — "readme 1 – N → summary w/ link to \`doc/name\`", built
  and now the house shape: a readme is the reader's **index**, and each numbered line
  links to one \`doc/*.md\` beside the module. Every module on this site has
  \`readme.md\`, \`page.js\` and \`doc/\`.
- [core/Router](/framework/core/Router/) — "do we need a route registry?" answered **no**.
  A page exists once its parent's \`children:\` names it, so the declaration *is* the
  registry, and nothing crawls the filesystem looking for pages.
- [core/App](/framework/core/App/) — "could \`app.js\` import \`/page.js\` w/o recursion?":
  yes, and the rule that makes it safe is written into core — imports flow down, parent
  links point up, never both.
- [ext/demo](/framework/ext/demo/) — \`code.demo(() => {})\` with \`fn.toString()\`, built:
  a demo's code tab is the function that drew it, so the two cannot disagree.
- [ext/highlight](/framework/ext/highlight/) — the rendering of that code.`);

		md(`Nothing is built on this page. Both of its questions are **decisions**, and both
were made: a readme is a numbered index that points at \`doc/\`, and there is no route
registry because \`children:\` already is one. The naming question at the foot of the left
page — \`Thing / Name / ThingName\` — was settled too: a class name mints its CSS class, so
the name and the selector are the same word.`);
	}
});
