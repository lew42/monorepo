import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built — the whole spread is CSS and API that already
   shipped, and the one rule on it is quoted rather than re-demoed. Said at the end. */

export default new NotesNote({
	meta: import.meta,
	title: "The rule that shows a page",
	icon: "css",
	description: ".page.active { display: var(--page-display) } — and who hides the nav.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page works out who owns the nav.**

> \`div.app\` ∴ \`$pages\` — \`app.show\` · \`app.$nav.show/hide()\` ·
> \`page._activate → activate() {}\`

> If \`/framework/\` swaps a full page, it hides \`$nav\`… then renders its own, & sub pages
> can <u>keep</u> the fw nav?
>
> The only caveat there is that all topic pages have to follow that pattern, & maybe
> re-render app nav?
>
> \`fw/page.activate: app.$nav.hide()\`, \`.deactivate: app.$nav.show()\`?

Then two more ideas:

> View trees w/ Columns → preview → details → full-viewport? *full-screen?*
>
> **"Breakout"** — super/double wide sections: negative margins? \`.c("double")\`

**The right page is the CSS that makes it work.**

> \`.page { display: none; }\`
> \`& .page.grid { display: grid; }\`
> \`& .page.active { display: var(--page-display); }\`
>
> or \`.page:not(.active) { display: none; }\`?

> \`framework.css\` — 4 layers · code as docs?
>
> Inject docs into code? — above, below, args, return, & even inline?
>
> ⚠ Methods should be documented for <u>usage</u> first, dev/src 2nd.
>
> \`Class → [ search ]\` → \`method\` · \`demo ← files, browser URL\`
>
> \`page.layout()\` · \`render()\` — \`this.view ??= this.layout();\` · \`layout()\``);

		md(`## What it points at

- [core/Page](/framework/core/Page/) — the note wrote the rule two ways and the **second
  one shipped**: \`Page.css\` hides with \`.page:not(.active-page, …)\`, not with a plain
  \`.page { display: none }\`. The reason is written into the file: at \`(0,1,0)\` a plain
  \`.page\` rule *ties* \`.page.grid\`, and a tie is decided by source order rather than by
  intent. "Hide unless" wins outright.
- [/framework/styles/layers/](/framework/styles/layers/) — "\`framework.css\` — 4 layers":
  \`base theme site util\`, ordered once in \`framework.css\`, which the app loads first.
  Every rule on this site lives inside one of them.
- [ext/Doc](/framework/ext/Doc/) — "inject docs into code" and "methods should be
  documented for usage first", both built: a module's docs are generated from the module,
  and the usage tab leads.
- [/imagine/paging/navigation/](/imagine/paging/navigation/) — "view trees w/ columns →
  preview → details → full-viewport", built as nine navigation mechanisms.
- [/imagine/design/layout/](/imagine/design/layout/) — **"Breakout"**: wide sections are a
  word (\`wide\`, \`bleed\`) rather than negative margins, and this note is where the
  question was asked.`);

		md(`Nothing is built on this page. It is a **CSS rule and an API**, and both
shipped — the rule is quoted above in the form it takes today, and re-drawing a page that
shows and hides itself would only show you a blank box.`);
	}
});
