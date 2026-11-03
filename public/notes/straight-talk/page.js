import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. The left page is product names and an org-vs-fork sketch; the right
   page is the framework's three-step boot, which core/App documents properly and this
   page links. A note that re-drew the boot sequence would be a worse copy of that doc. */

export default new NotesNote({
	meta: import.meta,
	title: "Straight talk",
	icon: "campaign",
	description: "Memes to money to skills — and, on the facing page, the whole framework in three steps.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is the business, sketched fast.** Across the top: **STRAIGHT TALK ·
LEW42 · memes?**, with **GAME THEORY** and **WEB of LIES** written over it, and *C&C on?*
underneath. Then the chain the whole platform idea rests on:

> Memes → \\$ → Levels → Skills → Outcomes (#\\$\\$) → Experiences

Then product names, each with a sketch:

> Wiglew Igloo? — Wigloo (a jagged (?)-themed badass font)
>   ↓ W   ↓ L
>
> **the L. Cube** — [a Rubik's-cube sketch]
>
> **DRAW ANYTHING (QUICKLY)** — [two box/cube sketches]
>
> **Failure to Launch** → TEXT + 3D Scenes / Memory

Then the repo question again, with a decision attached:

> Merge framework, server, framework-site into one, generic site repo… skip subs?
>
> [fork ⇄ upstream, with Local under it]
>
> ✳ **Use Org w/ Perms** → **1 repo, all devs**
>
> vs
>
> Org ——→ Fork,  ↕ Local, w/ dev branch deploys

**The right page is the framework itself, in three steps** — the clearest statement of
it anywhere in the notebook:

> **Framework**
>
> ① \`import { el, div, p } from View.js\` — \`div("hello world");\` ← \`new View\`
>
> ① \`index.html\`
> ② ↳ \`/app.js\` ↳ uses \`window.location.pathname\` to load the proper \`/path/page.js\`
> ③ App awaits the import of \`page.js\` before injecting
>   (you can \`app.inject()\` in \`page.js\` to get synchronous rendering…)
>
> ☑ **Static Compat** — Host anywhere
> ☑ **No bundler/build** — pure static

and then the cost of putting everything in one place:

> \`lew42/framework\`
>
> Now, all the code is in one place.
> However, if you fork it, you can't easily push or pull updates independently… → **BAD**
>
> framework → CDN? Offline (?)`);

		md(`## What it points at

The right page is a specification, and every line of it shipped.

- [core/View](/framework/core/View/) — \`import { div } from …\`; \`div("hello world")\` is
  a \`new View\`. Exactly step ①, and it is still the first thing you learn here.
- [App boot](/framework/core/App/doc/boot/) — steps ② and ③, written down: what
  \`index.html\` loads, in what order, and what exists when.
- [\`inject()\`](/framework/core/App/doc/boot/) — the note's own escape hatch,
  built under that name.
- [core/Router](/framework/core/Router/) — "uses \`window.location.pathname\` to load the
  proper \`/path/page.js\`", grown into the walk: one segment, one \`page.js\`, imported on
  the way down.
- [The framework docs](/framework/) — *static compat, no bundler* are not aspirations
  here, they are constraints: \`public/\` runs as-is, imports are real \`.js\` URLs, and
  production is static.
- [Levels and points](/notes/levels-and-points/) — the *Memes → \\$ → Levels → Skills*
  chain, as its own note.
- [Each meme is a community](/notes/each-meme-is-a-community/) — where that chain starts.
- [/imagine/platform/](/imagine/platform/) — the whole business idea as a research
  program: nine topics, each claim carrying a credence.

The fork worry at the foot of the page is still live and still unanswered — one repo is
cheap right now and expensive the moment someone else wants to extend it without
forking.`);

		md(`Nothing is built on this page. One product on it is named with the owner's
surname; it is written here as **the L. Cube**.
[The original photo](/notes/inbox/2026-09-06-052.jpg) — which only opens on a local
checkout (the inbox is not in the repo) — has it as it was written.`);
	}
});
