import { md, div, span, button } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose and the chip row keep the measure — three chips and one line of readout is a
   control, and a control row is the one thing the layout skill lets take `flex wrap`.
   Own layout: `.md` flow plus one `flex gap wrap` row. Two regions, no children.
   Preview: the photo thumb.

   Built: the note's `private / protected / public` triple. It is drawn as three arrows off
   one word, which is a three-state control, so it is one. */

const VISIBILITY = [
	["private",   "Only the owner. Nobody else can read it, and nothing renders it in a "
		+ "list that other people can see."],
	["protected", "The owner, plus whoever they name. This is the one that needs a real "
		+ "answer to “who are you” before it can exist at all."],
	["public",    "Anyone with the url, signed in or not — which means it is also the "
		+ "one a search engine and a scraper can read."],
];

function visibility_chips(){
	return div.c("surface pad flex v gap", () => {
		let $read;

		div.c("flex gap wrap").append(() => VISIBILITY.forEach(([name, line]) => {
			button(name).style({ padding: "0.35em 0.9em" })
				.on("click", () => $read.text(line));
		}));

		$read = span.c("muted").text(VISIBILITY[0][1]);
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Better standardized web services",
	icon: "cloud",
	description: "Static hosting as a spec, and 3D memory.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is a product, in three checkboxes.**

> **BETTER STANDARDIZED WEB SERVICES…**
>
> ☑ **Static Hosting "Spec" / UX** (& UI) = **Standardized Dashboard**
> ☑ **Streamlined Development** (git, branches, modules)
> ☑ **Additional Services** (D1, R2, DO, etc) modules — *R2, D2?*

The idea is that every static site needs the same handful of things — a place to put files,
a way to ship a branch, a database, a bucket — and that today each host invents its own
words for them. A *spec* would mean one dashboard you already know how to use.

Under it, a second product:

> **3D Memory** — AI → BG removal → 3D scene. **Scene builder + AI**

and a third:

> **R2 Modules?** ☑ Create via AI… ☑ Shareable ☑ Licensable? → would need **access ctrl**
> ☐ In-browser code editor

**The right page picks the same two threads up.**

> **3D × AI MEMORY** *(3D & scenes…)*
> Use humans to rank images (using emoji?) → **get it right, earn money?**

> **SIMPLE KV AUTH?**
> **OR NEON** ← Portable? ≠ SQLite
> ↓ for user profiles? → private → protected → public

Then the marketing plan, which is the most concrete thing on the spread:

> Make some walkthru videos:
> ☐ **How the framework works** → \`div.c\`, \`page.js\`
> ☐ **How to use it yourself…** → fork → run, edit locally → push to Cloudflare → live

> **5 minute intro** ☑ web os ☑ Mastermind → skills

and a small \`Workspace\` sketch at the foot. Written large across the bottom right corner,
in the owner's own voice: **"TOO HIGH TO LEAVE MY ROOM…"**`);

		md(`## The three visibilities

The note draws \`private → protected → public\` as three arrows off one word. It is a
three-state control, so here it is as one — pick a state and read what it costs.`);

		visibility_chips();

		md(`**\`protected\` is the expensive one.** \`private\` and \`public\` can both be decided
by the url alone; \`protected\` cannot be answered without knowing who is asking, which is
why the [identity decision](/imagine/platform/decisions/identity/) exists and why it lands
on one \`users\` row plus a signed cookie rather than a vendor.`);

		md(`## What it points at

- [Cloudflare research](/imagine/platform/research/cloudflare/) — the dug verdict on
  Workers, D1, R2, KV and Durable Objects, which is the "additional services" list on the
  left page, priced and rated.
- [The identity decision](/imagine/platform/decisions/identity/) — the answer to "SIMPLE KV
  AUTH? OR NEON": one \`users\` row and a stateless HMAC cookie, GitHub and Google, no
  vendor and no new dependency. \`private / protected / public\` becomes one
  \`can(user, action, url)\` the router calls.
- [The data decision](/imagine/platform/decisions/data/) — where state actually lives, and
  why R2 is for media rather than for anything you need to query.
- [/imagine/scenes/](/imagine/scenes/) — the 3D end of "AI → BG removal → 3D scene",
  as far as this site has taken it.
- [/framework/ai/](/framework/ai/) — the mastermind-to-skills line in the five-minute
  intro, running: one dashboard per working day, every task logged as it happens.
- [/web/](/web/) — the "how to use it yourself" walkthrough, written instead of filmed.`);
	}
});
