import { View, div, span, button } from "/framework/core/View/View.js";
import Dictate from "/framework/ux/Dictate/Dictate.js";
import grip from "/framework/ext/grip/grip.js";
import floor from "/framework/ux/Dictate/floor.js";
import Widget from "/framework/ux/Dictate/Widget.js";
import chat, { ago, new_session_button as chat_new_session_button } from "/framework/ux/Dictate/chat.js";
import Inbox from "./inbox.js";
import { servex_url } from "/framework/dev/servex_url.js";
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
const { start, say, nav, watch, stream, report_quiet, react } = Session;

View.stylesheet(import.meta, "rail.css");

// One key per browser tab (sessionStorage), so a reload on the same tab picks the
// SAME voice session back up (`ext/Session/Session.js`) instead of starting a
// second one silently — `DrawerRailSheetPanel.ensure_session()`, below.
const SESSION_KEY = "lew42-voice-session";

// `ago()` — "1 day ago" for the resume offer below, never a bare timestamp — is now
// THE one copy, imported from `ux/Dictate/chat.js` (review fix #9, 2026-09-30): this
// file and `tabs/sessions.js` used to each carry an identical copy of it.

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
	     full     /framework/?sheet=full      the sheet IS the screen

	   Stepping UP (✦, a drag to the top) pushes an entry; stepping DOWN (the phone's
	   back, ✕, a drag down) goes back through those same entries, so the
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
		// `keep_mic: true` only for a REAL close ("closed" — the ✕, the drag down, the
		// phone's back) — not for the OTHER branch here, a window WIDENED past the 52em
		// breakpoint (`watch_breakpoint()`'s own comment: the sheet becomes unreachable
		// then, so its mic is still released, same as always).
		if (mode === "closed" || !this.small()){ this.$sheet?.hide({ keep_mic: mode === "closed" }); return; }
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

	// No ‹ Back button (the owner, 2026-10-01: "I don't know if we need a back
	// button... we have the X, the X makes much more sense to me — get rid of
	// the back button"). The ✕ already steps the sheet all the way closed from
	// ANY height, full screen included (`close()`, below), so a second button
	// that did almost the same thing was one control too many. The phone's own
	// hardware back button still steps a full sheet down to "open" first, the
	// one thing the removed button offered beyond what ✕ already did.
	//
	// The row used to be three buttons spread by `justify-content:
	// space-between` ("Back", the title, ✕), which spaced them unevenly and
	// read as misaligned once "Back" was hidden outside full height — only
	// two of the three gaps had anything to push against. Now it is just the
	// title on the left and ✕ on the right: `drawer-rail-sheet-heading` is
	// `flex: 1 1 auto` (rail.css), so it fills all the space ✕ (and "More",
	// added by a subclass below) doesn't need, keeping the title flush left
	// and ✕ flush right with no `space-between` guesswork.
	head(){
		return div.c("drawer-rail-sheet-head flex v-center", () => {
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
				const h = Math.min(Math.max(px, this.collapse_h()), innerHeight);
				this.size_to(h + "px");
				// LIVE, not just on release: the sheet reads as one line the moment the
				// drag reaches it, the same way it settles there (`settle()`, below).
				this.el.classList.toggle("drawer-rail-sheet-collapsed", h <= this.collapse_h() + 4);
				return h;
			},
			done: h => this.settle(h),
		});
	}

	/** "One line" — box, mic and Send, nothing else (`rail.css`'s own collapsed
	 *  rules do the hiding). A fixed px, not a share of the screen: `clamp_height`'s
	 *  own 0.4 floor exists for the REMEMBERED "open" height (sheet-regression,
	 *  2026-09-30, this file's own doc), and a collapsed height is never
	 *  remembered — every fresh open starts at the sheet's normal size, never
	 *  stuck one line tall (that was the earlier bug this deliberately avoids
	 *  repeating). 84px clears one real composer row (min-height 2.4em, `~1em`
	 *  body font, plus its own padding) on every phone this shipped to. */
	collapse_h(){ return 84; }

	/** The phone sheet collapses to one line (the owner, 2026-09-30: "a resizable
	 *  sheet that can collapse to one line"). Dragged low, it used to CLOSE —
	 *  vanish outright, same as dragging past `close_at` still does a little
	 *  further down. This state sits between the two: still open, still one tap
	 *  away from typing or tapping the mic, just not showing the thread. */
	collapse(){
		this.el.classList.remove("drawer-rail-sheet-full");
		this.el.classList.add("drawer-rail-sheet-collapsed");
		this.size_to(this.collapse_h() + "px");
		return this;
	}

	settle(h){
		const H = innerHeight;
		if (h >= H * this.full_at) return this.rail ? this.rail.to("full").then(() => this.state("full")) : this.state("full");
		if (h <= this.collapse_h() + 4) return this.collapse();
		if (h < H * this.close_at) return this.rail ? this.rail.to("closed") : this.hide();
		this.remember_height(this.clamp_height(h));
		return this.rail?.mode === "full" ? this.rail.to("open") : this.state("open");
	}

	size_to(h){
		this.ac("drawer-rail-sheet-sized");
		this.style("--sheet-h", h);
	}

	/** "open" (its own height) or "full" (the whole screen). */
	state(mode){
		this.el.classList.toggle("drawer-rail-sheet-full", mode === "full");
		this.el.classList.remove("drawer-rail-sheet-collapsed");   // "open"/"full" both leave the one-line state
		mode === "full" ? this.size_to("100dvh") : this.size();
		return this;
	}

	showing(){ return this.el.classList.contains("on"); }

	/** ✕ — closes the sheet the way the phone's back does, through history. Keeps the
	 *  mic running either way (mic-keeps-running, 2026-10-01) — see `DrawerRailSheetChat.
	 *  hide()`'s own doc for why closing is no longer "stop the mic". */
	close(){
		return this.rail ? this.rail.to("closed") : Promise.resolve(this.hide({ keep_mic: true }));
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
		this.el.classList.remove("drawer-rail-sheet-collapsed");   // every real (re)open leaves the one-line state
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

/** THE PANEL SHEET — the new default (`Widget`, `ux/Dictate/Widget.js`, round 3 of
 *  `ai/2026-09-30/audio-consolidate/`): the exact same bubbles-plus-composer-plus-mic
 *  widget the desktop drawer's AI tab now builds too (`ext/drawer/tabs/ai.js`), instead
 *  of a second hand-wired mic-only build — "we need a consistent chat widget… whether
 *  it's in a desktop sidebar or a mobile sheet" (the owner, 2026-09-29; `ChatPanel`
 *  (`ext/Chat/ChatPanel.js`) answered that call first, `Widget` replaces it here once
 *  `ux/Dictate` grew its own `deliver`/`history`/`say`/`sync` hooks for the job — no
 *  second composer implementation left). Everything else `DrawerRailSheetV1` gave the
 *  sheet is kept: the mic starts listening the instant the sheet opens (`start_mic()`,
 *  called from `open()`), every finished sentence still shows as its own bubble — and
 *  the links footer (inherited from `DrawerRailSheet`) still reaches Sessions,
 *  Dictation, Settings and the full drawer.
 *
 *  `--chatbox-panel-max: 70vh` (rail.css) — the sheet itself is already capped
 *  at `max-block-size: 70vh` (rail.css, pre-existing), so the panel can just use
 *  that whole ceiling; there is no separate drawer-style approximation to make.
 *
 *  ⚠ A card CHANGE (the reader keeps the sheet open while navigating to a
 *  different card) rebuilds the panel whole, which restarts its mic for a beat —
 *  a known, accepted trade, not a bug to chase here: `Widget` owns its thread,
 *  composer and mic as ONE piece on purpose, so there is no seam to swap only the
 *  log's source without giving the widget a second, larger API than it needs.
 *  `start_mic()` restarts listening right after every rebuild, so the gap is a
 *  beat, never a silence.
 *
 *  `Widget` now has the same `answer`/`marks` seam `ChatPanel` did (restored round 4,
 *  `ai/2026-09-30/audio-consolidate/minion-wire/`): the resume offer below
 *  (`offer_resume()`) calls `panel?.say({type: "ask", ...})`, `Widget` draws it as a
 *  choice-button card, and a tap calls `on_resume_choice()` below, same as before the
 *  widget swap. `Session.resume` still has to be live for the offer to ever show
 *  (`offer_resume()`'s own gate) — that part is unchanged. */
export class DrawerRailSheetPanel extends DrawerRailSheet {
	// The resize handle is inherited behaviour, not the widget's own — `handle()`,
	// `size()` and the storage helpers all live on `DrawerRailSheetV1` (this
	// class's own grandparent) and don't care what fills the sheet below them,
	// only the sheet's OWN box (`this.el`, `this.style`). This class overrides
	// `render()`/`open()`/`close()` wholesale (no `super.render()`/`super.open()`
	// call — `Widget`'s `$slot` replaces V1's `$thread`/`$mic` entirely), so
	// without restating these two calls here the resize handle would silently
	// stop reaching the sheet everyone actually uses (`DrawerRail.Sheet` below)
	// the moment this class landed — caught merging grip-everywhere against this
	// same day's voice-sessions work, not written against it originally.
	render(){
		this.head();
		this.handle();
		// THE PAGE'S INBOX (page-inbox, 2026-09-30), just above the widget — the same
		// notes the desktop drawer's AI tab shows (`ext/drawer/tabs/ai.js`), so a note
		// left for this page is seen here too, not only on a desktop screen.
		new Inbox.Compact({ page: drawer.page() }).view();
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

	/** `keep_mic: true` (the ✕, the drag down, the phone's back — a real close, not the
	 *  breakpoint-widen case) leaves the mic running: `DrawerRailSheetChat.hide()`'s own
	 *  doc has the full reasoning, which applies here the same way. */
	hide({ keep_mic = false } = {}){
		if (!keep_mic) this.stop_mic();
		this.rc("on");
		return this;
	}

	stop_mic(){ this.panel?.stop_mic(); }

	// Not while `quiet` — a sheet the url reopened (a reload, the phone's
	// forward) waits for the reader to tap the mic.
	start_mic(){
		if (this.quiet) return;
		this.panel?.start_mic();
	}

	// Every real in-app route change while a session is open, reported once
	// (`nav()`) — a no-op until a session actually exists (deliverable 2: a route
	// change alone never starts one; true for a card's session too, round 4).
	// Deferred a tick, the same reason `tabs.js`'s
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

	/* THE CARD BRANCH IS THE SESSION PAIR NOW (round 4, `ai/2026-09-30/audio-
	 * consolidate/minion-wire/`, "ONE AI, NOT TWO" carried one step further — the
	 * owner: "the drawer on the AI 2 page … does NOT use the per-session fast and
	 * smart assistant pair … Make the AI 2 drawer and card pages use the SAME
	 * widget and the SAME session pair as the ✦ sheet"). The old card route —
	 * `card.chat_entries()` as `Widget`'s `history`, every sentence posted through
	 * `tabs/ai.js`'s `send({card})` to Servex's PROMPT LOG — is gone; a card now
	 * starts (or resumes) a real voice session, `Session.start({path, card})`,
	 * exactly like a plain page, just with its home folder pinned to the card's
	 * own (`ext/Session/Session.js`'s own doc). `build_voice_panel()`,
	 * `ensure_session()`, `voice_deliver()` and `watch_session()` below now serve
	 * BOTH branches — the only difference is `this.card_ref`, threaded through to
	 * `start()` and used to pick the placeholder text and the resume-offer route
	 * (`offer_recent()`). Until Servex is restarted with this session pair's own
	 * `card` handling, the server ignores `card` and treats it as a plain page
	 * session — the SEND still goes out and the sheet still shows it; only the
	 * "same home folder as the card" part of the wire activates on that restart
	 * (this task's own proof note). */
	sync_card(){
		const card = this.active_card();
		const id = card?.id ?? null;
		if (id === this.card_id && this.panel){ this.panel.sync(); this.start_mic(); return; }
		this.card_id = id;
		this.card_ref = card;
		this.build_voice_panel();
	}

	/* THE PANEL — one build for a plain page AND a card (round 4 merged the two):
	 * a real voice session (`ext/Session/Session.js`), never the old page-ai
	 * bridge or the card's prompt-log route. No `history` is given — `Widget.
	 * submit()` already draws the owner's own bubble at once (a local `at`);
	 * `voice_deliver()` below `retag()`s it to the server's real `at` once
	 * `say()` answers, and the session-file watch (`watch_session()`) then reads
	 * that SAME line back off disk — `own_ats` (set there, now keyed by the
	 * server `at`) is what stops the watch drawing it a second time. A reply
	 * lands the same way, through `panel.say({chat: ...})` — the EXACT universal
	 * chat line shape `ext/Session`'s own file already writes, which needs no
	 * translation. A card opened for the first time in this tab starts with an
	 * EMPTY thread (no session exists yet to read a history from) — a known,
	 * named gap, not a silent one: the card's own Overview (`ai2/card.js`) is
	 * still the permanent record; this sheet is a second way to talk into it. */
	build_voice_panel(){
		this.own_ats = new Set();
		this.force_fresh ??= false;
		this.$slot.empty(() => {
			// THE CHAT HITL SEAM (round 4, same as before) — the resume offer's line
			// (`offer_recent()`/`offer_resume()` below) shows and answers through
			// `on_resume_choice()`; every owner line also gets its ✓/`?` mark.
			this.panel = new Widget({
				placeholder: this.card_ref ? "talk into this card" : "say something",
				marks: true,
				answer: choice => this.on_resume_choice(choice),
				deliver: entry => this.voice_deliver(entry),
				// A reaction is saved as a line in the session's own log, so it survives a reload.
				threads: true,
				react: r => this.session ? react({ session: this.session, ...r }) : Promise.reject(new Error("no voice session yet, so the reaction is not saved")),
			});
		});
		this.start_mic();
		if (!this.session) this.offer_recent();
		// Measured AGAIN now the widget exists — `open()`'s own `size()` ran before
		// this had a panel at all and saw only the head and the links (voice-fixes,
		// reviewing the grip hand-merge).
		this.size();
	}

	/* THE RESUME LINE ON OPEN (voice-fixes item 5): before a word is said, this
	 * page's (or this CARD's) newest session shows as ONE tappable line, "<title>
	 * · 1 day ago". Neither call spawns anything — a plain page asks `Session.
	 * recent()`; a card asks the SAME route by hand (`GET /api/sessions?card=
	 * <id>&limit=1` — `Session.recent()` itself only takes a `page`, and it is
	 * not ours to edit to add a second query shape). A session that spoke within
	 * the hour is continued by `start()` itself on the first sentence, tapped or not. */
	offer_recent(){
		const card = this.card_ref?.id;
		const ask = card
			? fetch(servex_url(`/api/sessions?card=${encodeURIComponent(card)}&limit=1`), { cache: "no-store" })
				.then(r => r.json()).then(out => out.ok ? out.sessions : [])
			: (typeof Session.recent === "function" ? Session.recent(drawer.page(), { limit: 1 }) : Promise.resolve([]));
		const panel = this.panel;
		ask.then(([row]) => {
			if (!row || this.session || this.panel !== panel) return;
			this.offer_resume({ session: row.session, title: row.title, summary: row.summary, at: row.last_at ?? row.at });
			requestAnimationFrame(() => this.size());   // grow to show the line (a height the reader dragged to still wins)
		}).catch(() => {});
	}

	/* Read the tab's saved session first (survives a reload on the same tab, AND
	 * a "leave the card, come back" that lands on the SAME card again — `saved.
	 * card` is checked against the card open right now so a page's session is
	 * never handed to a card or vice versa); only `start()` a new one when there
	 * is none yet, or the saved one belongs to a different card/page — and only
	 * EVER called from `voice_deliver()`, itself only called once a sentence has
	 * actually finished, so opening the sheet or pressing "New session" alone
	 * never starts one (deliverable 2: `start()` spawns two real agents, about
	 * 600 MB, so it happens on the FIRST SENTENCE ONLY). */
	async ensure_session(){
		if (this.session) return;
		const card = this.card_ref?.id ?? null;
		try {
			const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
			if (saved?.session && saved?.file && (saved.card ?? null) === card){
				this.session = saved.session; this.session_file = saved.file; this.nav_path = drawer.page();
				this.watch_session();
				return;
			}
		} catch {}
		try {
			const fresh = this.force_fresh; this.force_fresh = false;
			const made = await start({ path: drawer.page(), card, fresh });
			this.session = made.session; this.session_file = made.file; this.nav_path = drawer.page();
			try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ session: made.session, file: made.file, card })); } catch {}
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
		// A `react` line (the owner's or an assistant's tap-back) is handed over as it is.
		const draw = line => {
			if (line?.react) return void this.panel?.say({ react: line.react });
			if (!line?.chat) return;
			if (this.own_ats?.has(line.chat.at)) return;
			this.panel?.say({ chat: line.chat });
		};
		this.stop_watch = watch(this.session_file, draw);
		// dictation-stream (2026-09-30): replies stream in as they are written, and every line lands the
		// moment Servex writes it (the poll above stays, as the record); the owner's silences reach the
		// assistants as `quiet` events, which is when they answer.
		this.stop_stream?.();
		this.stop_stream = stream(this.session, ev => {
			if (ev.kind === "stream") this.panel?.stream(ev.role, ev.text);
			else if (ev.kind === "line") draw(ev.line);
		});
		this.stop_quiet ??= report_quiet(() => this.session);
	}

	forget_session(){
		this.stop_watch?.(); this.stop_watch = null;
		this.stop_stream?.(); this.stop_stream = null;
		this.stop_quiet?.(); this.stop_quiet = null;
		this.session = null; this.session_file = null;
		try { sessionStorage.removeItem(SESSION_KEY); } catch {}
	}

	/* A PLAIN page's finished sentence — `ensure_session()` starts (or resumes)
	 * one on the first sentence only, `say()` sends this one. `Widget.submit()`
	 * already drew the owner's own bubble, under a LOCAL `at`, before `deliver`
	 * (this method) even started — `retag()` rekeys it to the server's real
	 * `at` (see `watch_session()`'s own note for why that never doubles up once
	 * the poll reads the same line back). */
	async voice_deliver(entry){
		try {
			await this.ensure_session();
			if (!this.session) return false;
			const via = entry.via === "typed" ? "text" : "voice";
			// THE FLOOR (ext/Chat/doc/floor.md): `stamp()` leaves an entry that already has
			// `floor` alone, and stamps one that doesn't from the mic's live level meter.
			floor.stamp(entry);
			// A threaded reply (the panel's Reply button) carries its parent as `re` + `thread`.
			const thread = entry.thread ? { re: entry.thread, thread: true } : {};
			const r = await say({ session: this.session, path: drawer.page(), text: entry.text, via, raw: entry.raw, floor: entry.floor, cues: entry.cues, ...thread });
			this.own_ats?.add(r.at);
			this.panel?.retag(entry.at, r.at);
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
			try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ session: made.session, file: made.file, card: this.card_ref?.id ?? null })); } catch {}
			this.watch_session();
		}).catch(() => {});
	}

	/* NEW SESSION — drops the stored voice session id and stops watching it, then
	 * rebuilds a fresh, empty panel. Works the same on a plain page AND a card
	 * now (round 4: both are a real session — see `sync_card()`'s own doc above);
	 * it does NOT `start()` a new session here (that would spawn two agents on a
	 * tap nobody has said anything into yet). The next sentence said is what
	 * actually calls `start()`, through `voice_deliver()` → `ensure_session()`. */
	new_session(){
		this.forget_session();
		this.force_fresh = true;   // the next sentence's ensure_session() must not resume the last hour's session
		this.build_voice_panel();
	}
}

