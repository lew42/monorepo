import { Doc, md, div, span, h3, button, ui } from "/app.js";

// The same ui/ template twice — the right one inside a section wearing both config
// words. It is here rather than only on /framework/ui/words/ because the claim this
// page makes is that a word re-skins whichever TIER it lands on, and a claim on this
// page should be visible from this page.
const box = () => div.c("surface pad flex v gap", () => {
	div.c("h4 muted", "Core");
	h3("View");
	span.c("muted", "A chainable DOM element.");
	div.c("flex gap", () => { button("Docs"); button.c("prim", "Open"); }).style("--gap", "0.3em");
});

export default new Doc({
	meta: import.meta,
	title: "UX",
	description: "The behavior tier — ui/ hands you markup, ux/ hands you a class you can extend.",
	icon: "layers",

	// ⚠ Required on a Doc that is also a nav section, or framework/page.js's sections()
	// spills Overview - Docs into the site nav as if they were pages (ui/page.js).
	leaf: true,

	children: "Auth Wizard Tree Course Filter Menu Pagination Tags",

	notes: "system decisions",

	content(){

		md("**`ui/` is markup. `ux/` is behavior.** A ux is a *workflow* — signup, login, a wizard, a course, a game lobby — assembled from `ui/` templates and responsive from a phone to 3440. It is a **class**, so the next case is a subclass rather than a fork.");

		md("**Eight classes live here now** — [Auth](/framework/ux/Auth/), [Wizard](/framework/ux/Wizard/), [Tree](/framework/ux/Tree/), [Course](/framework/ux/Course/), [Filter](/framework/ux/Filter/), [Menu](/framework/ux/Menu/), [Pagination](/framework/ux/Pagination/), [Tags](/framework/ux/Tags/) — built 2026-08-21 against the contract below.");

		ui.table(
			["", "ui/", "ux/"],
			[
				["is", "html + css templates", "classes"],
				["has", "no listener, no state, no lifecycle", "all three"],
				["you get", "markup, with a copy button", "an instance, and every method is a seam"],
				// ⚠ Plain text only: ui.table() puts a cell straight into a td — no markdown
				// pass — so a `backtick` or a **star** renders as itself.
				["a variant is", "a child page: a different THING, not a different value", "a named subclass: class CardHero extends Card"],
				["today", "20 components", "8"],
			]);

		md("## The graduation rule");

		md("**A template graduates when something has to be remembered between renders.** A click handler you write at the *call site* does not make a component behavioral — the caller owns that, and every `ui/` page shows it inline for exactly that reason. State, a listener the component installs, a lifecycle: those are a class.");

		md("The [2026-08-21 audit](/framework/ai/2026-08-21/ui-behaviors-audit/) scored **1 behavioral / 20**. `ui/tree` holds row state and selection in a closure — a class written in a shape nothing can subclass — and its own readme already names the next two asks (keyboard roving, drag-reorder) as extensions. That is the case for graduating it, and the case against graduating anything else.");

		md("**Splitting is the usual answer, not moving:** `tree`'s `.ui-tree-*` CSS stays in `ui/`; only the stateful half becomes a class.");

		md("## Config words bind both tiers");

		md("A **config word** is a class on a *section* that remaps framework tokens. Every `ui/` template and every `ux/` class reads those same tokens, so one word re-skins both — which is why **a ux never ships its own compact mode or high-contrast mode.**");

		div.c("flex wrap gap", () => {
			div.c("flex v gap", () => { div.c("h4 muted", "default"); box(); }).style("--gap", "0.5em");
			div.c("flex v gap", () => {
				div.c("h4 muted", "ui-contrast ui-compact");
				box().ac("ui-contrast ui-compact");   // on the component itself — a word needs no section
			}).style("--gap", "0.5em");
		});

		md("Both words, the toggles and what a word may **not** do: [`ui/words/`](/framework/ui/words/).");

		md("The long form is [`doc/system.md`](/framework/ux/doc/system/) — the tier boundary argued, the config-word contract, the naming rules. Every call made and rejected on 2026-08-21 is in [`doc/decisions.md`](/framework/ux/doc/decisions/).");

		md.details(import.meta, "readme.md", "Readme");
	},
});
