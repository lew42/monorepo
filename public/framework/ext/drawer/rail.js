import { View, div, span, button } from "/framework/core/View/View.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";
import tabs from "./tabs.js";

View.stylesheet(import.meta, "rail.css");

/* THE MOBILE BOTTOM RAIL — below 52em only, the drawer's other way in (mobile-nav,
   2026-09-29). Two controls: ✦ opens a small listening sheet (below), ⋯ opens the
   same right-side drawer every page already has (menu.js's own button, reachable
   here because that fixed corner button now steps aside for the page's own ☰ on a
   page with a sidebar — drawer.css, `.app:has(.sidebar) .drawer-menu`).

   ⚠ `⋯ "More"`, not a second `☰ "Menu"` (the task mastermind, 2026-09-29): the
   page's own ☰ is now the thing at the top of the screen on mobile (deliverable
   1), so a SECOND ☰ down here read as "do this again" rather than "here's
   something else." `menu_icon`/`menu_label`/`menu_title` are prototype fields,
   not hard-coded in `menu_button()`, so the ☰/"Menu" look is not deleted — it
   is `DrawerRail.V1` below, one subclass away.

   ⚠ A NORMAL flex child of `.app`, never `position: fixed` — `.app` is a
   `height: 100%; flex-direction: column` box with `.pages` as its one growing
   child (framework.css), so this bar sitting last in that column already takes
   its own row and `.pages` shrinks to fit above it, with NO separate "reserve
   this much space" token to keep in sync (the mistake the side drawer's own
   `--rail-push` exists to fix, because THAT rail is `position: fixed` and has to
   restate the reservation by hand). See rail.css's own note and doc/decisions.md
   for the alternative this ruled out (full-height, independently-scrolling
   sections) and why.

   Built as a class so a later variant can subclass one method — `Sheet.card()`
   decides what a finished utterance becomes; a variant only has to override that
   one. css: .drawer-rail, .drawer-rail-ai, .drawer-rail-menu, .drawer-rail-sheet
   (rail.css). Record: readme.md, doc/decisions.md. */
export class DrawerRail extends View {

	// ⚠ No `.flex` utility class here — `@layer util` beats `@layer theme`
	// regardless of specificity, so a `.flex { display: flex }` utility would
	// have permanently out-ranked this component's own `.drawer-rail { display:
	// none }` above 52em (measured: the bar showed at 1920 too, css skill's own
	// warning about this exact trap). The component owns its display; rail.css
	// says `flex` only inside the media query that is allowed to say so.
	render(){
		this.ai_button();
		this.menu_button();
	}

	// ✦ — opens the listening sheet. Built lazily (below), on the FIRST tap: a
	// page nobody taps this on never constructs a Dictate, never checks whether
	// an engine is reachable (code skill's own rule for the drawer's tabs, same
	// reasoning here — this bar is on every page below 52em, so "every page pays
	// for it" would be the wrong default).
	ai_button(){
		return button.c("drawer-rail-ai").attr("type", "button")
			.attr("aria-label", "Ask, by voice — opens a listening sheet")
			.append(() => {
				span.c("drawer-rail-ai-icon", "✦");
				span.c("drawer-rail-ai-label", "AI");
			})
			.click(() => this.open_sheet());
	}

	// The drawer's own tabs (AI, Sessions, Dictation, Settings, Admin), the exact
	// button menu.js already draws; this is just another way to reach it. The
	// icon/label/title are prototype fields (below), not written here, so a
	// variant (`DrawerRail.V1`) can restore the old ☰ "Menu" look by overriding
	// three values instead of this whole method.
	menu_button(){
		return button.c("drawer-rail-menu").attr("type", "button")
			.attr("title", this.menu_title).attr("aria-label", this.menu_title)
			.append(() => {
				span.c("drawer-rail-menu-icon", this.menu_icon);
				span.c("drawer-rail-menu-label", this.menu_label);
			})
			.click(() => tabs.toggle());
	}

	// The sheet is built once, the first time it is opened, and kept — closing it
	// only hides it (`rc("on")`), so the second tap does not re-detect the engine
	// or lose the transcript so far. `this.constructor.Sheet` (not `DrawerRail.Sheet`
	// directly), so a subclass that swaps in its own Sheet is honoured.
	open_sheet(){
		if (!this.$sheet) this.append(() => { this.$sheet = new this.constructor.Sheet({ rail: this }); });
		this.$sheet.open();
		return this.$sheet;
	}
}

