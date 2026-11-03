import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. The spread is about where files come from at load time — a dev
   strategy, not a screen. The one API question on it (`import` vs `link("/path")`) has
   a written verdict, which is the link. */

export default new NotesNote({
	meta: import.meta,
	title: "A localhost CDN",
	icon: "dns",
	description: "How the monorepo becomes a live site — and a local CDN that fetches versions from GitHub.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is a pile of options for shipping the framework.**

> Use GitHub CDN for sites?
>
> \`core/Page\` ⋯ Pagers? → Router
>
> Getting these devs to dev quickly & ~~greatly~~… → what goes where? Meh.
>
> Generate \`/framework/\` w/ node?
> ✳ Browse & Configure the whole framework…
>   ☑ Updates  ☑ Versions/Variants
>
> Using git? Submodules?
>
> \`SuperStr {}\` (?) → \`/framework/\`…
>
> \`monorepo.lew42.com\`? no need…
> \`lew42.com\` ← priority?
>
> [ \`v0.0.0 ▾\` ] → \`/v0/0/0/\` ?

and one API question, boxed off from the rest:

> Is \`import\` & \`pg.link()\` the best?
> If moved, import breaks, maybe easier to track?
> But, \`link("/path", "Label")\`?

**The right page is the honest version of the same problem** — not "which CDN", but
"what does a normal working day look like":

> How do we get from monorepo → lew42.com?
>
> Just clone? And \`/framework/\` updates… how?
>
> If monorepo gets content, like these dev pages, then pulling will dump that in…?
>
> Also, for any sites, if you don't have some sort of local dev strategy,
> commit-push-pull loops get out of hand, fast.
>
> And CDN doesn't really help?
>
> I mean, instead of \`public/node_modules/\` you could importmap → CDN (jsdelivr or
> lew42) · \`cdn.localhost\`? ← w/ all versions?
>
> ① Switch importmap line for "framework" → \`cdn@v\`? Or, default to latest…?

and then the idea the note is named for:

> How would you have a localhost cdn that automatically has fresh versions?
>   ↳ When requested, fetch from github?
>
> \`lew42.com\` → \`npm install servex\` · monorepo? ← not version-pegged (?)
>              & importmap to \`cdn.lew42.com\`? · jsdelivr?
>
> What about plugins, themes, etc? All \`framework/*\` ?`);

		md(`## What it points at

- [core/Router](/framework/core/Router/) — "core/Page ⋯ Pagers? → Router" is the tier
  question, and it is settled: the pager tier was removed. The router walks the pages a
  parent declares, and there is no third thing in between.
- [\`link()\`](/framework/core/Page/) — the answer to *"Is import &
  pg.link() the best?"*. A page links to another by asking the page, so a link is a real
  object rather than a typed string that can rot.
- [The registry gate, removed](/framework/core/Router/doc/registry-gate/) — the reason a
  URL does not have to be registered anywhere in advance: the router tries the walk and
  hands the URL to the browser if it fails.
- [/framework/ai/](/framework/ai/) — the "dev pages" the note worries will get dumped
  into a clone. They did, and they turned into this: one page per working day, showing
  what was built.
- [The framework docs](/framework/) — the entry point. The deploy story itself is in the
  repo's root \`readme.md\`, a file in the checkout rather than a page here.

Two of the repo's own constraints decide most of this spread, and are worth reading
beside it: there is **no build step** (\`public/\` runs as-is, imports are real \`.js\`
URLs) and **no server at runtime** (production is static; \`Server/\` is dev only). A
localhost CDN that fetches versions from GitHub would be a server at runtime for the dev
machine only — which is exactly what \`Server/\` already is.`);

		md(`Nothing is built on this page. It is a working-day problem, and the answer it
reaches — keep the framework editable locally, pin it for production — is a decision,
not a screen.`);
	}
});
