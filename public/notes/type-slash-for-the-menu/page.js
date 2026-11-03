import { md, kbd, p, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose keeps the measure. Own layout: `.md` flow, plus one line of prose that names a key.
   Two regions, no children. Preview: the photo thumb.

   Nothing is built, because the one buildable idea on the spread is already ON this page:
   the `/` hotkey opens the site's search from anywhere, including here. Building a second
   one beside it would be a worse copy of a thing the reader can press right now — so the
   page asks them to press it instead. Show, don't tell. */

export default new NotesNote({
	meta: import.meta,
	title: "Type / to activate the menu",
	icon: "keyboard",
	description: "Auto-state, a view list, and one hotkey.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is about state that wires itself.**

> Each **View / Layout / Tpl** can have all kinds of internal state…
>
> **AUTO-STATE?** \`Proxy\` → auto-wires observers…

with a small box sketched under it. Then the two halves of a view:

> **View** → \`<html>\` + **CSS**
>
> Turn on/off **Chrome Live CSS**? → workspace shift?

and the tool the page wants:

> **Create a tool, where whatever layout you make, you can save & share.**
>
> \`[ UI ]\` — manage html, css        **View List?**

Then the gestures, which is the part that matters most:

> \`Shift + A\` → Add?
>
> \`/\`  **type "/" to activate menu?**
>
> \`Ctrl + Space\`?

beside two frames — a narrow one labelled **mobile** and a three-column one labelled
**desktop** — and, in the margin, \`○ dirname/\` with *turns green when connected*.

**The right page starts with a naming problem.**

> **List** · \`View.List\` · \`Sortable.List\` · \`User.List\` **vs** \`Users\`? **vs**
> \`UserGroup\`?

Then a question this site has to answer over and over:

> **How can we get AI to test UI things?** Like a drag & drop? I think you just test
> **insert, delete**, etc?

Then what a saved view would hold:

> \`ViewList\` → Can save arbitrary html?
> ⚠ wouldn't be great for actual rendering? *(prod)*
> ⚠ maybe it's not bad…?
> ☑ Could have a bunch of **metadata**
> ☑ Could have a **minimal snapshot(s)** ↳ json ↳ html ↳ md

> Layouts could have **multiple drop containers**?

and the trade-off it ends on:

> Using full fs breakout = **inefficient** (1 mil files instead of 1 or 2 …?)
> Yet, fs: ☑ allows git ☑ easily store/manage large files ☑ allows \`jsonl\` append
> ☐ \`.db\` files?`);

		md(`## The hotkey is live — press it

\`/\` opens this site's search from anywhere, this page included.`);

		p(() => {
			span("Press ");
			kbd("/");
			span(" now, or ");
			kbd("Ctrl");
			span(" + ");
			kbd("K");
			span(" — the omnibox opens at the bottom of the screen, and Escape closes it.");
		});

		md(`It only fires when nothing editable has focus — inside a text field \`/\` has to type
a literal slash, because urls contain them. That one caveat is the whole reason the note
wrote a question mark after the idea rather than a full stop.`);

		md(`## What it points at

- [core/Search](/framework/core/Search/) — the search itself, and the omnibox the hotkey
  opens. The note asked for a \`/\` menu; this is it, on every page of the site.
- [core/List](/framework/core/List/) — the \`List\` / \`View.List\` / \`Sortable.List\` naming
  question, resolved by the house rule: **parts are static subclasses**, so
  \`Sortable.List\` extends \`List\` and inherits \`List.View\` with nothing to wire.
  \`Users\` versus \`UserGroup\` never needed a third name.
- [core/Item](/framework/core/Item/) — one record, with the \`.save()\` the "savable view"
  idea needs.
- [core/Layout](/framework/core/Layout/) — "create a tool where whatever layout you make,
  you can save & share", as far as it got: thirty named arrangements you browse, each proven
  at seven widths. Browsing and reusing landed; saving your own is still the open half.
- [ext/JSONL](/framework/ext/JSONL/) — the append-only line format the last paragraph
  argues for, and the reason the filesystem won that argument on this site.
- [ext/DesignTool](/framework/ext/DesignTool/) — the nearest answer to "how can we get AI to
  test UI things". **There is no test-tooling page on the site**: gestures are proved by the
  \`ui-test\` skill driving a headless browser and screenshotting after every step, which
  lives in the skill rather than on a page. The note's own instinct — *you just test insert,
  delete* — is what that skill does.`);
	}
});
