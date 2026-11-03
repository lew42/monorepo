import { Page, md, h2 } from "/app.js";
import specs from "./specs.js";
import entry from "../400/entry.js";

export default new Page({
	meta: import.meta,
	title: "Screens",
	description: "A seven-screen Figma set — four that already exist as real layouts, and the three that don't.",
	icon: "smartphone",
	group: "Reference",

	/* `entry` is `400/`'s, imported rather than copied — one spec → one twin card, wired
	   for a bare `/full/` url so a real viewport can measure it. Same seam wire/ and
	   anatomy/ use for the same reason (see doc/decisions.md). */
	children: specs.map(entry),

	initialize(){ this.catalog(); },

	content(){

		md("**Seven screens, node `181:1456`.** The survey table's names checked out here — "
			+ "`get_metadata` returned exactly `home`, `profile`, `settings`, `homepage`, "
			+ "`landing-page`, `about-page`, `contact-page`, all seven phone-width (402px) frames "
			+ "in one row. The owner's brief for this node: *\"feel free to use existing colors in "
			+ "place of the ones used. feel free (encouraged) to rewrite any text to express "
			+ "anything about our framework.\"* So every sentence below is a true one about this "
			+ "repo, not the fictional site the rest of this directory's `web.js` draws.");

		h2("Four of the seven already exist — linked, not rebuilt");

		md("The Figma's `home`/`profile`/`settings` are one small app; `homepage`, "
			+ "`landing-page`, `about-page` and `contact-page` are a separate marketing site, and "
			+ "that second set turns out to be four Figma frames wearing three layouts this "
			+ "directory already ships:");

		md("| Figma frame | shape | already built as |\n"
			+ "| --- | --- | --- |\n"
			+ "| `homepage` | hero, a card grid, one CTA band, footer | [landing](/framework/styles/layouts/landing/) |\n"
			+ "| `landing-page` | CTA header, a checklist, an email-capture band, footer | [landing](/framework/styles/layouts/landing/) |\n"
			+ "| `about-page` | hero, one reading column, a pull-quote, footer | [document](/framework/styles/layouts/document/) |\n"
			+ "| `contact-page` | header, a labelled form, footer | [stack](/framework/styles/layouts/stack/) |");

		md("Both `homepage` and `landing-page` land on the *same* existing layout — "
			+ "[landing](/framework/styles/layouts/landing/)'s `page full fill flex v` with a "
			+ "full-bleed hero, a card band and a closing CTA band, is both Figma frames at once, "
			+ "just with different words in the bands. [stack](/framework/styles/layouts/stack/) "
			+ "already ships the exact form `contact-page` draws — a labelled `Email` field, a "
			+ "labelled `Message` field, `Send` / `Cancel` — because it was built as a generic "
			+ "form demo and a contact form is a generic form. No new code for any of the four.");

		h2("Three that don't — the pieces on this page");

		md("`home`, `profile` and `settings` are a small phone-width app with no desktop twin "
			+ "anywhere in this node, and no existing layout in this directory is *that shape* — "
			+ "a header, a scrolling stack of cards, a fixed bottom tab bar. Built here as three "
			+ "twin-card specs, all three built entirely from words already in the vocabulary "
			+ "(`flex`, `split`, `v-center`, `surface`, `wash`, `grid gap auto`) plus one real "
			+ "component from `ui/` (`.ui-avatar`) and two native form controls "
			+ "(`<progress>`, `<input type=\"checkbox\">`) already themed by `framework.css`'s "
			+ "`accent-color`. Nothing here is a new class.");

		h2("The rewrite");

		md("The habit tracker's three habits (water, breathing, a walk) became three checklist "
			+ "rows that are actually true — *no build step*, *native ESM imports*, *layout is a "
			+ "class string* — checked, because they are. The stat cards are the same three "
			+ "numbers [ui/stats](/framework/ui/stats/) already ships (`build steps`, "
			+ "`core classes`, `tokens`), copied rather than re-typed so the two pages can't drift. "
			+ "The settings list's two counts (`28`, `19`) are this directory's own layout count "
			+ "and `ui/`'s own component count.");

		h2("Measured");

		md("Each of the three wires a bare `/full/` url — no stage, no `zoom` — so every screen "
			+ "was read in a real viewport at **400, 1280, 1440, 1920 and 3440**. "
			+ "[doc/decisions.md](./doc/decisions.md) has the numbers and the one dilemma logged.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
