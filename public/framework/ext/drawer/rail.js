import { View, div, span, button } from "/framework/core/View/View.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";
import { ChatPanel } from "/framework/ext/Chat/ChatPanel.js";
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
	// `compact` (a prototype field, below) is what tells rail.css whether to draw
	// small icon-only buttons with ✦ on the thumb (right) side — the default now
	// — or the original full look (icon + text label, ✦ on the left):
	// `DrawerRail.V2` sets `compact = false` to bring that original look back
	// verbatim, one class away, never deleted (the owner tested the ✦ sheet on a
	// phone and found no reply ever came; while fixing that, the rail itself grew
	// a second, shorter design — mobile-nav, 2026-09-29).
	render(){
		this.ac(this.compact === false ? "drawer-rail-full" : "drawer-rail-compact");
		this.ai_button();
		this.menu_button();
		this.watch_breakpoint();
	}

	// Bound ONCE, here, never per-open: rail.css's own media query (`(max-width:
	// 52em)`) is the only thing that shows the sheet, so if the window widens past
	// it — or a phone rotates — while the sheet is open, the sheet becomes
	// unreachable but the mic was still listening into it (found 2026-09-29: no
	// way back to a mic left running behind a sheet nobody can see). `close()`
	// already stops the mic, so reusing it here is the whole fix.
	watch_breakpoint(){
		const mq = globalThis.matchMedia?.("(max-width: 52em)");
		mq?.addEventListener?.("change", e => { if (!e.matches) this.$sheet?.close(); });
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
 *  `on_text` instead).
 *
 *  ONE AI, NOT TWO (one-ai, 2026-09-29; `ai2/doc/one-ai.md` has the full finding).
 *  On a CARD PAGE (`/framework/ai2/…`), this sheet now talks into that card's own
 *  session — the exact route the card's own (now-removed) composer used
 *  (`ext/drawer/tabs/ai.js`'s `send({card, text})`, called here, never edited) —
 *  and shows that card's own persisted thread (`ai2/chat.js`, reused, reading the
 *  card's `chat_entries()`), so a sentence said here is the SAME conversation the
 *  card's Overview and the desktop drawer's AI tab show, not a second one.
 *  On any OTHER page, each finished sentence becomes its own small "prompt item"
 *  card, local to this sheet only.
 *
 *  ⚠ NO RESPONSES (the owner tested the phone, 2026-09-29): saying something into
 *  this sheet on a PLAIN page used to only draw the local card — it never sent
 *  the sentence anywhere, so nothing could ever answer. `card(text)` below now
 *  sends every finished sentence through `ext/drawer/tabs/ai.js`'s own `send()` —
 *  the exact route the desktop drawer's AI tab uses (page-ai, then the `/ask/turn`
 *  bridge) — and shows the reply under that sentence's own card. On a card page,
 *  the sentence is echoed into the thread AT ONCE (posting can take a moment, and
 *  a phone has no live socket to redraw the thread on its own) and `talk.sync()`
 *  runs again once the send resolves, the same order `tabs/ai.js`'s own card
 *  composer uses. A send that fails still leaves the "not sent — <note>" mark
 *  (review #3, 2026-09-29) rather than the sentence just vanishing.
 *
 *  Dictate is used only through its public API — `new Dictate({...})` — never
 *  its internals; this module owns none of the microphone, the engine choice or
 *  the error wording (ux/Dictate/readme.md is the one place for that).
 *
 *  THE SEAM: override `card(text)` for a variant that wants a different shape
 *  for a finished utterance on a PLAIN page (a checkbox item, a chip, a row with
 *  a delete button) — everything else here (opening, closing, wiring the mic,
 *  showing an error, the card-page merge above) stays the same.
 *
 *  Kept reachable as `DrawerRail.SheetV1` — this is the whole sheet exactly as it
 *  shipped earlier today, before the reply fix and the links footer. The default,
 *  `DrawerRail.Sheet` (below), is this class plus one more thing: a row of links
 *  to the full drawer (Sessions, Dictation, Settings, "Open full AI"), because a
 *  phone still needs a way to reach what this small sheet doesn't show. */
export class DrawerRailSheetV1 extends View {

	// ⚠ No error UI of its own — `ux/Dictate` already shows an honest, specific
	// message beside its own mic button the moment something goes wrong (no
	// device, no permission, no engine reachable), and a second banner saying
	// the same thing here read as a duplicate, not a help (measured 2026-09-29:
	// the exact same sentence painted twice a few lines apart). Mic feedback
	// itself — the sound only once the mic is truly on, the wording of each
	// message — is `ux/Dictate`'s own job, not this sheet's.
	render(){
		this.head();
		// Filled by `sync_card()` below, on every open: either the card's own real
		// chat thread, or the old empty-state + growing list of local prompt cards.
		this.$thread = div.c("drawer-rail-sheet-thread");
		this.$mic = div.c("drawer-rail-sheet-mic");
	}

	head(){
		return div.c("drawer-rail-sheet-head flex v-center split", () => {
			span.c("drawer-rail-sheet-title", "Ask, by voice");
			button.c("drawer-x", "✕").attr("type", "button").attr("title", "Close").click(() => this.close());
		});
	}

	// The card the page under this sheet belongs to, or null — the exact duck
	// type `ext/drawer/tabs.js`'s own `context()` uses ("is the active page AI
	// 2's card.js"), read fresh on every open since this sheet is built once but
	// the page underneath it changes as the reader navigates.
	active_card(){
		const active = this.rail?.app?.router?.active;
		return active?.shell?.ai2 && active.id && typeof active.subs === "function" ? active : null;
	}

	// First open: build the Dictate widget INSIDE this sheet (`code` skill §1 —
	// captured now, in a real callback, never as a bare statement left to
	// whatever captor happens to be current at click time) and start it right
	// away. A later open just restarts listening on the widget already here.
	open(){
		this.ac("on");
		this.sync_card();
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
			// `revise: "edit"` — a light tidy pass (ux/Revise), tried alongside the raw
			// sentence, never instead of it: `on_text` (raw, instant) still makes the
			// card it always did; `on_revised` (a second or two later, only if Servex
			// answers) adds ONE MORE card with the tightened version. Two cards, not a
			// rewrite of `card()` itself — `ux/Revise/readme.md`'s "Wired into the real
			// dictate path" has the full picture; deliverable 3, ai/2026-09-29/audio/.
			this.dictate = new Dictate({
				mode: "open", revise: "edit",
				on_text: text => this.card(text),
				on_revised: text => this.card(text),
			});
		});
		this.dictate.start();
	}

	// Which thread `$thread` shows right now — rebuilt only when the card actually
	// changed (a fresh open on the same card just re-syncs the existing thread).
	// `ai2/chat.js` is imported lazily, HERE, not at the top of this module: this
	// sheet sits on every page below 52em (rail.js is loaded on all of them), and
	// most opens are on a page that is not a card at all — loading AI 2's own chat
	// module for those would be dead weight paid on every phone.
	sync_card(){
		const card = this.active_card();
		const id = card?.id ?? null;
		if (id === this.card_id){ this.talk?.sync(); return; }
		this.card_id = id;
		this.card_ref = card;
		if (!card){
			this.talk = null;
			this.$thread.empty(() => {
				this.$empty = div.c("drawer-rail-sheet-empty muted", "Say something — it shows up here as its own card.");
				this.$cards = div.c("drawer-rail-sheet-cards flex v");
			});
			return;
		}
		const token = this.sync_token = (this.sync_token ?? 0) + 1;
		import("/framework/ai2/chat.js").then(m => {
			if (this.sync_token !== token) return;   // moved to a different card (or a plain page) while this loaded
			this.$thread.empty(() => {
				this.talk = m.default({ source: () => card.chat_entries(), re: () => card.id });
			});
			// ⚠ `chat()` BUILDS AN EMPTY BOX — it only paints once `sync()` runs (every
			// caller in `ai2/card.js` does the same right after constructing one).
			// Skipping this left the sheet showing the mic and nothing above it, even
			// on a card with a long history (found in this task's own proof shots).
			this.talk.sync();
		});
	}

	// THE ONE METHOD a variant overrides, for a PLAIN page (no active card) —
	// the default local "prompt item" card, one per finished sentence, never
	// wiping `$cards`. On a card page the sentence instead posts into that
	// card's own session, the same place its own composer used to send it, and
	// the reply lands in the very thread `$thread` is already showing.
	//
	// ⚠ NO RESPONSES (the owner tested the phone, 2026-09-29): on a plain page
	// this used to only draw the local card and send nothing at all, so no
	// reply could ever come back — the owner said "can you hear me?" and never
	// heard anything. Both branches now go through `tabs/ai.js`'s own `send()`
	// (the same route the desktop drawer's AI tab uses: page-ai, then the
	// `/ask/turn` bridge for a card, or over `/ask/turn` directly for a page)
	// and show the reply under this sentence's own card. `send()`'s result
	// used to be thrown away on the card branch too (review #3): from a phone
	// Servex is often unreachable, and the spoken sentence just vanished — no
	// card, no error. `not_sent()` below shows it instead, so a failed send
	// still leaves something to see.
	card(text){
		if (this.card_ref){
			// Echoed AT ONCE, before `send()` even starts — a phone has no live
			// socket to redraw the card's thread on its own, so without this the
			// sentence stayed invisible until something else happened to redraw
			// the page (review #3, 2026-09-29). Removed once `sync()` below has
			// drawn the real, persisted turn in its place.
			const $echo = this.echo(text);
			import("./tabs/ai.js").then(async m => {
				const r = await m.send({ card: this.card_ref.id, text, via: "voice" });
				if (!r.ok) this.not_sent(text, r.note);
				this.talk?.sync();
				$echo?.remove();
			});
			return;
		}
		this.$empty?.hide();
		let $item, $wait;
		this.$cards?.append(() => {
			$item = div.c("drawer-rail-sheet-card", () => {
				div.c("drawer-rail-sheet-card-text", text);
				// `send()` can now sit for up to 90s polling the page's own chat log
				// for a page-ai reply (mastermind, 2026-09-29) — this placeholder is
				// what tells the reader something is actually happening, replaced
				// the moment `send()` resolves either way.
				$wait = div.c("drawer-rail-sheet-card-reply muted", "waiting for the page's assistant…");
			});
		});
		import("./tabs/ai.js").then(async m => {
			const r = await m.send({ text, via: "voice" });
			$wait?.remove();
			$item?.append(() => {
				r.via === "none"
					? span.c("muted", "not sent — " + (r.note || "Servex is not answering"))
					: div.c("drawer-rail-sheet-card-reply muted", r.text ?? r.note ?? "");
			});
		});
	}

	// A placeholder line shown the instant a sentence is said on a card page,
	// before `send()` has even reached the server — `$thread` may otherwise sit
	// empty or unchanged for a second or more, which reads as "nothing heard."
	echo(text){
		let $line;
		this.$thread.append(() => { $line = div.c("drawer-rail-sheet-pending muted", "you: " + text); });
		return $line;
	}

	// A sentence `send()` could not deliver — shown right in the thread box, so
	// it sits where the reply would have gone rather than disappearing.
	not_sent(text, note){
		this.$thread.append(() => {
			div.c("drawer-rail-sheet-card", () => {
				div.c("drawer-rail-sheet-card-text", text);
				span.c("muted", "not sent — " + (note || "Servex is not answering"));
			});
		});
	}
}

