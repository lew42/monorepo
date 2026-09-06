import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. The spread is a list of DECISIONS about how someone else starts a
   site with this framework — a starter repo, a global CLI, a mandatory import map — and
   none of them is a UI. The two small wireframes at the foot are the holy-grail layout,
   which /framework/core/Layout/ already draws live and better. */

export default new NotesNote({
	meta: import.meta,
	title: "Starter repo vs scaffolding?",
	icon: "rocket_launch",
	description: "How a stranger starts a site with this framework — and why every path is case-insensitive.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is about getting people to the site, and about names.**

> Direct People to Lew42.com?
> ① Subscribe & Link in Bio

Then a rule about URLs, underlined:

> **Email/Domain**, but path/? & FS?
>   ↓ CASE INSENSITIVE
> ☑ Doesn't matter
> ☑ You can't get it wrong
> ☑ You can't have \`Name && name\`
> ☑ \`toLowerCase();\`

Email addresses and domains are case-insensitive; paths and filenames are not. The note
picks the email answer for everything — lower-case it and be done.

Then four notes about the app shell:

> ✳ EVERY \`/public/\` topic = no bueno
>
> app → full? chrome? page?
>
> \`app.main();\` → Renders Holy Burger (?) layout
> \`app.main({ header: false });\`
>
> ✳ RENDER \`parent.nav()\` after each page
> \`app.nav()\` vs ~~pg.nav~~ \`page.nav()\`

("Holy Burger" is the holy-grail layout — header, three columns, footer.)

**The right page is the setup question**, and it is the biggest heading on the spread:

> server? servex?
>
> **Starter Repo vs Scaffolding?**
>   submodule?  /  git CDN? or local (via servex?)   ← optional?
>   sync → pub/frame ~ → safest? & forces
>   example nav?
>
> ? \`npm i -g lew42\` · \`lew42 init?\`
>
> \`public/package.json\` · \`node_modules/\` (?) · ✳ **Mandatory import map** ✳ ?
>
> 2. server/servex?
>
> \`app.theme("name")\`  (\`View.theme("name")\`?)
> ☑ Switches all theme-names off (remove-class)

At the foot, two small wireframes of the same page: a header bar over three columns, and
a header bar over a wide band with four small boxes under it.`);

		md(`## What it points at

- [core/App](/framework/core/App/) — \`app.main()\`, \`app.nav()\` and the shell the note is
  sketching. The app renders the chrome; a page renders itself into it.
- [App boot](/framework/core/App/doc/boot/) — what \`new App()\` does, in order, and why
  a module that touches \`app\` before that exists is a bug.
- [core/Layout](/framework/core/Layout/) — the "Holy Burger" wireframes, live. The
  holy-grail arrangement is one of the layouts the tree can build, at any width.
- [Themes](/framework/styles/layers/theme/) — the note's answer is the one that shipped:
  a theme is a **class**, and switching it removes the other theme classes. Seen working
  on [/imagine/design/themes/](/imagine/design/themes/).
- [The framework docs](/framework/) — the entry the "starter repo" would point a stranger
  at. The setup, branch and deploy steps themselves live in the repo's root
  \`readme.md\`, which is a file in the checkout, not a page on the site.
- [/web/](/web/) — the guide tier: how to build things on the web, shown live. This is
  what "example nav?" turned into.

Two of the note's options were settled by the repo's own constraints and are worth
naming: there is **no build step** (so no bundler, and \`public/\` runs as-is) and **no new
npm dependency** without asking. \`npm i -g lew42\` and a mandatory import map are both
still open questions, not decisions.`);

		md(`Nothing is built on this page. The case-insensitivity line uses the owner's own
first name twice as the example; it is written here as \`Name && name\`.
[The original photo](/notes/inbox/2026-09-06-040.jpg) — which only opens on a local
checkout (the inbox is not in the repo) — has it as it was written.`);
	}
});