/** THE SHEET, ONE SYSTEM WITH THE DESKTOP DRAWER (one-dictation, 2026-09-30 — CLAUDE.md
 *  law 6, "one of everything; don't repeat yourself"): every line above `DrawerRailSheetPanel`
 *  (the resize handle, the head, the folded "More" links, the page's own inbox) is kept
 *  exactly as it was — `DrawerRailSheetPanel` itself is untouched, still reachable, still
 *  what an older link (`DrawerRail.SheetPanel`, below) builds. This class replaces only the
 *  PANEL: instead of `build_voice_panel()`/`ensure_session()`/`watch_session()`/
 *  `voice_deliver()`/`offer_resume()` — a whole private copy of the session pair — it calls
 *  `ux/Dictate/chat.js`'s ONE `chat()` mount, the exact same call the desktop drawer's AI
 *  tab (`tabs/ai.js`) now makes. `chat.js` owns the session (global, one per browser tab,
 *  never keyed by this sheet's own card), the full-history watch, the live stream and the
 *  resume offer — this class only shows, hides, sizes and closes the box around it, and
 *  tells `chat.js` about a navigation (`sync_card()`/`navigated()`, below) so a route change
 *  while the sheet stays open is reported once, from there, not from every open mount. */
export class DrawerRailSheetChat extends DrawerRailSheetPanel {
	render(){
		this.head();
		this.handle();
		new Inbox.Compact({ page: drawer.page() }).view();
		this.$slot = div.c("drawer-rail-sheet-panel");
		this.$links = this.links().ac("drawer-rail-sheet-links-folded");
	}