/** THE DEFAULT SHEET — `DrawerRailSheetV1` (above) plus one more thing: a short
 *  row of links to the parts of the full drawer this small sheet doesn't try to
 *  reproduce (Sessions, Dictation, Settings, "Open full AI"). No feature parity
 *  with the desktop drawer — tapping a link opens the REAL drawer on that tab and
 *  closes this sheet, rather than growing a second copy of each tab in here. */
export class DrawerRailSheet extends DrawerRailSheetV1 {
	render(){
		super.render();
		this.links();
	}

	links(){
		return div.c("drawer-rail-sheet-links flex wrap", () => {
			this.link("Sessions", "sessions");
			this.link("Dictation", "dictation");
			this.link("Settings", "settings");
			this.link("Open full AI", "ai");
		});
	}

	link(label, tab){
		return button.c("drawer-rail-sheet-link", label).attr("type", "button")
			.click(() => { this.close(); tabs.open(tab); });
	}
}

/** THE PANEL SHEET — the new default (`ChatPanel`, `ai/2026-09-29/audio/c-chat/`):
 *  the exact same log-plus-composer-plus-mic widget the desktop drawer's AI tab
 *  now builds (`ext/drawer/tabs/ai.js`), instead of this sheet's own hand-wired
 *  mic-only build — "we need a consistent chat widget… whether it's in a desktop
 *  sidebar or a mobile sheet" (the owner, 2026-09-29). Everything else
 *  `DrawerRailSheetV1` gave the sheet is kept: the mic starts listening the
 *  instant the sheet opens (`start_mic()`, called from `open()`), every finished
 *  sentence still shows as its own thing — now a chat bubble ChatPanel draws,
 *  rather than a bespoke "prompt item" card, the same unification the drawer's
 *  AI tab makes — and the links footer (inherited from `DrawerRailSheet`) still
 *  reaches Sessions, Dictation, Settings and the full drawer.
 *
 *  `--chatbox-panel-max: 70vh` (rail.css) — the sheet itself is already capped
 *  at `max-block-size: 70vh` (rail.css, pre-existing), so the panel can just use
 *  that whole ceiling; there is no separate drawer-style approximation to make.
 *
 *  ⚠ A card CHANGE (the reader keeps the sheet open while navigating to a
 *  different card) rebuilds the panel whole, which restarts its mic for a beat —
 *  a known, accepted trade, not a bug to chase here: `ChatPanel` owns its log,
 *  composer and mic as ONE piece on purpose (deliverable 1 of this same task),
 *  so there is no seam to swap only the log's source without giving the panel a
 *  second, larger API than the brief asked for. `start_mic()` restarts listening
 *  right after every rebuild, so the gap is a beat, never a silence. */
