import { Page, View, md, div, p, h3, button, icon, ui } from "/app.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { edit } from "/framework/ext/Ask/edit.js";

View.stylesheet(import.meta, "ux.css");

// The same ui/ template twice — the right one inside a section wearing both config
// words. It is here rather than only on /framework/ui/words/ because the claim this
// page makes is that a word re-skins whichever TIER it lands on, and a claim on this
// page should be visible from this page.
// ⚠ `.card`, never `"surface pad"` — a FRAMED box reads `--pad-card`, which scales
// with ITSELF; `.pad` is the page-region token, and it is why this exact card once
// measured "massive" padding by default and "not nearly enough" under `ui-compact`
// (which overwrites `--pad`, not `--pad-card`) — the owner, 2026-09-22.
// `.card`'s children already get `--gap` rhythm for free (framework.css), so the
// only class this needs is `.card` itself.
const box = () => div.c("card", () => {
	div.c("h4 muted", "Core");
	h3("View");
	p.c("muted", "A chainable DOM element.");
	div.c("flex gap-35", () => { button("Docs"); button.c("prim", "Open"); });
});

// One small flag, invisible until the card is hovered or focused — the "reject" half
// of an approve-or-reject process with no approve button anywhere (the owner,
// 2026-09-22: "I should be able to hover these and just click reject"). Pressing it
// asks one line, then writes through the SAME rpc the AI board's own cards use
// (Server/plugins/CardAnswer.js's `card_say`, `say: "improve"`) — so a flagged
// module reaches the mastermind's inbox exactly like a flagged board card does.
// `edit()` is the one switch every write control on the site already reads: off (or
// off localhost, where there is no server to write to), the flag draws nothing.
function flaggable(card, id, label){
	if (!edit()) return card;

	return card.append(() => {
		button.c("ux-index-flag").attr("type", "button").attr("title", `Flag ${label}`)
			.append(() => icon("flag"))
			.click(e => {
				e.preventDefault();
				e.stopPropagation();

				const note = window.prompt(`What's wrong with ${label}?`);
				if (!note) return;

				Socket.singleton().request({ method: "card_say", args: [{ id, say: "improve", note }] })
					.then(() => card.ac("ux-index-flagged"));
			});
	});
}

// My own wall, not core's `previews()` — the one thing a generic wall can't hand
// back is the card itself, and a flag needs to land ON it. Each module still draws
// its OWN card (`page.preview(nav)`, the exact call `previews()` makes); this only
// appends one button after it.
function wall(page){
	return div.c("page-previews bleed", () => {
		[...page.children].forEach(([name, child]) => {
			const nav = page.nav_for(name);
			const card = child ? child.preview(nav) : page.preview_card(nav);
			flaggable(card, `ux/${name}`, nav.label);
		});
	});
}

export default new Page({
	meta: import.meta,
	title: "UX",
	description: "The behavior tier — ui/ hands you markup, ux/ hands you a class you can extend.",
	icon: "layers",

	children: "Auth Wizard Tree Course Filter Menu Pagination Tags Dictate Popover Content",

	// The two long-form docs — `doc/system.md`, `doc/decisions.md` — are NOT declared
	// children: a declared child is a CARD in the wall below, and a doc page is not a
	// module. `route()` answers just these two names on demand instead, the same
	// lever `ext/Doc`'s own member pages use for an address nobody declared — so
	// `/framework/ux/doc/system/` still resolves (every module readme links it)
	// without "doc" ever sitting in the wall or the sidebar tree.
	route(name){
		return name === "doc" && {
			title: `${this.title} Docs`,
			content(){ return md("Two long-form pages: [System](system/) — the tier boundary argued, the config-word contract, the naming rules. [Decisions](decisions/) — every call made and rejected on 2026-08-21."); },
		};
	},

	content(){

		md("**`ui/` is markup. `ux/` is behavior.** A ux is a *workflow* — signup, login, a wizard, a course, a game lobby — assembled from `ui/` templates and responsive from a phone to 3440. It is a **class**, so the next case is a subclass rather than a fork.");

		// The page's one live thing, and it opens the page: the SAME template twice,
		// the right one wearing both config words. The argument for it is below.
		div.c("flex wrap gap", () => {
			div.c("flex v gap-50", () => { div.c("h4 muted", "default"); box(); });
			div.c("flex v gap-50", () => {
				div.c("h4 muted", "ui-contrast ui-compact");
				box().ac("ui-contrast ui-compact");   // on the component itself — a word needs no section
			});
		});

		md("**Eleven classes live here — one real page each, not a tab.** Hover a card to flag it.");

		wall(this);

		ui.table(
			["", "ui/", "ux/"],
			[
				["is", "html + css templates", "classes"],
				["has", "no listener, no state, no lifecycle", "all three"],
				["you get", "markup, with a copy button", "an instance, and every method is a seam"],
				// ⚠ Plain text only: ui.table() puts a cell straight into a td — no markdown
				// pass — so a `backtick` or a **star** renders as itself.
				["a variant is", "a child page: a different THING, not a different value", "a named subclass: class CardHero extends Card"],
				["today", "20 components", "11"],
			]);

		md("## The graduation rule");

		md("**A template graduates when something has to be remembered between renders.** A click handler you write at the *call site* does not make a component behavioral — the caller owns that, and every `ui/` page shows it inline for exactly that reason. State, a listener the component installs, a lifecycle: those are a class.");

		md("The [2026-08-21 audit](/framework/ai/2026-08-21/ui-behaviors-audit/) scored **1 behavioral / 20**. `ui/tree` holds row state and selection in a closure — a class written in a shape nothing can subclass — and its own readme already names the next two asks (keyboard roving, drag-reorder) as extensions. That is the case for graduating it, and the case against graduating anything else.");

		md("**Splitting is the usual answer, not moving:** `tree`'s `.ui-tree-*` CSS stays in `ui/`; only the stateful half becomes a class.");

		md("## Config words bind both tiers");

		md("A **config word** is a class on a *section* that remaps framework tokens. Every `ui/` template and every `ux/` class reads those same tokens, so one word re-skins both — which is why **a ux never ships its own compact mode or high-contrast mode.** That is the pair at the top of this page: one template, one class appended, no CSS of its own.");

		md("Both words, the toggles and what a word may **not** do: [`ui/words/`](/framework/ui/words/).");

		md("The long form is [`doc/system.md`](/framework/ux/doc/system/) — the tier boundary argued, the config-word contract, the naming rules. Every call made and rejected on 2026-08-21 is in [`doc/decisions.md`](/framework/ux/doc/decisions/).");

		md.details(import.meta, "readme.md", "Readme");
	},
});
