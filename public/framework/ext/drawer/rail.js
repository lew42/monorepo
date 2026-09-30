import { View, div, span, button } from "/framework/core/View/View.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";
import grip from "/framework/ext/grip/grip.js";
import floor from "/framework/ux/Dictate/floor.js";
import { ChatPanel } from "/framework/ext/Chat/ChatPanel.js";
// A NAMESPACE import, not `{ start, say, nav, watch }` named ones — the resume
// seam below reads `Session.resume` only if it exists (`typeof ... ===
// "function"`), and a named import of an export the module does not have yet
// is a hard SyntaxError at load time, for every page, the moment this file is
// imported (voice-sessions review, mastermind-servex-7, 2026-09-29: "wire it so
// resume works the moment slice 2 merges" — `ext/Session/Session.js` is not
// ours to edit, and does not export `resume()` yet).
import * as Session from "/framework/ext/Session/Session.js";
import tabs from "./tabs.js";
import drawer from "./drawer.js";
const { start, say, nav, watch } = Session;

View.stylesheet(import.meta, "rail.css");

// One key per browser tab (sessionStorage), so a reload on the same tab picks the
// SAME voice session back up (`ext/Session/Session.js`) instead of starting a
// second one silently — `DrawerRailSheetPanel.ensure_session()`, below.
const SESSION_KEY = "lew42-voice-session";

