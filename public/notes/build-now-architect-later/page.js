import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. The spread is a packaging decision — npm workspaces, a loader that
   writes an import map, a global CLI — and none of it is a screen. Its one hard
   technical fact (the script order) is a trap worth writing down, and it is written in
   the prose rather than demonstrated, because demonstrating it means shipping a page
   that is deliberately broken. */

export default new NotesNote({
	meta: import.meta,
	title: "Build now, architect later",
	icon: "construction",
	description: "npm workspaces, a loader that writes the import map — and the script-order trap underneath it.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page opens with a triangle** — three things that all talk to each other:

> **UI ⇄ AI ⇄ Server**

and then works through packaging:

> even if each ext is separate modules
>
> \`monorepo/\` will still work for devs, w/o any npm work?
>
> \`/site/\` will be subject to either build (bundle) or importmap
>
> If site npm installs \`@lew42/server\` && \`@lew42/core\` → we don't need to worry about
> managing subversions
>
> \`vite-site/\` · \`site/\` ← defaults to importmaps?
>
> \`npm install lew42/thing\` && importmap: ↳ ×2

Then the idea it likes best, starred:

> ✳ \`loader.js\` → fetch \`package.json\` → dynamic import map?
>   ↓ Could go right in \`index.html\`? — *Gold*

and immediately, the catch that makes or breaks it:

> ① first \`type="module"\` script must be req **AFTER** dynamic import map

**The right page is the repo, drawn as it would be if it went all-in on npm:**

> \`lew42/monorepo/\`
>   \`Server\`
>   \`Servex\`
>   \`public/framework/core\`  → \`@lew42/core\`
>                    \`/ext\`
>   \`public/package.json: workspaces\` → \`@lew42/thing\`

and then, underlined twice, the line the page is named for:

> **Build Now, Architect Later**

The rest is that principle applied:

> Use monorepo for new sites? → fork (or just clone), & have it all-in-one?
>
> OR — if the monorepo starts growing, how do we use it, w/o npm?
>
> Lean into npm: \`@lew42/core\` & \`@lew42/thing\`
>
> If servex becomes a global… \`npm i -g @lew42/servex\`, we can remove \`/server/\` codes
> which isn't a bad idea?
>
> framework could load from anywhere?
>   → local servex-based "cdn"? (\`framework.localhost\`?) importmaps?

A small personal checklist sits in the top corner of the page, too small to read.`);

		md(`## The script-order trap, which is real

The note's ① is correct and it is the reason the \`loader.js\` idea is harder than it
looks. An import map has to be **in the document before the first module script runs** —
once a module has started resolving, adding a map is too late for it. So a loader that
fetches \`package.json\` and writes the map has to do it before any \`type="module"\` script
is requested, which means the loader itself cannot be a module.

This repo sidesteps the whole thing: it has **no import map at all**. Imports are real
\`.js\` URLs, resolved against \`import.meta\`, and \`public/\` runs as-is.`);

		md(`## What it points at

- [The framework docs](/framework/) — what actually shipped instead of the workspaces
  tree: one \`public/framework/\` with \`core/\`, \`ext/\`, \`styles/\`, \`ui/\` and \`web/\`,
  imported by path. No packages, no map, no build.
- [App boot](/framework/core/App/doc/boot/) — the order that matters at load time, written
  down: \`framework.css\` first so the layer order is fixed, then the site sheet, then the
  App.
- [core/View](/framework/core/View/) — "even if each ext is separate modules" — the thing
  that makes that survivable is that every module is a plain class with no wiring, so
  moving one is a path change.
- [/framework/ai/](/framework/ai/) — the *AI* corner of the note's triangle, built: the
  board that watches the work happen, one page per working day.
- [/framework/ext/](/framework/ext/) — the *thing* packages, as they exist: Panel, Doc,
  demo, tabs, markdown, Research, Draggable and the rest, each a directory rather than a
  package.

*Build now, architect later* is the note's own verdict, and the repo took it: the laws
in \`CLAUDE.md\` say "fastest working version first, then improve", and adding an npm
dependency is a thing you have to ask about.`);

		md(`Nothing is built on this page. Its one demonstrable claim — the script-order
trap — can only be demonstrated by shipping a broken page, so it is written above
instead.`);
	}
});