/** THE SHEET — a small panel that slides up from the bottom, starts listening the
 *  moment it opens (`mode: "open"`, ux/Dictate's own live-open-mic mode: the mic
 *  stays on, nothing is ever written into a box, every finished sentence reaches
 *  `on_text` instead), and turns each one into its own little card.
 *
 *  Dictate is used only through its public API — `new Dictate({...})` — never
 *  its internals; this module owns none of the microphone, the engine choice or
 *  the error wording (ux/Dictate/readme.md is the one place for that).
 *
 *  THE SEAM: override `card(text)` for a variant that wants a different shape
 *  for a finished utterance (a checkbox item, a chip, a row with a delete
 *  button) — everything else here (opening, closing, wiring the mic, showing
 *  an error) stays the same. */
export class DrawerRailSheet extends View {

	// ⚠ No error UI of its own — `ux/Dictate` already shows an honest, specific
	// message beside its own mic button the moment something goes wrong (no
	// device, no permission, no engine reachable), and a second banner saying
	// the same thing here read as a duplicate, not a help (measured 2026-09-29:
	// the exact same sentence painted twice a few lines apart). Mic feedback
	// itself — the sound only once the mic is truly on, the wording of each
	// message — is `ux/Dictate`'s own job, not this sheet's.
	render(){
		this.head();
		this.$mic = div.c("drawer-rail-sheet-mic");
		this.$empty = div.c("drawer-rail-sheet-empty muted", "Say something — it shows up here as its own card.");
		this.$cards = div.c("drawer-rail-sheet-cards flex v");
	}

	head(){
		return div.c("drawer-rail-sheet-head flex v-center split", () => {
			span.c("drawer-rail-sheet-title", "Ask, by voice");
			button.c("drawer-x", "✕").attr("type", "button").attr("title", "Close").click(() => this.close());
		});
	}

	// First open: build the Dictate widget INSIDE this sheet (`code` skill §1 —
	// captured now, in a real callback, never as a bare statement left to
	// whatever captor happens to be current at click time) and start it right
	// away. A later open just restarts listening on the widget already here.
	open(){
		this.ac("on");
		this.dictate ? this.dictate.start() : this.listen();
		return this;
	}

	close(){
		this.dictate?.stop();
		this.rc("on");
		return this;
	}

	listen(){
		this.$mic.append(() => {
			this.dictate = new Dictate({ mode: "open", on_text: text => this.card(text) });
		});
		this.dictate.start();
	}

	// THE ONE METHOD a variant overrides. Default: one small "prompt item" card
	// per finished utterance, newest at the bottom, the list growing as the
	// owner keeps talking (the owner's own words, 2026-09-29: "little prompt
	// cards"). Never wipes `$cards` — each call only adds one.
	card(text){
		this.$empty.hide();
		this.$cards.append(() => { div.c("drawer-rail-sheet-card").text(text); });
	}
}

DrawerRail.Sheet = DrawerRailSheet;

// ⚠ On the prototype, not written inside `menu_button()` — `code` skill §2's own
// rule ("defaults on the prototype"), and what lets `DrawerRail.V1` below change
// the look by overriding three values instead of copying the whole method.
DrawerRail.prototype.menu_icon = "⋯";
DrawerRail.prototype.menu_label = "More";
DrawerRail.prototype.menu_title = "AI sessions, dictation, settings, admin";

/* v1 — the ☰ "Menu" button this replaced (the task mastermind, 2026-09-29: a
   second ☰ down here, once the page's own ☰ moved to the top for deliverable 1,
   read as "the same button twice"). Not deleted — `new DrawerRail.V1({ app })`
   in place of `rail(app)`'s `new DrawerRail({ app })` brings it back verbatim. */
export class DrawerRailV1 extends DrawerRail {}
DrawerRailV1.prototype.menu_icon = "☰";
DrawerRailV1.prototype.menu_label = "Menu";
DrawerRailV1.prototype.menu_title = "Menu — AI, sessions, dictation, settings";
DrawerRail.V1 = DrawerRailV1;

// One rail per document, built the first time a page asks for it — same shape as
// drawer.js's own singleton. Called from menu.js, so app.js needs no change: the
// site already calls `menu(app)` once, and that is this module's only caller.
let $rail;
export default function rail(app){
	return $rail ??= new DrawerRail({ app });
}

export { rail };
