import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. The spread is a hosting decision — where a site's copy of the
   framework comes from — and a decision has no UI. Its last block IS buildable, but
   only as links: it is a list of six objectives, and five of them are pages already. */

export default new NotesNote({
	meta: import.meta,
	title: "jsDelivr, or your own CDN?",
	icon: "cloud_download",
	description: "Where a site's copy of the framework comes from — and the six objectives that outrank the question.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page draws the import map three ways.** One name — \`framework\` — pointing at
one of three places:

> ☑ monorepo → lew42.com… \`jsdelivr/gh/lew42/monorepo/public/framework/\` @vM.M.P
> ~~framework.localhost/frame~~ → \`monorepo.localhost/public/framework/\`

Then the trade, in the owner's own words:

> Locally, instant updates. For prod, updating the specific server is a pita…
>
> But honestly, the pinned version should mostly work? ☑ stable ☑ no need to edit…?
>
> It would be for building separate test sites using the framework @ latest (live).
> → ~~However~~, just put all things in monorepo?
>
> Monorepo can get messy, have way too many messy things?
>
> & just load framework @ vX.Y.Z from jsdelivr?
>
> if \`npx servex\` & jsdelivr framework… or, bundler
>
> ⇒ **site-repo = \`public/index.html\` · \`app.js\` · \`page.js\`**

That last line is the whole point of the left page: a site should be three files.

**The right page argues with itself and then changes the subject.**

> The thing is: using jsdelivr means you don't have access to framework files.
>
> Right now, that could backfire, it has been nice to be able to update framework
> anywhere.
>
> Yet, most framework work should happen in monorepo, and then bump site CDN (version)…
>
> ☑ Relies on jsdelivr, maybe not the best
> ☑ Allows pinning version, no breakage?
>
> ✳ Bumping version ⇒ probably breaks things? → test after bump
>
> Can servex handle all the things?
>
> Use jsdelivr? For prod? Maybe not?
> → But, I'd need to basically have my own cdn?
> ⚠ Multiple versions = tricky for View capturing

and then, having gone round the loop once, drops it:

> Aside from hosting/versions, what are the main objectives:
> ☑ Document View & App usage
> ☑ Setup the lew42/site starter?
> ☑ testing
> ☑ ui/ux
> ☑ page, pager
> ☑ router`);

		md(`## What it points at

The last block is the useful one, so take it in order. Five of the six are built.

- [core/View](/framework/core/View/) — *Document View usage*, done. The factories, the
  capture rule, and the lifecycle.
- [core/App](/framework/core/App/) — *Document App usage*, done: what \`new App()\` does,
  in what order, and what exists when.
- [core/Page](/framework/core/Page/) — *page, pager*, done. A page is dormant until
  placed; the "pager" tier turned out to be the parent page itself.
- [core/Router](/framework/core/Router/) — *router*, done: the walk, and why there is no
  registry.
- [/web/](/web/) and [/imagine/](/imagine/) — *ui/ux*, done, as a guide tier and a lab.
- **testing** is the one still open. There is headless Playwright work in this repo, but
  it lives in tooling rather than on a page.
- [The framework docs](/framework/) — the entry the *lew42/site starter* would point at.
  The setup steps themselves live in the repo's root \`readme.md\`, a file in the
  checkout, not a page here.

The hosting question is still open, and the repo's own constraint frames it: **no build
step** — \`public/\` runs as-is and imports are real \`.js\` URLs — so a bundler is not on
the table, and the choice really is between an import map and a plain relative path.`);

		md(`Nothing is built on this page. The note's own conclusion is the right one to
keep: the hosting argument goes round in a circle, and the six objectives under it do
not.`);
	}
});