// A rough "how long ago" for the resume offer below — "1 day ago", never a
// timestamp nobody can read at a glance.
function ago(at){
	const ms = Date.now() - Date.parse(at ?? 0);
	if (!Number.isFinite(ms) || ms < 0) return "";
	const mins = Math.round(ms / 60000);
	if (mins < 60) return mins <= 1 ? "just now" : mins + " minutes ago";
	const hours = Math.round(mins / 60);
	if (hours < 24) return hours === 1 ? "1 hour ago" : hours + " hours ago";
	const days = Math.round(hours / 24);
	return days === 1 ? "1 day ago" : days + " days ago";
}

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
		this.watch_history();
		this.restore();
	}

	// Bound ONCE, here, never per-open: rail.css's own media query (`(max-width:
	// 52em)`) is the only thing that shows the sheet, so if the window widens past
	// it — or a phone rotates — while the sheet is open, the sheet becomes
	// unreachable but the mic was still listening into it (found 2026-09-29: no
	// way back to a mic left running behind a sheet nobody can see). `close()`
	// already stops the mic, so reusing it here is the whole fix.
	// Widening past 52em hides the sheet (and stops its mic) but leaves the url
	// alone: the url is still the truth, so narrowing again shows the sheet the url
	// names, quietly (sheet-as-page, 2026-09-30).
	watch_breakpoint(){
		const mq = globalThis.matchMedia?.("(max-width: 52em)");
		mq?.addEventListener?.("change", e => e.matches ? this.apply(this.routed()) : this.$sheet?.hide());
	}

	small(){ return !!globalThis.matchMedia?.("(max-width: 52em)")?.matches; }

	/* THE SHEET IS A PAGE (sheet-as-page, 2026-09-30 — the owner: "as I swipe this
	   thing up… all the way at the top, it's almost like we've just navigated to
	   this page… the user's operating system level back button should always
	   work"). Three states, each one its own url and its own history entry:

	     closed   /framework/                 the rail only
	     open     /framework/?sheet=open      the sheet, part of the screen
	     full     /framework/?sheet=full      the sheet IS the screen, with ‹ Back

	   Stepping UP (✦, a drag to the top) pushes an entry; stepping DOWN (the phone's
	   back, ‹ Back, ✕, a drag down) goes back through those same entries, so the
	   phone's back always steps the sheet down one state and never leaves the site
	   while the sheet is showing. `history.state.depth` counts how many of our own
	   entries sit on top of the closed one (open = 1, full = 2); when it is missing
	   (a sheet carried across an in-app navigation) a step down REPLACES the entry
	   instead of going back into a different page. `core/Router` ignores a popstate
	   that stays on the same path, so none of this reloads the page underneath.
	   doc/sheet.md. */
	static KEY = "sheet";
	static RANK = { closed: 0, open: 1, full: 2 };

	routed(){
		const m = new URLSearchParams(location.search).get(this.constructor.KEY);
		return m === "open" || m === "full" ? m : "closed";
	}

	url(mode){
		const url = new URL(location.href);
		mode === "closed" ? url.searchParams.delete(this.constructor.KEY) : url.searchParams.set(this.constructor.KEY, mode);
		return url;
	}

	// ⚠ `history.state` is carried over — Router and tabs.js keep their own there.
	push(mode){
		const st = history.state ?? {};
		const depth = mode === "open" ? 1 : (st.depth ? st.depth + 1 : null);
		history.pushState({ ...st, sheet: mode, depth }, "", this.url(mode));
	}

	replace(mode){
		const { sheet, depth, ...st } = history.state ?? {};
		history.replaceState(mode === "closed" ? st : { ...st, sheet: mode, depth: null }, "", this.url(mode));
	}

	// Every url change — ours, the phone's back, forward — lands here.
	watch_history(){
		window.addEventListener("popstate", () => this.apply(this.routed()));
	}

	// A url that names the sheet (a reload, a shared link) opens it — once the
	// styles are in, like tabs.js's `?drawer=`. The entries UNDER it are rebuilt
	// first (closed, then open, then full), so the phone's back steps down through
	// them instead of leaving the site. Opened quietly: the mic starts only on a tap.
	restore(){
		const mode = this.routed();
		if (mode === "closed" || !this.small()) return;
		this.app?.styles_loaded?.().then(() => {
			this.replace("closed");
			this.push("open");
			if (mode === "full") this.push("full");
			this.apply(mode);
		});
	}

	/** Go to a state: "closed", "open" or "full". Resolves once it shows. */
	to(mode, { listen = false } = {}){
		const from = this.mode ?? "closed";
		if (mode === from){ this.apply(mode, listen); return Promise.resolve(); }
		const R = this.constructor.RANK, st = history.state ?? {};
		const steps = R[from] - R[mode];
		if (steps > 0 && st.depth === R[from]) return this.back(steps);
		steps < 0 ? this.push(mode) : this.replace(mode);
		this.apply(mode, listen);
		return Promise.resolve();
	}

	// Back through our own entries; the popstate listener above applies the state.
	// The timer is a net for a browser that never fires popstate (it always should).
	back(steps){
		return new Promise(done => {
			const t = setTimeout(() => { this.apply(this.routed()); done(); }, 800);
			window.addEventListener("popstate", () => { clearTimeout(t); done(); }, { once: true });
			history.go(-steps);
		});
	}

	// Make the screen match a state. Never touches history.
	apply(mode, listen = false){
		this.mode = mode;
		if (mode === "closed" || !this.small()){ this.$sheet?.hide(); return; }
		const sheet = this.sheet();
		if (!sheet.showing()) sheet.show({ listen });
		sheet.state(mode);
	}

	// Called from menu.js's own `navigated()` seam, the same one the drawer's tabs
	// already follow (tabs.js's own `navigated()`) — so the sheet's header path
	// stays true after a real in-app navigation, not just on the next open, and a
	// voice session already open (below) hears about the move too. A no-op until
	// the sheet is built (it is built lazily, on the first tap).
	navigated(){
		this.$sheet?.update_path?.();
		this.$sheet?.navigated?.();
		// Router pushed the new page's url without `?sheet` (it pushes AFTER this
		// runs, hence the tick). A sheet still showing writes its state back — and a
		// FULL sheet steps down to open, so the page just navigated to is in view.
		// A back/forward that landed on an entry which already names the sheet is
		// left as it is (its step count is what makes the next back right).
		if (this.mode && this.mode !== "closed") setTimeout(() => {
			if (this.routed() === "closed") this.replace("open");
			this.apply(this.routed());
		});
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
	sheet(){
		if (!this.$sheet) this.append(() => { this.$sheet = new this.constructor.Sheet({ rail: this }); });
		return this.$sheet;
	}

	// ✦ — the sheet opens (a new history entry) and starts listening.
	open_sheet(){
		if (this.mode === "open" || this.mode === "full") this.sheet().show({ listen: true });
		else this.to("open", { listen: true });
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
		this.handle();
		// Filled by `sync_card()` below, on every open: either the card's own real
		// chat thread, or the old empty-state + growing list of local prompt cards.
		this.$thread = div.c("drawer-rail-sheet-thread");
		this.$mic = div.c("drawer-rail-sheet-mic");
	}

	head(){
		return div.c("drawer-rail-sheet-head flex v-center split", () => {
			// ‹ Back — shown only at full height (rail.css), where the sheet reads as
			// a page of its own. It steps down to the open sheet, exactly as the
			// phone's own back button does.
			button.c("drawer-rail-sheet-back", "‹ Back").attr("type", "button")
				.attr("title", "Back to the page").click(() => this.rail?.to("open"));
			div.c("drawer-rail-sheet-heading flex v-center wrap", () => {
				span.c("drawer-rail-sheet-title", "Ask, by voice");
				this.$path = span.c("drawer-rail-sheet-path muted");
			});
			button.c("drawer-x", "✕").attr("type", "button").attr("title", "Close").click(() => this.close());
		});
	}

	// The page this sheet is about, right now — "Ask, by voice · /framework/". Set
	// on every open (below) and again on every navigation (`DrawerRail.navigated()`
	// above), so a reader who opens the sheet, navigates, then opens it again
	// always sees the page they are actually standing on, never the one they
	// opened it from.
	update_path(){
		this.$path?.text(" · " + drawer.page());
	}

	// THE SHEET'S OWN GRIP — its top edge, dragging the sheet's HEIGHT instead of a
	// rail's width (grip-everywhere, 2026-09-29). `axis: "y"` is the one new thing
	// `ext/grip` needed for this; `from` is left at its default ("end") because the
	// sheet's own BOTTOM is what's pinned to the screen (`rail.css`'s `inset-block-
	// end: 0`) — exactly the relationship every `from: "end"` rail already has, just
	// read on the block axis. `write` clamps so a wild drag can't shrink the sheet
	// past its own header or grow it past the screen; `done` is the only place a
	// dragged height is remembered (`remember_height` below) — a height nobody
	// dragged is never written to storage, so the untouched default keeps tracking
	// the sheet's own content (`size()` below) instead of freezing on day one.
	// ⚠ The drag sets a real HEIGHT (`.drawer-rail-sheet-sized`, rail.css), not
	// only a ceiling: with `max-block-size` alone a drag above the sheet's own
	// content did nothing — the finger moved and the sheet stayed put
	// (sheet-as-page, 2026-09-30). Live, it follows the finger from 12% of the
	// screen to all of it; on release it settles: near the top it becomes the
	// full-height page, near the bottom it closes, anywhere between it stays where
	// you let go (remembered).
	handle(){
		return grip({
			axis: "y",
			write: px => {
				const h = Math.min(Math.max(px, innerHeight * 0.12), innerHeight);
				this.size_to(h + "px");
				return h;
			},
			done: h => this.settle(h),
		});
	}

	settle(h){
		const H = innerHeight;
		if (h >= H * this.full_at) return this.rail ? this.rail.to("full").then(() => this.state("full")) : this.state("full");
		if (h < H * this.close_at) return this.rail ? this.rail.to("closed") : this.hide();
		this.remember_height(this.clamp_height(h));
		return this.rail?.mode === "full" ? this.rail.to("open") : this.state("open");
	}

	size_to(h){
		this.ac("drawer-rail-sheet-sized");
		this.style("--sheet-h", h);
	}

	/** "open" (its own height) or "full" (the whole screen, ‹ Back showing). */
	state(mode){
		this.el.classList.toggle("drawer-rail-sheet-full", mode === "full");
		mode === "full" ? this.size_to("100dvh") : this.size();
		return this;
	}

	showing(){ return this.el.classList.contains("on"); }

	/** ✕ — closes the sheet the way the phone's back does, through history. */
	close(){
		return this.rail ? this.rail.to("closed") : Promise.resolve(this.hide());
	}

	// Shared by the live drag (`handle()` above) AND a height read back from
	// localStorage (`size()` below) — a height saved on a TALL viewport and
	// reopened on a SHORT one (a phone rotated, or a different device
	// entirely reading the same key) would otherwise push this `position:
	// fixed; inset-block-end: 0` sheet up past the top of a short screen,
	// with no visible way back to a smaller size (review finding, landing
	// day). 160 keeps at least the head row + a sliver of the mic visible.
	// The floor is 40% of the screen, not a fixed 160 px (sheet-regression,
	// 2026-09-30): at 160 the head and the links filled the whole sheet and the
	// conversation and the mic were clipped out of sight.
	clamp_height(px){
		return Math.min(Math.max(px, window.innerHeight * 0.4), window.innerHeight * 0.92);
	}

	// Its own key — never the drawer's own width key (`lew42-drawer-w`, drawer.js),
	// or the two rails could stomp each other's number on the same device. Both
	// directions wrapped in try/catch (the owner's own words): a phone in private
	// browsing throws on `setItem`, not only on a blocked `getItem`.
	// "-2" (sheet-regression, 2026-09-30): the old key could hold a height that
	// left only the header visible, so every old value is dropped once.
	sheet_height_key(){ return "lew42-drawer-rail-sheet-h-2"; }

	read_height(){
		try {
			const v = parseFloat(localStorage.getItem(this.sheet_height_key()));
			return v > 0 ? v : null;
		} catch { return null; }
	}

	remember_height(px){
		try { localStorage.setItem(this.sheet_height_key(), String(Math.round(px))); }
		catch {}
	}

	// Picks the sheet's own height for THIS open, written as `--sheet-h`
	// (rail.css's `max-block-size` reads it, falling back to 50dvh if this never
	// runs). A height the reader dragged to before, on this device, wins outright.
	// The very first open instead starts at half the viewport, or the sheet's own
	// natural content height if that is smaller (the owner's own words) — an empty
	// sheet, mic and all, is nowhere near half a phone, and starting there would
	// waste most of the screen on nothing. Called from `open()`, AFTER the mic and
	// the thread are built (`sync_card`/`listen` below) — measured any earlier and
	// `scrollHeight` would only see the empty head row, since `display: none`
	// elements have no box to measure at render time at all.
	size(){
		const saved = this.read_height();
		if (saved){ this.size_to(this.clamp_height(saved) + "px"); return; }
		// ⚠ NOT MEASURED (sheet-regression, 2026-09-30). This used to read
		// `scrollHeight` and freeze it as a px height, but the panel sheet builds its
		// chat panel a tick later (a promise), so the measure saw only the header and
		// the links (about 150 px) and the conversation and the mic were clipped out.
		// With no px height the CSS default applies: the sheet grows with its
		// content, up to half the screen (rail.css, `max-block-size`).
		this.rc("drawer-rail-sheet-sized");
		this.el.style.removeProperty("--sheet-h");
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
	// Shown by the rail (`DrawerRail.apply()`), never directly: `listen` is true
	// only for a tap on ✦ — a sheet restored from the url opens quiet.
	show({ listen = true } = {}){
		this.ac("on");
		this.update_path();
		this.sync_card();
		this.dictate ? (listen && this.dictate.start()) : this.listen(listen);
		// AFTER the mic/thread above, not before: on a plain page both build
		// synchronously, so `size()`'s content measurement sees the real mic
		// widget and empty-state text, not an empty box. (On a CARD page the
		// thread's own content loads async, a heartbeat later — `size()` still
		// runs against whatever's there yet, a minor, accepted gap: doc/decisions.md.)
		this.size();
		return this;
	}

	hide(){
		this.dictate?.stop();
		this.rc("on");
		return this;
	}

	listen(start = true){
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
		if (start) this.dictate.start();
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
			this.new_session_button();
			this.link("Sessions", "sessions");
			this.link("Dictation", "dictation");
			this.link("Settings", "settings");
			this.link("Open full AI", "ai");
		});
	}

	link(label, tab){
		return button.c("drawer-rail-sheet-link", label).attr("type", "button")
			.click(() => this.close().then(() => tabs.open(tab)));
	}

	/* NEW SESSION — a PRIMARY action, right beside Sessions (the owner, 2026-09-29),
	 * because starting over is something a reader reaches for as often as looking
	 * at past threads. This base version is the CARD-page route: it asks Servex to
	 * forget the card's own fast assistant's session via `tabs/ai.js`'s
	 * `new_session()` (the only way to do that — `POST /api/page-ai` carries no
	 * session id of its own), so the very next thing said starts a fresh
	 * conversation, while the card's own persisted thread stays showing — that is
	 * the card's real, permanent record, not something this button should hide.
	 * `DrawerRailSheetPanel` below overrides this for a PLAIN page, where there is
	 * no page-ai bridge to reset — a real voice session (`ext/Session/Session.js`)
	 * to drop instead. */
	new_session(){
		if (!this.card_ref){
			this.$cards?.empty();
			this.$empty?.show();
		}
		import("./tabs/ai.js").then(m => m.new_session?.({ page: drawer.page(), card: this.card_ref?.id }));
	}

	new_session_button(){
		return button.c("drawer-rail-sheet-link drawer-rail-sheet-new", "New session").attr("type", "button")
			.attr("title", "Clear this sheet and start a fresh conversation")
			.click(() => this.new_session());
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
	// The resize handle is inherited behaviour, not ChatPanel's — `handle()`,
	// `size()` and the storage helpers all live on `DrawerRailSheetV1` (this
	// class's own grandparent) and don't care what fills the sheet below them,
	// only the sheet's OWN box (`this.el`, `this.style`). This class overrides
	// `render()`/`open()`/`close()` wholesale (no `super.render()`/`super.open()`
	// call — ChatPanel's `$slot` replaces V1's `$thread`/`$mic` entirely), so
	// without restating these two calls here the resize handle would silently
	// stop reaching the sheet everyone actually uses (`DrawerRail.Sheet` below)
	// the moment this class landed — caught merging grip-everywhere against this
	// same day's voice-sessions work, not written against it originally.
	render(){
		this.head();
		this.handle();
		this.$slot = div.c("drawer-rail-sheet-panel");
		// The links row is hidden until "More" in the head is tapped
		// (sheet-regression, 2026-09-30): the conversation and the mic come first.
		this.$links = this.links().ac("drawer-rail-sheet-links-folded");
	}

	head(){
		const $head = super.head();
		const $x = $head.el.querySelector(".drawer-x");
		$head.append(() => {
			const $more = button.c("drawer-rail-sheet-more", "More").attr("type", "button")
				.attr("aria-expanded", "false")
				.attr("title", "Sessions, dictation, settings, the full AI")
				.click(() => {
					const open = this.$links.el.classList.toggle("drawer-rail-sheet-links-folded") === false;
					$more.attr("aria-expanded", String(open));
				});
			$head.el.insertBefore($more.el, $x);
		});
		return $head;
	}

	show({ listen = true } = {}){
		this.quiet = !listen;
		this.ac("on");
		this.update_path();
		this.sync_card();
		this.size();
		return this;
	}

	hide(){
		this.stop_mic();
		this.rc("on");
		return this;
	}

	stop_mic(){
		const mic = this.panel?.compose?.mic;
		if (mic?.active?.()) mic.stop();
	}

	// Not while `quiet` — a sheet the url reopened (a reload, the phone's
	// forward) waits for the reader to tap the mic.
	start_mic(){
		if (this.quiet) return;
		const mic = this.panel?.compose?.mic;
		if (mic && !mic.active?.()) mic.start();
	}

	// Every real in-app route change while a PLAIN page's voice session is open,
	// reported once (`nav()`) — a no-op on a card page (voice sessions never touch
	// those) and a no-op until a session actually exists (deliverable 2: a route
	// change alone never starts one). Deferred a tick, the same reason `tabs.js`'s
	// own `navigated()` is: `Router.go()` calls `pushState()` only AFTER this
	// fires, so `drawer.page()` here is still the PAGE THE READER IS LEAVING until
	// the very next task (`code` skill §7).
	navigated(){
		if (!this.session) return;
		setTimeout(() => {
			const to = drawer.page();
			if (to === this.nav_path) return;
			const from = this.nav_path;
			this.nav_path = to;
			nav({ session: this.session, from, to }).catch(() => {});
		});
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
			if (card){
				this.$slot.empty(() => {
					// ⚠ THE LINE MINION B EXTENDS with a revise-level argument (the same
					// note `tabs/ai.js` carries): `ChatPanel` builds its own composer, and
					// the composer builds the microphone (`Composer.js` → `ComposerMic`) —
					// this call is where that chain starts for the mobile sheet.
					this.panel = new ChatPanel({
						source: () => card.chat_entries(),
						answer: choice => say(choice, card.id),
						re: () => card.id,
						marks: true,
						placeholder: "talk into this card",
						sent: "sent — the reply lands in the thread above",
						failed: "Servex is not answering, so nothing was sent",
						deliver: async entry => {
							const ok = (await import("./tabs/ai.js").then(m => m.send({ card: card.id, text: entry.text, via: entry.via }))).ok;
							this.panel.sync();
							return ok;
						},
					});
				});
				this.start_mic();
			} else {
				this.build_voice_panel();
			}
			// Measured AGAIN now the panel exists: `open()`'s own `size()` ran before this
			// import resolved, saw only the head and the links (146 px), and froze the sheet
			// there with no composer showing (voice-fixes, reviewing the grip hand-merge).
			this.size();
		});
	}

	/* THE PLAIN-PAGE PANEL — a real voice session (`ext/Session/Session.js`), not
	 * the page-ai bridge (voice-on-panel, 2026-09-29: re-applying the same switch
	 * `DrawerRailSheetVoice` made on the old hand-wired sheet, now on top of
	 * `ChatPanel`). No `source` is given — `ensure_session()`/`voice_deliver()`
	 * below feed the panel's own local list through `panel.say({chat: ...})`,
	 * using the EXACT universal chat line shape `ext/Session`'s own file already
	 * writes (`{chat: {at, session, path, from, via, text, re}}`), which
	 * `ext/Chat/Chat.js`'s `chat_line()` already knows how to draw — a fast and a
	 * smart reply need no translation, just a pass-through. */
	build_voice_panel(){
		// THE DOUBLE LINE (voice-fixes, review phase 1): `voice_deliver()` below draws
		// the owner's own line at once, using the server's `at`; the session-file
		// watch (`watch_session()`) then reads that same line back off disk and draws
		// it again. This Set remembers every `at` this panel already drew locally, so
		// the watch can skip it instead of doubling the bubble.
		this.own_ats = new Set();
		this.force_fresh ??= false;
		this.$slot.empty(() => {
			this.panel = new ChatPanel({
				placeholder: "say something",
				sent: "sent",
				failed: "not sent",
				marks: true,
				answer: choice => this.on_resume_choice(choice),
				deliver: entry => this.voice_deliver(entry),
			});
		});
		this.start_mic();
		if (!this.session) this.offer_recent();
	}

	/* THE RESUME LINE ON OPEN (voice-fixes item 5): before a word is said, the page's
	 * newest session shows as ONE tappable line, "<title> · 1 day ago". `recent()`
	 * spawns nothing, so this costs one GET. A session that spoke within the hour is
	 * continued by `start()` itself on the first sentence, tapped or not. */
	offer_recent(){
		if (typeof Session.recent !== "function") return;
		const panel = this.panel;
		Session.recent(drawer.page(), { limit: 1 }).then(([row]) => {
			if (!row || this.session || this.panel !== panel) return;
			this.offer_resume({ session: row.session, title: row.title, summary: row.summary, at: row.last_at ?? row.at });
			requestAnimationFrame(() => this.size());   // grow to show the line (a height the reader dragged to still wins)
		}).catch(() => {});
	}

	/* Read the tab's saved session first (survives a reload on the same tab);
	 * only `start()` a new one when there is none yet — and only EVER called from
	 * `voice_deliver()`, itself only called once a sentence has actually finished,
	 * so opening the sheet or pressing "New session" alone never starts one
	 * (deliverable 2: `start()` spawns two real agents, about 600 MB, so it
	 * happens on the FIRST SENTENCE ONLY). */
	async ensure_session(){
		if (this.card_ref || this.session) return;
		try {
			const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
			if (saved?.session && saved?.file){
				this.session = saved.session; this.session_file = saved.file; this.nav_path = drawer.page();
				this.watch_session();
				return;
			}
		} catch {}
		try {
			const fresh = this.force_fresh; this.force_fresh = false;
			const made = await start({ path: drawer.page(), fresh });
			this.session = made.session; this.session_file = made.file; this.nav_path = drawer.page();
			try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ session: made.session, file: made.file })); } catch {}
			this.watch_session();
			this.offer_resume(made.previous);
		} catch {}   // left with no session — `voice_deliver()` below fails the send instead
	}

	watch_session(){
		this.stop_watch?.();
		// Every line `ext/Session`'s own file gets — the owner's, the fast reply,
		// the smart reply — is ALREADY the universal chat line `Chat.js` draws, so
		// this just hands it straight to the panel. The owner's own line was very
		// likely already drawn once, at once, by `voice_deliver()` below, using the
		// exact `at` the server assigned — `this.own_ats` (set there) is what stops
		// this watch drawing that exact line a second time.
		this.stop_watch = watch(this.session_file, line => {
			if (!line.chat) return;
			if (this.own_ats?.has(line.chat.at)) return;
			this.panel?.say({ chat: line.chat });
		});
	}

	forget_session(){
		this.stop_watch?.(); this.stop_watch = null;
		this.session = null; this.session_file = null;
		try { sessionStorage.removeItem(SESSION_KEY); } catch {}
	}

	/* A PLAIN page's finished sentence — `ensure_session()` starts (or resumes)
	 * one on the first sentence only, `say()` sends this one, and the owner's own
	 * bubble is drawn at once using the server's own `at` (see `watch_session()`
	 * above for why that never doubles up once the poll reads the same line back). */
	async voice_deliver(entry){
		try {
			await this.ensure_session();
			if (!this.session) return false;
			const via = entry.via === "whisper" ? "voice" : "text";
			// THE FLOOR (ext/Chat/doc/floor.md): `stamp()` leaves an entry that already has
			// `floor` alone, and stamps one that doesn't from the mic's live level meter.
			floor.stamp(entry);
			const r = await say({ session: this.session, path: drawer.page(), text: entry.text, via, floor: entry.floor, cues: entry.cues });
			this.own_ats?.add(r.at);
			this.panel?.say({ chat: { at: r.at, session: this.session, path: drawer.page(), from: { kind: "owner" }, via, text: entry.text } });
			if (entry.floor === "speaking") this.watch_floor();
			return true;
		} catch {
			return false;
		}
	}

	/* A sentence went out while the owner was still talking: watch the mic's floor
	 * until it turns "done" with no new words, then tell the session once, so the
	 * held fast reply lands (`Session.floor()`). A newer say restarts the watch. */
	watch_floor(){
		clearInterval(this.floor_watch);
		const session = this.session, started = Date.now();
		this.floor_watch = setInterval(() => {
			if (session !== this.session || Date.now() - started > 30000) return clearInterval(this.floor_watch);
			if (floor.state() !== "done") return;
			clearInterval(this.floor_watch);
			if (typeof Session.floor === "function") Session.floor({ session, floor: "done" }).catch(() => {});
		}, 250);
	}

	/* RESUME, WIRED AHEAD OF SLICE 2 (voice-sessions review, mastermind-servex-7,
	 * 2026-09-29 — the owner's own "the ✦ button doesn't resume"). `start()`'s
	 * own response already carries `previous` — the last session on this page,
	 * however old — but the thing still MISSING is the client call that actually
	 * resumes one: `ext/Session/Session.js` does not export `resume()` yet (its
	 * slice 2, not merged, and not ours to edit). `typeof Session.resume ===
	 * "function"` is the WHOLE gate below — false today, so nothing new shows and
	 * nothing is called; true the instant that export lands, with no further
	 * change here. Proof note: wired, activates with slice 2. */
	// An hour, matching the server's own SERVEX_SESSION_RESUME_MS default
	// (`Servex/agents/Sessions.js`): a session newer than this continues on its
	// own, the moment the owner says the first word, so offering it here too
	// would be the same choice twice (voice-fixes review item 11).
	static RESUME_OFFER_MS = 60 * 60 * 1000;

	offer_resume(previous){
		if (!previous || typeof Session.resume !== "function") return;
		if (Date.now() - Date.parse(previous.at ?? 0) < this.constructor.RESUME_OFFER_MS) return;
		this._previous = previous;
		// ONE line, and tapping it resumes: the choice button IS the line, and its
		// own age ("· 1 day ago") is why it is worth tapping instead of just talking.
		this._previous_label = `${previous.title ?? "The last conversation"} · ${ago(previous.at)}`;
		this.panel?.say({
			type: "ask", heading: "Pick up where you left off?",
			choices: [this._previous_label], at: new Date().toISOString(),
		});
	}

	on_resume_choice(choice){
		if (choice !== this._previous_label || !this._previous || typeof Session.resume !== "function") return;
		const previous = this._previous; this._previous = null;
		Session.resume(previous.session).then(made => {
			this.forget_session();
			this.session = made.session; this.session_file = made.file; this.nav_path = drawer.page();
			try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ session: made.session, file: made.file })); } catch {}
			this.watch_session();
		}).catch(() => {});
	}

	/* NEW SESSION on a PLAIN page — drops the stored voice session id and stops
	 * watching it, then rebuilds a fresh, empty panel; it does NOT `start()` a
	 * new session here (that would spawn two agents on a tap nobody has said
	 * anything into yet). The next sentence said is what actually calls
	 * `start()`, through `voice_deliver()` → `ensure_session()`. On a CARD page:
	 * unchanged (`DrawerRailSheet.new_session()`'s own reset of the card's
	 * assistant, via the page-ai bridge — voice sessions never touch a card). */
	new_session(){
		if (this.card_ref) return super.new_session();
		this.forget_session();
		this.force_fresh = true;   // the next sentence's ensure_session() must not resume the last hour's session
		this.build_voice_panel();
	}
}

// Where a released drag settles, as a share of the screen: at or above `full_at`
// the sheet becomes the full-height page; below `close_at` it closes.
DrawerRailSheetV1.prototype.full_at = 0.85;
DrawerRailSheetV1.prototype.close_at = 0.28;

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

// App's `navigated()` seam, the same one tabs.js already answers — the sheet's
// header path and its open voice session (both above) follow a real in-app
// navigation, not just the next open.
rail.navigated = () => $rail?.navigated?.();

export { rail };