	// One `chat()` call for the sheet's whole life, the first time it is shown — same
	// "built once, kept" rule `sheet()` (`DrawerRail`, above) already gives this whole
	// class. `card_ref` is read once, here: `chat()`'s own `card` option is only a hint
	// for the session's very FIRST sentence ever (see `chat.js`'s own doc) — a card
	// picked later is carried by `sync_card()`'s `nav()` call below, same as a plain
	// page move.
	ensure_mount(){
		if (this.mount) return this.mount;
		this.card_ref = this.active_card();
		this.mount = chat(this.$slot.el, {
			path: drawer.page(),
			card: this.card_ref?.id,
			placeholder: this.card_ref ? "talk into this card" : "say something",
		});
		this.panel = this.mount.panel;
		return this.mount;
	}

	show({ listen = true } = {}){
		this.quiet = !listen;
		this.ac("on");
		this.update_path();
		this.ensure_mount();
		this.sync_card();
		this.start_mic();   // inherited from `DrawerRailSheetPanel` — a no-op while `this.quiet`
		this.size();
		return this;
	}

	/** Hide the sheet's BOX — the widget and its mic stay exactly as they were
	 *  (mic-keeps-running, 2026-10-01 — the owner: "I don't necessarily like that
	 *  closing it stops recording"). Before this, EVERY hide (✕, drag down, the phone's
	 *  back, even just the window widening past 52em) called `stop_mic()`, because the
	 *  old mic-only sheet (`DrawerRailSheetV1`) used to throw its whole mic+thread away
	 *  on close and a live `Dictate` taken off the page stops itself anyway — so stopping
	 *  it on the way out looked like nothing lost. It no longer is: this class's own
	 *  widget (`this.panel`, built once by `ensure_mount()`) stays mounted in the DOM the
	 *  whole time the sheet is hidden — `rc("on")` is a CSS class, not a removal — so the
	 *  mic the owner just started keeps listening and keeps posting into the SAME global
	 *  conversation (`chat.js`'s `GLOBAL` session) whether the sheet is open or not; the
	 *  owner can keep talking with the sheet closed and see it land on reopening it, or on
	 *  the desktop drawer's own AI tab, which shares that same session.
	 *
	 *  `keep_mic: false` (the default, unchanged) is still used for the ONE case this was
	 *  never about: the window widening past 52em makes the sheet itself unreachable
	 *  (`DrawerRail.watch_breakpoint()`), so its mic is still released there, same as the
	 *  mic-hijack rule already does when the whole PAGE goes hidden
	 *  (`ux/Dictate/Dictate.js`'s own `LIVE`/`visibilitychange` — untouched by this; that
	 *  rule still stops every live `Dictate` the instant the tab itself is hidden or
	 *  navigated away from, this sheet's mic included). */
	hide({ keep_mic = false } = {}){
		if (!keep_mic) this.stop_mic();
		this.rc("on");
		return this;
	}

