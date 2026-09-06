import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built — the left page is an API sketch that core
   already answered, and the right page is a to-do list. Said in one line at the end. */

export default new NotesNote({
	meta: import.meta,
	title: "I need to simplify my website",
	icon: "compress",
	description: "app.use(new Dev()), content is sections, and a homepage of four tiles.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is an API sketch** — how an app switches features on.

> \`app.use(new Dev())\` — *config/settings?*
>
> \`App.use({ Toolbar }, DevSocket, Dev?)\`
>
> \`flex, grid, panel, viewport(s)\`… etc — *mini app?*

Then the same idea as a string, and as an object:

> \`app.use("Dev Two Three")\`
> \`{ use: "Dev Two Three" }\`
> \`{ use: { Dev: {config}, Two…, Three } }\`

Three ways to say the same thing: a constructed instance, a space-separated string of
names, and an object that carries per-feature config. Under it, boxed and underlined:

> **CONTENT IS SECTIONS** ↓ *Longer?*

and at the foot, a resume loop: *Photo → Resume → PDF / Update Resume → Site*, then
*Apply w/ "contract" | "full"?*

**The right page opens with the sentence the note is named for.**

> I need to simplify my website.
>
> **Blog** → Socials · VS/ALL ES-Build? → caching → Cloudflare deployments, etc
>
> Publish framework to npm? · Create starter repo? · Create content?
>
> **Hire?** — email? contact?
>
> **STREAM WORKFLOW?** · **About?** — 3D Graphical Resume? Photo Resume? Video Resume?
>
> **DESIGN** → Embed Figma Designs? · **DEV** → fly, framework, 3D, npm?, d&d?

Then the homepage, drawn as four tiles in a row, the first two captioned: **FLY**,
**GAME**, 3, 4. And last: *Blog → Cloudflare? → Framework*.`);

		md(`## What it points at

- [core/App](/framework/core/App/) — \`app.use(…)\`, answered. \`App\` is composed, not
  subclassed: features are passed in, and the site's own \`app.js\` is the one place that
  says which.
- [/imagine/sections/](/imagine/sections/) — "CONTENT IS SECTIONS", built as a realm: a
  page is a stack of sections, and a section is the unit you copy.
- [/framework/](/framework/) — the framework's own front door, which is the "starter repo"
  question answered by showing rather than publishing: the site *is* the example.
- [/imagine/game/](/imagine/game/) — the **GAME** tile on the homepage, built.
- [/imagine/blogx/](/imagine/blogx/) — the **Blog**, built, including the Cloudflare
  deployment path the last line asks about.
- [/imagine/stream/](/imagine/stream/) — **STREAM WORKFLOW**, built.`);

		md(`Nothing is built on this page. The left page's \`use\` sketch is a **decision core
already made** — features are composed in, and the string form was not adopted — and the
right page is a to-do list, not an interface. Four of its lines are live pages, linked
above; the rest are still to-dos.`);
	}
});
