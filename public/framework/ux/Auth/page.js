import { Doc, md, demo, div } from "/app.js";
import { Auth } from "./Auth.js";
import { MagicAuth } from "./MagicAuth.js";

/* The template, verbatim — a solo card centres against a wash ground rather than
 * sitting bare on the page background. Auth supplies its own width (`.measure`);
 * this wrapper is the only decision that belongs to the CALLER, not the class. */
const card = () => div.c("wash pad", () => new Auth());

export default new Doc({
	meta: import.meta,
	title: "Auth",
	description: "Login, signup, reset and a social row as one class — view switching is the behavior that earns it.",
	icon: "lock",

	files: "Auth.js MagicAuth.js page.js",
	notes: "decisions",

	children: [
		demo.page("magic-auth", () => div.c("wash pad", () => new MagicAuth()), {
			note: "The named extension. `password_field()` returns nothing, `login_title()`/`login_cta()` change two strings, and the confirmation copy is one key. Nothing else in `Auth.js` moves — signup, reset, switching, validation and the social row are still Auth's.",
			file: new URL("MagicAuth.js", import.meta.url).pathname,
		}),
	],

	content(){

		// No `page:` — this Doc's own children mix the derived API/Docs/Files tabs
		// in with `magic-auth`, and demo.exhibit's Variants wall does not filter them.
		demo.exhibit({
			stage: steer => demo.stage(card, steer).ac("bleed"),
			def: card,
			file: new URL("Auth.js", import.meta.url).pathname,
			note: "**There is no `ui.auth()`** — the reason `ux/` exists at all. Three screens live in one instance because switching between them is exactly the state a template cannot hold: `Auth.view` and one `empty()` on submit or a link click. Try it — Create account, then submit empty; `:user-invalid` reddens the fields on its own, and `ui/alert` carries the word CSS can't say.",
		});

		md("## Words, for free");

		md("`ui-contrast` and `ui-compact` are section words, not an Auth option — the card never asks. Two instances, one wearing both.");

		// ⚠ No inline --gap on these wrappers: it INHERITS, and a tidy caption-to-card
		// gap here reaches straight into the Auth card's own `.gap` form below it —
		// the default panel would silently wear the compact panel's gap. doc/decisions.md.
		div.c("flex auto gap", () => {
			div.c("flex v gap", () => { div.c("h4 muted", "default"); new Auth(); });
			div.c("flex v gap", () => {
				div.c("h4 muted", "ui-contrast ui-compact");
				new Auth().ac("ui-contrast ui-compact");
			});
		}).ac("bleed").style("--column", "26em");

		md("Back to [ux/](/framework/ux/) — the tier this is the first exemplar of.");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad wash", () => new Auth())); },
});