	// The card under the sheet can change while it stays open (the reader navigates
	// without closing it) — the conversation itself never rebuilds for that any more
	// (`chat.js`'s session is GLOBAL), so this only remembers the new card for later and
	// tells the controller where the reader is now, through the ONE `nav()` seam.
	sync_card(){
		this.card_ref = this.active_card();
		this.mount?.nav(drawer.page(), this.card_ref?.id ?? null);
	}

	navigated(){
		this.mount?.nav(drawer.page(), this.active_card()?.id ?? null);
	}

	// THE SHARED BUTTON (item 3, one-dictation — "a New session button lives in
	// chat.js, so every surface gets the same one"). `chat_new_session_button()`
	// calls `this.mount.reset()` on click, which is exactly what this class's old
	// `new_session()` override did by hand (`chat.reset()` — a `keep: true` mount's
	// own `reset()` IS `chat.reset()`); that override is gone now, replaced by this
	// one button method (`DrawerRailSheet.new_session()`, the CARD-page route, is
	// untouched — a plain page's sheet never calls it). The sheet's own look
	// (`rail.css`'s `.drawer-rail-sheet-link`) is kept by adding those classes onto
	// the shared button, not by styling a second one.
	new_session_button(){
		// `() => this.mount`, not `this.mount` — this button is built in `render()`,
		// before `show()`'s own `ensure_mount()` has built the mount at all; the thunk
		// reads it fresh at click time instead of capturing `undefined` forever.
		return chat_new_session_button(() => this.mount)
			.ac("drawer-rail-sheet-link drawer-rail-sheet-new")
			.attr("title", "Clear this sheet and start a fresh conversation");
	}
}

// Where a released drag settles, as a share of the screen: at or above `full_at`
// the sheet becomes the full-height page; below `close_at` it closes.
DrawerRailSheetV1.prototype.full_at = 0.85;
DrawerRailSheetV1.prototype.close_at = 0.28;

DrawerRail.Sheet = DrawerRailSheetChat;
DrawerRail.SheetPanel = DrawerRailSheetPanel;   // the private-session-pair version this replaced — kept reachable, unchanged
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