export class DrawerRailSheetPanel extends DrawerRailSheet {
	render(){
		this.head();
		this.$slot = div.c("drawer-rail-sheet-panel");
		this.links();
	}

	open(){
		this.ac("on");
		this.sync_card();
		return this;
	}

	close(){
		this.stop_mic();
		this.rc("on");
		return this;
	}

	stop_mic(){
		const mic = this.panel?.compose?.mic;
		if (mic?.active?.()) mic.stop();
	}

	start_mic(){
		const mic = this.panel?.compose?.mic;
		if (mic && !mic.active?.()) mic.start();
	}

	// Same job as `DrawerRailSheetV1.sync_card()` (which thread the sheet shows)
	// but ChatPanel has no seam to swap only a built panel's source — a card
	// change rebuilds the whole panel (see the class doc above).
	sync_card(){
		const card = this.active_card();
		const id = card?.id ?? null;
		if (id === this.card_id && this.panel){ this.panel.sync(); this.start_mic(); return; }
		this.card_id = id;
		this.card_ref = card;
		const token = this.sync_token = (this.sync_token ?? 0) + 1;
		// `say()` (the card's button-answer route) is only ever needed on a card —
		// lazily loaded, same reasoning as `DrawerRailSheetV1.sync_card()`'s own
		// lazy `ai2/chat.js` import: most opens of this sheet are on a plain page.
		(card ? import("/framework/ai2/compose.js") : Promise.resolve(null)).then(mod => {
			if (this.sync_token !== token) return;   // moved to a different card (or a plain page) while this loaded
			const say = mod?.say;
			this.$slot.empty(() => {
				// ⚠ THE LINE MINION B EXTENDS with a revise-level argument (the same
				// note `tabs/ai.js` carries): `ChatPanel` builds its own composer, and
				// the composer builds the microphone (`Composer.js` → `ComposerMic`) —
				// this call is where that chain starts for the mobile sheet.
				this.panel = card ? new ChatPanel({
					source: () => card.chat_entries(),
					answer: choice => say(choice, card.id),
					re: () => card.id,
					placeholder: "talk into this card",
					sent: "sent — the reply lands in the thread above",
					failed: "Servex is not answering, so nothing was sent",
					deliver: async entry => {
						const ok = (await import("./tabs/ai.js").then(m => m.send({ card: card.id, text: entry.text, via: entry.via }))).ok;
						this.panel.sync();
						return ok;
					},
				}) : new ChatPanel({
					placeholder: "say something",
					sent: "sent",
					failed: "not sent",
					/* A plain page has no persisted thread of its own — each finished
					   sentence and its reply go straight into the panel's own local list,
					   as the universal chat line (`ext/Chat/readme.md`) so BOTH sides
					   show: this deliver used to only ever `say()` the REPLY, never the
					   words the owner said, so a plain page's own sentence never became a
					   bubble at all (caught reading this file just now; `DrawerRailSheetV1`'s
					   own "prompt item" cards, above, always drew the words said — this is
					   that same guarantee, kept). */
					deliver: async entry => {
						const via = entry.via === "whisper" ? "voice" : "text";
						this.panel.say({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, via, text: entry.text } });
						const r = await import("./tabs/ai.js").then(m => m.send({ text: entry.text, via: entry.via }));
						this.panel.say({ chat: { at: new Date().toISOString(), from: { kind: "assistant" }, text: r.text ?? r.note } });
						return r.via !== "none";
					},
				});
			});
			this.start_mic();
		});
	}
}

