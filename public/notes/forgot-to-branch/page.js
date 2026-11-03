import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. One repo or three is a git decision; the deep-import rule is a fact
   about import maps. Neither is a screen, and the note's own sentence about rent is not
   something to draw a widget around. */

export default new NotesNote({
	meta: import.meta,
	title: "Forgot to branch (repair)",
	icon: "call_split",
	description: "One repo or three, how two sites consume one framework — and one line about why any of it matters.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page opens mid-repair.**

> FORGOT TO BRANCH (Repair)

with, in the corner: *Should be possible / Haven't been done / = Should be done? / Not
necessarily.* Then the question that repair raised:

> \`framework/\` · \`Server\` · (or) \`Servex\`? w/ \`public\`? why not?
>
> ✳ Are they coupled?
>
> If ΔB means ΔA (A depends on B), you might not want 2 repos (for dev mode)
> ☑ framework  ☑ Servex  ☑ Server
>
> It's not **all** absolutely coupled, and we're disregarding the benefits of multiple
> independent repos…

Then the practical version of the same question:

> The potential dev ~~pain~~ behind monorepo:
> ✳ multi-site (Server) usage?   \`framework.lew42/local\`?
>
> \`site-a/\` \`site-b/\` } how do these consume npm? \`npm link\`? ↓ maybe glitchy
> or \`package.json "file:../"\` ↓ similar outcome ☑ Must be switched back.
>
> Use static server to serve ~~test-site/pub/fw/~~ from monorepo.

**The right page starts somewhere else entirely**, and it is the line worth keeping:

> LIFE = ~~DO~~ **POTENTIAL** (for anyone who wants it, to work for it)
> ☑ It shouldn't be so hard to pay rent…?

Then back to import maps, and a real constraint:

> Site — html importmap: \`@lew42/core\` ↝ \`node-modules/@lew42/core/index.js\`
>
> importmaps can have/allow deep import
> ✳ \`@lew42/core\` → \`core/index.js\`
> && ☑ \`@lew42/core/\` → \`core/\`
>
> **npm pkgs cannot have "/"**
>
> \`ext\` → one pkg or many?
>
> git granularity ⟨ control / costlier
>   vs
> npm granularity ⟨ control / costly
> && both ⇒ most control & most cost`);

		md(`## What it points at

- [The framework docs](/framework/) — the answer that shipped is the cheapest of the
  three: **one repo, no packages**. \`core/\`, \`ext/\`, \`styles/\`, \`ui/\` and \`web/\` are
  directories imported by path, so "ext → one pkg or many?" never had to be answered.
  The branch, setup and deploy steps live in the repo's root \`readme.md\`, a file in the
  checkout rather than a page here.
- [core/View](/framework/core/View/) — why the coupling question stayed easy: a module is
  a plain class with no registration and no wiring, so moving one is a path change.
- [Git branch names](/notes/git-branch-names/) — the team note beside this one, on how
  branches are named in this repo. The "forgot to branch" repair is what that note is
  for.
- [/framework/ai/](/framework/ai/) — the multi-agent working day this repo actually has,
  which is why the tree is shared and why nobody stashes.
- [Levels and points](/notes/levels-and-points/) — the other half of *"it shouldn't be so
  hard to pay rent"*: the free tier and the paid one, as the owner drew them.
- [Payments](/imagine/platform/research/payments/) — the research behind that, with each
  claim carrying a credence rather than a verdict.

One fact on this page is worth carrying: **an npm package name cannot contain a slash**
past the scope, which is exactly why the deep-import trailing-slash form
(\`@lew42/core/\` → \`core/\`) exists in import maps at all.`);

		md(`Nothing is built on this page. The repo shape is a decision, the import-map
rule is a fact, and neither wants a widget.`);
	}
});