DrawerRail.Sheet = DrawerRailSheetPanel;
DrawerRail.SheetV1 = DrawerRailSheetV1;
DrawerRail.SheetLinksV1 = DrawerRailSheet;   // mic-only + links footer, today's outgoing default — kept reachable

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

/* v2 — the whole earlier rail, verbatim: icon-and-text-label buttons at full
   height, ✦ on the LEFT (source order, `compact = false` turns off the
   `order:` swap in rail.css), opening the earlier full sheet (`SheetV1`, no
   links footer). Built while fixing the "no reply ever came" bug and the new
   icon-only rail with ✦ on the thumb (right) side (the primary action) —
   `new DrawerRail.V2({ app })` in place of `rail(app)`'s default brings the
   whole earlier design back, one class away, nothing deleted. */
export class DrawerRailV2 extends DrawerRail {}
DrawerRailV2.prototype.compact = false;
DrawerRailV2.Sheet = DrawerRailSheetV1;
DrawerRail.V2 = DrawerRailV2;

// One rail per document, built the first time a page asks for it — same shape as
// drawer.js's own singleton. Called from menu.js, so app.js needs no change: the
// site already calls `menu(app)` once, and that is this module's only caller.
let $rail;
export default function rail(app){
	return $rail ??= new DrawerRail({ app });
}

export { rail };
