import { View, div, span, button, select, option, label, textarea } from "../../core/View/View.js";
import Dictate, { remember_device, remembered_device } from "./Dictate.js";
import { pg } from "./playground/Playground.js";
import { marks as fetch_marks } from "../Understand/Understand.js";
import { md_into } from "../../ext/Chat/md.js";
import { who_label } from "../../ext/Chat/roles.js";
import { speak, patch_piece, retag_piece } from "../../ext/Chat/Chat.js";
import { composer } from "../../ext/Chat/Composer.js";

View.stylesheet(import.meta, "Widget.css");

/** The model the reader picked, moved here from `ext/drawer/tabs/ai.js` (round 3,
 *  2026-09-30 — "find the drawer's current model switcher and move it into the Widget")
 *  so `Widget`'s own `models` option can draw it without `ux/Dictate` reaching UP into
 *  `ext/drawer`. `ai.js` now imports `{ model, MODELS }` from here instead of owning them. */
export const MODELS = ["haiku", "sonnet", "opus", "fable"];
const MODEL_KEY = "lew42-drawer-model";
export function model(value){
	try {
		if (value) localStorage.setItem(MODEL_KEY, value);
		return localStorage.getItem(MODEL_KEY) || "sonnet";
	} catch { return value || "sonnet"; }
}

/**
 * **ONE dictation widget, the same everywhere** (the owner, 2026-09-30, from the phone:
 * "the button is so far down the page… the actual transcription is below another
 * paragraph or two"). This IS the ✦ sheet's own compact widget — a framed card, bubbles
 * on top, a composer row at the bottom (a typed box, the mic, Send) — pulled into its own
 * class so the sheet, the desktop drawer and the Dictate page all build the SAME thing,
 * configured instead of copied:
 *
 *     new Widget();                                   // just bubbles + the composer row
 *     new Widget({ level: true, source: true });       // + a tiny level meter, + a mic picker
 *     new Widget({ debug: true });                     // + the "Debug ▾" bar (below the card)
 *     new Widget({ revision: "edit" });                 // ux/Revise tidies each sentence too
 *     new Widget({ models: true });                     // + the model picker above the thread
 *
 * **Six options, each a plain property** (default `false`/off, so the smallest call —
 * `new Widget()` — draws exactly what the sheet already showed, nothing more):
 * - `level` — a small level meter right beside the mic button.
 * - `source` — a compact `<select>` of audio input devices.
 * - `debug` — a small "Debug ▾" toggle below the card (the playground's own tabs, reused).
 * - `revision` — `"clean" | "edit" | "summary" | false`, forwarded to `Dictate`'s `revise`.
 * - `models` — the model picker (`model()`/`MODELS` above) shown over the thread. ON in the
 *   desktop drawer's AI tab, OFF in the ✦ sheet (the owner, round 3: "shown in the desktop
 *   drawer, off in the sheet").
 *
 * **Wiring a real conversation through it** — three more properties, all optional, all
 * `null`/off by default so the plain `new Widget()` the Dictate page uses is unaffected:
 * - `history()` — a function returning this thread's already-saved lines (the universal
 *   chat line shape, `{at, from:{kind}, text, via}` — `ext/Chat/readme.md`), drawn once,
 *   on mount. `sync()` (below) re-reads it.
 * - `deliver(entry)` — `async (entry) => ok`, `entry` is `{text, via}`. Called once a
 *   sentence (typed or dictated) is ready to go out; the widget has ALREADY drawn it as
 *   the owner's own bubble (optimistic, same reasoning as the sheet's old `echo()`) by the
 *   time this runs. A reply is the caller's own job — call `widget.say({chat:{...}})` from
 *   inside `deliver` once it has one (exactly how `ext/drawer/tabs/ai.js`'s own `deliver`
 *   already called `panel.say(...)`; only the object changed). `deliver` resolving falsy
 *   marks the bubble "not sent".
 * - `on_text(text)` — fires the moment a sentence is ready (before `deliver`) — for a hint
 *   line a caller wants to hide the first time something is said, same as `ChatPanel`'s.
 *
 * **The Chat HITL seam** (restored round 4, `ai/2026-09-30/audio-consolidate/minion-wire/`
 * — the widget swap had dropped this, `ChatPanel`'s own doc on `rail.js` named the gap):
 * - `answer(choice)` — same contract `ChatPanel` had: call `widget.say({type: "ask",
 *   heading, text, choices, at})` to show a question with buttons (the resume offer in
 *   `rail.js` is the one caller today); a click disables the buttons, marks the pick, and
 *   calls `answer(choice)` so the caller does whatever "yes" means.
 * - `marks: true` — after each of the OWNER'S OWN bubbles, asks `ux/Understand`'s `marks()`
 *   in the background and adds a small ✓/`?` beside it (ok / unclear). Off by default
 *   (`false`), same as `ChatPanel`'s own `marks` option.
 *
 * `say(entry)` and `sync()` are public methods — see their own doc below.
 *
 * **`v1: true` ONLY — the live guess is `Dictate`'s own caption, not a second copy of it**
 * — the exact trick `ext/drawer/rail.css` used for the sheet before this task: `mode: "open"`
 * makes `Dictate` draw one `.ux-dictate-line` per settled sentence plus one `.ux-dictate-line
 * .muted` for the still-moving guess; `Widget.css` hides the settled ones (this widget's
 * own bubbles already show them) and leaves the muted guess line showing, right under the
 * mic button. The DEFAULT composer (`Widget.Composer`, below) writes the still-moving guess
 * straight into the SAME text box the owner can type into instead — see that class's own doc.
 *
 * **Wired into the ✦ sheet and the desktop drawer's AI tab** (round 3, 2026-09-30, once
 * voice-sessions-2 merged) — `ext/drawer/rail.js`'s `DrawerRailSheetPanel` and
 * `ext/drawer/tabs/ai.js` both build `Widget` now instead of `ChatPanel`
 * (`ext/Chat/ChatPanel.js`), through `deliver`/`history`/`say`/`sync` above — no second
 * composer implementation left on either surface. The session PAIR itself
 * (`ext/Session/Session.js`'s `start`/`say`/`floor`/`nav`/`watch`) still lives in
 * `rail.js`, unchanged in shape — this widget only had to grow the three hooks above for
 * that orchestration to plug into it instead of `ChatPanel`. `ext/Chat/ChatPanel.js` is
 * untouched and still used by `ext/Chat/drill/` and its own demo — not deleted, just no
 * longer the drawer's own composer.
 *
 * Parts as static subclasses (the `code` skill, §3) — `Widget.Thread` (the bubbles),
 * `Widget.Composer` (the bottom row), `Widget.Models` (the picker) and `Widget.Debug`
 * (the collapsed toggle below the card). A caller that wants a different bubble shape
 * overrides `Thread` alone; everything else — the engines, the errors, `revise`'s own
 * timing — stays `Dictate`'s.
 *
 * **Built from `ext/Chat`'s own parts now, not a second copy of them** (one-dictation,
 * 2026-10-01 — CLAUDE.md law 6, "one of everything"; the owner: "the chat bubbles before
 * were actually pretty good… these chat bubbles are [not]"). `Widget.Thread` draws every
 * bubble through `ext/Chat/Chat.js`'s own `speak()` — the exact function that already
 * joins a sentence onto the last bubble as a new paragraph when the same sender spoke
 * again within `MERGE_GAP_MS` (10s), instead of this widget opening a new bubble per
 * sentence. `Widget.Composer` is `ext/Chat/Composer.js`'s own composer — Whisper types
 * into the SAME text box the owner can type into, with the mic, Send and settings gear
 * folded underneath it (`Composer.js`'s own doc). `Widget`'s own public surface (`submit`,
 * `sync`, `stream`, `draw`, `mark`, `mark_failed`, `retag`, `reset`) is unchanged, so
 * `ux/Dictate/chat.js` and everything that calls it needs no change at all.
 *
 * **`v1: true`** keeps the OLD thread and composer reachable — `Widget.ThreadV1` (one
 * bubble per sentence, never merged) and `Widget.ComposerV1` (Dictate's own `mode: "open"`
 * mic, nothing ever typed into the box) — a plain switch back if the new ones regress
 * something; never deleted, just no longer the default.
 */
export default class Widget extends View {

	render(){
		this.ac("ux-dictate-widget flex v gap");
		const Thread = this.v1 ? this.constructor.ThreadV1 : this.constructor.Thread;
		const Composer = this.v1 ? this.constructor.ComposerV1 : this.constructor.Composer;
		div.c("ux-dictate-widget-card card pad flex v gap", () => {
			if (this.models) new this.constructor.Models({ widget: this });
			new Thread({ widget: this });
			new Composer({ widget: this });
		});
		if (this.debug) new this.constructor.Debug({ widget: this });

		if (typeof this.history === "function")
			(this.history() ?? []).forEach(chat => this.$thread?.draw({ chat }));

		// The headless-test seam, same pattern as `playground/page.js`'s own
		// `globalThis.$dictate_pg` — the last widget built on the page wins, which is
		// fine for a proof script that only ever mounts one at a time.
		globalThis.$dictate_widget = this;
	}

	// Called by `Composer`'s own `Dictate` instance (`on_text`/`on_revised`), and by
	// `Composer`'s own typed Send — routed through the widget, not straight into `Thread`,
	// so a caller overriding `Thread` alone still gets every sentence without also having
	// to know how `Composer` is wired. Goes out through `deliver` when the caller wired
	// one; otherwise it's just a local bubble, today's plain-`Widget()` behaviour.
	submit(text, via){
		this.on_text?.(text);
		const at = new Date().toISOString();
		this.$thread?.draw({ chat: { at, from: { kind: "owner" }, via, text } });
		if (typeof this.deliver !== "function") return;
		// `at` rides along on `entry` too — a caller whose own server answers with a
		// DIFFERENT, authoritative `at` (the session pair's own `say()`, `rail.js`) calls
		// `retag(entry.at, real_at)` to rekey the bubble already drawn here, so a later
		// `fix`-update or a dedup check (a watched file reading the same line back) finds
		// the right one instead of drawing a second bubble.
		const entry = { text, via, at };
		Promise.resolve(this.deliver(entry)).then(ok => { if (!ok) this.$thread?.mark_failed(at); });
	}

	/** The NEW composer's own `deliver` (`ext/Chat/Composer.js`'s `entry` shape:
	 *  `{text, via, at?, raw?, level?}` — `via` is `"typed"` for a typed Send, `"whisper"` for a
	 *  dictated chunk). Same optimistic-echo-then-deliver-then-retag dance as `submit()` above,
	 *  just reading a real entry instead of building one from a bare string, so `raw`/`level`
	 *  (the clean-transcription pair) ride along untouched to whatever this widget's own
	 *  `deliver` option does with them (`ux/Dictate/chat.js`'s `Session.say()`). Returns
	 *  true/false — `composer()` reads it for its own "sent"/"nothing was sent" note; `true`
	 *  with no `deliver` wired at all (today's plain `new Widget()`) because the bubble is
	 *  drawn either way, which already counts as "sent" for a caller with nowhere further to
	 *  deliver to. */
	submit_entry(entry){
		const at = entry.at ?? new Date().toISOString();
		this.$thread?.draw({ chat: { at, from: { kind: "owner" }, text: entry.text, via: entry.via } });
		if (typeof this.deliver !== "function") return true;
		const full = { ...entry, at };
		return Promise.resolve(this.deliver(full)).then(ok => { if (!ok) this.$thread?.mark_failed(at); return ok; });
	}

	/** Rekey a bubble `submit()` already drew under a LOCAL `at` to the real one a
	 *  caller's server answered with — see `submit()`'s own note. A no-op if `old_at`
	 *  isn't found (already retagged, or the thread moved on). */
	retag(old_at, new_at){ this.$thread?.retag(old_at, new_at); }

	/** A line from ELSEWHERE — a reply streaming in, a saved line a `history()` reload
	 *  missed, the same universal chat line shape `ext/Chat` already uses:
	 *  `{chat: {at, from: {kind: "owner"|"assistant"}, text, via, fix}}`. `fix: true`
	 *  updates the bubble already drawn for that same `at` in place (a streamed reply
	 *  growing token by token) instead of adding a new one — `ChatPanel.say()`'s own rule,
	 *  kept so a caller moving from `ChatPanel` to this class changes nothing but the
	 *  object it calls it on. */
	say(entry){ this.$thread?.draw(entry); }

	/** Re-reads `history()` (if the caller gave one) and redraws the thread from scratch —
	 *  for when the thread this widget shows has CHANGED under it (the sheet's own
	 *  `sync_card()`, a card page's `sync_global_ai()`), not for a single new line (`say()`
	 *  above is for that). A no-op with no `history()` — a caller driving the thread
	 *  entirely through `say()` never needs this. */
	sync(){
		if (typeof this.history !== "function") return;
		this.$thread?.reset();
		(this.history() ?? []).forEach(chat => this.$thread?.draw({ chat }));
	}

	/** Clear the thread back to its empty state, drawing nothing back in — for a caller
	 *  that drives the thread entirely through `say()` (`ux/Dictate/chat.js`'s own
	 *  `watch()`-fed mounts) and needs to wipe it before redrawing a DIFFERENT session's
	 *  history from scratch. `sync()` (above) is for a caller with a `history()` function;
	 *  this is the same first half, with no second half for a caller that has none. */
	reset(){ this.$thread?.reset(); }

	/** An assistant's reply while it is STILL being written — the whole text so far,
	 *  redrawn each call (`ext/Session/Session.js`'s `stream()`, dictation-stream,
	 *  2026-09-30, merged into this widget round 4). A fixed, made-up `at`
	 *  (`"stream:" + who`) means every call for the SAME speaker updates one bubble in
	 *  place instead of adding a new one per token — `Thread.draw()` now keeps this
	 *  bubble OUT of `speak()`'s own merge tracking entirely (review finding 2,
	 *  2026-10-01: feeding it through `speak()` let the REAL, settled reply from the
	 *  SAME sender, landing within `MERGE_GAP_MS`, merge straight into the stream's own
	 *  bubble, and the next `fill()` then overwrote the growing text with its own first,
	 *  stale chunk). `Chat.js`'s own `stream()`/`live_bubble()`/`drop_live()` keep the
	 *  exact same split for the full `chat()` factory; `Thread` below keeps a small
	 *  `lives` map of its own for the same reason, since `speak()` alone has no such
	 *  concept. The live bubble is dropped — never merged — the instant a real line for
	 *  that sender lands; `text: ""` drops it with nothing to replace it (the stream
	 *  simply ended with no reply). Missing this method entirely was a crash waiting to
	 *  happen: `rail.js`'s `watch_session()` already calls `panel?.stream(...)` on every
	 *  SSE token once `ext/Session`'s own live wire is merged in, and `panel?.stream(...)`
	 *  throws (not a silent no-op) the moment `panel` exists but has no `stream` of its
	 *  own. */
	stream(who, text){
		if (!text) return;
		this.$thread?.draw({ chat: { at: "stream:" + who, from: { kind: "assistant", id: who }, text, fix: true } });
	}

	/** Whether the mic is live right now — `panel.compose.mic.active()`'s replacement for
	 *  a caller that used to reach into `ChatPanel`'s own composer (`ext/drawer/rail.js`'s
	 *  `stop_mic()`/`start_mic()`). */
	mic_active(){ return this.dictate?.state === "listening" || this.dictate?.state === "connecting"; }
	start_mic(){ if (!this.mic_active()) this.dictate?.start(); }
	stop_mic(){ if (this.mic_active()) this.dictate?.stop(); }
}

Widget.prototype.level = false;      // a second, bigger level meter beside the mic
Widget.prototype.source = false;     // show the audio-source (mic) picker
Widget.prototype.debug = false;      // show the collapsed "Debug ▾" bar
Widget.prototype.revision = false;   // "clean" | "edit" | "summary" | false — Dictate's own `revise`
Widget.prototype.models = false;     // show the model picker above the thread
Widget.prototype.history = null;     // () => past lines, drawn once on mount — see class doc
Widget.prototype.deliver = null;     // async (entry) => ok — see class doc
Widget.prototype.on_text = null;     // (text) => … — fires the moment a sentence is ready, before `deliver`
Widget.prototype.answer = null;      // (choice) => … — a choice-button question's pick (`say({type:"ask",...})`)
Widget.prototype.marks = false;      // show a ✓/`?` beside each of the OWNER'S OWN bubbles (`ux/Understand`)
Widget.prototype.v1 = false;         // true = the OLD thread (one bubble per sentence) + composer (Dictate's own open mic)

/** **THE OLD THREAD** (`v1: true`) — one bubble per line, drawn with this widget's own
 *  markup, never merged even when the same sender speaks again right away. Kept reachable
 *  so a regression in the new `Widget.Thread` below (built from `ext/Chat/Chat.js`'s own
 *  `speak()`) has a plain switch back. Untouched since it was built — see `Widget.Thread`,
 *  right below this class, for the one every caller gets by default now. */
Widget.ThreadV1 = class WidgetThreadV1 extends View {
	render(){
		this.ac("ux-dictate-widget-thread flex v gap");
		this.widget.$thread = this;
		this.lines = new Map();   // at -> {$bubble, $text}
		this.$empty = div.c("ux-dictate-widget-empty muted", "Say something — it shows up here as its own bubble.");
		this.$bubbles = div.c("ux-dictate-widget-bubbles flex v gap");
	}

	/** `{chat: {at, from, text, via, fix}}` — `fix: true` updates the line already drawn
	 *  for that `at` (a streamed reply growing in place); otherwise a new bubble. `at` is
	 *  made up when a caller never gave one (`Widget.submit()`'s own local echo). Or
	 *  `{type: "ask", heading, text, choices, at}` — a choice-button question (below). */
	draw(entry){
		if (entry?.type === "ask") return this.draw_ask(entry);
		const chat = entry?.chat;
		if (!chat?.text) return;
		this.$empty.hide();
		const at = chat.at ?? new Date().toISOString();
		const assistant = chat.from?.kind === "assistant";
		const existing = chat.fix && this.lines.get(at);
		// MARKDOWN IN REPLIES (minion-polish, item 4, 2026-09-30 — the owner: a reply
		// showed raw backticks around a path instead of `code`). `md_into` is the
		// exact function `ext/Chat`'s own bubbles already render with (`Chat.js`'s
		// `para()`) — reused here, not rebuilt, so a link, a bold word or a `path`
		// reads the same everywhere the site shows a chat line. `inline: true`: a
		// bubble is one short line, never a wrapped paragraph block.
		if (existing){ md_into(existing.$text.el, chat.text, true); return; }

		let $bubble, $text;
		this.$bubbles.append(() => {
			$bubble = div.c("ux-dictate-widget-bubble card pad" + (assistant ? " ux-dictate-widget-bubble-assistant" : ""), () => {
				// ICONS ON THE BUBBLES (minion-polish, item 5, 2026-09-30 — the owner:
				// the bubbles "used to have icons"). `who_label` is `ext/Chat/roles.js`'s
				// own small round avatar (reused whole, not rebuilt — CLAUDE.md law 6):
				// 👤 for the owner's own words, 💬 for a reply, floated at the bubble's
				// own start so the text begins on the same line beside it (`Widget.css`'s
				// matching float rule, copied from `ext/Chat/Chat.css`'s identical one).
				who_label(chat.from?.id ?? (assistant ? "assistant" : "owner"));
				$text = span();
				md_into($text.el, chat.text, true);
			});
		});
		this.lines.set(at, { $bubble, $text });
		this.$bubbles.el.scrollTop = this.$bubbles.el.scrollHeight;
		// THE CHAT HITL MARK (`widget.marks`, restored round 4) — only for the OWNER'S
		// OWN line, same rule `ChatPanel`'s `mark_owner_piece()` used. Asked once, in the
		// background; a small ✓/`?` lands beside the text whenever the answer comes back,
		// never blocking the bubble from showing at once.
		if (!assistant && this.widget.marks) this.mark(chat.text, $bubble);
	}

	/** A QUESTION FOR YOU — same shape and rule as `ChatPanel`'s own `ask()` (`ext/Chat/
	 *  Chat.js`, out of this task's fence so not imported directly): a heading, the
	 *  question text, one button per choice. A click disables every button, marks the
	 *  pick, and calls `widget.answer(choice)` — the caller's business what a "yes" does. */
	draw_ask(e){
		this.$empty.hide();
		const choices = e.choices?.length ? e.choices : ["Yes", "No"];
		let $q;
		this.$bubbles.append(() => {
			$q = div.c("ux-dictate-widget-bubble card pad ux-dictate-widget-bubble-assistant ux-dictate-widget-ask", () => {
				if (e.heading) div.c("ux-dictate-widget-ask-heading", e.heading);
				if (e.text) span(e.text);
				div.c("ux-dictate-widget-choices flex wrap gap", () => {
					choices.forEach(c => button.c("ux-dictate-widget-choice").attr("type", "button").text(c).click(() => {
						if ($q.el.classList.contains("answered")) return;
						$q.ac("answered");
						[...$q.el.querySelectorAll(".ux-dictate-widget-choice")].forEach(b => {
							b.disabled = true;
							if (b.textContent === c) b.classList.add("picked");
						});
						this.widget.answer?.(c);
					}));
				});
			});
		});
		this.$bubbles.el.scrollTop = this.$bubbles.el.scrollHeight;
	}

	/** `ux/Understand`'s own `marks()`, reused, never rebuilt here — asks once, adds a
	 *  small ✓ (`ok`) or `?` (`unclear`) right after the bubble's own text. Deliberately
	 *  simpler than `ChatPanel`'s version: no clarify-card loop-back
	 *  (`ux/Content/Decision`) — this widget's thread has no seam for a `place` card yet,
	 *  and nothing in this task's proof needs one; `readme.md` names this as the open
	 *  gap a caller wanting the full loop-back would need to add. */
	mark(text, $bubble){
		fetch_marks([text]).then(out => {
			const m = out?.marks?.[0];
			if (!m) return;
			$bubble.append(() => span.c("ux-dictate-widget-mark muted", m.mark === "unclear" ? " ?" : " ✓").attr("title", m.purpose ?? ""));
		}).catch(() => {});
	}

	mark_failed(at){
		const line = this.lines.get(at);
		if (!line) return;
		line.$bubble.append(() => span.c("muted ux-dictate-widget-failed", " — not sent"));
	}

	retag(old_at, new_at){
		const line = this.lines.get(old_at);
		if (!line || old_at === new_at) return;
		this.lines.delete(old_at);
		this.lines.set(new_at, line);
	}

	// Still the shape `Dictate`'s own `on_text`/`on_revised` call with just a string —
	// `Widget.submit()` is the normal path now (it also fires `on_text`/`deliver`), but
	// this stays as the plain local-only add a caller with none of the new hooks gets.
	add(text){ this.draw({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, text } }); }

	reset(){
		this.lines = new Map();
		this.$bubbles.empty();
		this.$empty.show();
	}
};

/** **THE THREAD** — every bubble drawn through `ext/Chat/Chat.js`'s own `speak()` (one-
 *  dictation, 2026-10-01: "the conversation is `ext/Chat`" — CLAUDE.md law 6, one of
 *  everything). `speak()` is the exact function the ✦ sheet's real chat log already
 *  calls: a sentence from the SAME sender as the bubble at the end of the thread, less
 *  than `MERGE_GAP_MS` (10s) after it, joins that bubble as a new paragraph instead of
 *  opening a second one — so three sentences said one after another read as ONE bubble,
 *  not three. Importing `speak` from `Chat.js` also loads `Chat.css`, so these bubbles
 *  are the SAME `chatbox-you`/`chatbox-reply` look (the soft tinted background, the
 *  round avatar) every other chat surface on the site already uses — the orange-bordered
 *  look the owner didn't like is `Widget.ThreadV1`'s now, not this one's.
 *
 *  This class keeps the lower-level `speak()` (plus `mergeable()`, called inside it) on
 *  purpose, not the whole `chat()` factory: `chat()` owns its OWN container, its OWN
 *  source-of-truth log and its OWN selection/reaction/thread/drill wiring, none of which
 *  this widget needs or has a `source()` for — `speak()` is `chat()`'s own bubble-drawing
 *  primitive, reused here with `Widget`'s existing `say()`/`sync()`/`reset()` still doing
 *  what they always did. `refine()` (splitting a merged bubble into paragraphs by what
 *  the fast assistant decides) is NOT used here — that is a separate, later task
 *  (`readme.md`'s "Not this merge").
 *
 *  **The ✓/? mark, the 🎤/⌨ via mark and the "— not sent" flag all survive a later merge**
 *  (one-dictation, review finding 1 and 6, 2026-10-01 — the first cut of this class bolted
 *  them straight onto the DOM node it had just drawn, and the next sentence's merge called
 *  `speak()`'s own `fill()`, which redraws every piece from ITS stored state and wipes
 *  anything bolted on from outside). `speak()` now takes `via`, `mark` and `failed` as
 *  options and stores them ON THE PIECE, same as `chat()`'s own `put_line()` already does
 *  for its universal chat lines; `patch_piece(bubble, id, patch)` (also exported from
 *  `Chat.js`) is how this class updates one AFTER it was drawn (a mark that only answers
 *  once the bubble is already on screen, or a failed send) — it redraws through the SAME
 *  `fill()`, so the result sticks through every later merge, not just the next one. */
Widget.Thread = class WidgetThread extends View {
	render(){
		this.ac("ux-dictate-widget-thread flex v gap");
		this.widget.$thread = this;
		this.lines = new Map();   // at -> {bubble, text, ref} — bubble may be SHARED by several `at`s once sentences merge;
		                           // `ref` is a tiny mutable box ({id}) `retag()` updates in place — see `mark()`'s own doc.
		this.lives = new Map();   // "stream:" + who -> {el, text} — a STILL-STREAMING reply, kept OUT of speak()'s merge
		this.$empty = div.c("ux-dictate-widget-empty muted", "Say something, or press the mic. Your words show up here.");
		this.$bubbles = div.c("ux-dictate-widget-bubbles flex v gap");
	}

	/** Run `fn` with every live (still-streaming) bubble lifted out first, and put back
	 *  after — the exact same move `ext/Chat/Chat.js`'s own `follow()` makes around every
	 *  `speak()` call, for the exact same reason: `mergeable()` reads `$box.el.lastElementChild`,
	 *  so a live bubble sitting at the end (where it always is, visually) must never be
	 *  mistaken for "the last REAL bubble" a new sentence might merge into (review finding 2). */
	follow(fn){
		for (const l of this.lives.values()) l.el.remove();
		const result = fn();
		for (const l of this.lives.values()) this.$bubbles.el.append(l.el);
		return result;
	}

	/** Same contract as `WidgetThreadV1.draw()` (`ux/Dictate/chat.js` calls this; it never
	 *  needed to change) — `{chat: {at, from, text, via, fix}}`, `fix: true` updates the
	 *  bubble already drawn for that `at` in place (a streamed reply growing token by
	 *  token) instead of merging or opening a new one. Everything else goes through
	 *  `speak()`, which decides merge-vs-new-bubble on its own, by reading the thread's own
	 *  DOM (`mergeable()`) — nothing here tracks that part at all. */
	draw(entry){
		if (entry?.type === "ask") return this.follow(() => this.draw_ask(entry));
		const chat = entry?.chat;
		if (!chat?.text) return;
		this.$empty.hide();
		const at = chat.at ?? new Date().toISOString();
		const assistant = chat.from?.kind === "assistant";

		// A STREAMED REPLY (`Widget.stream()`'s own made-up `at`, "stream:" + who) — kept
		// as its own live bubble, never a `speak()` piece at all (review finding 2's own
		// fix; see this class's own doc, and `Widget.stream()`'s). `fix` is this entry's
		// only tell: a real settled line never carries one of these made-up `at`s.
		if (chat.fix && String(at).startsWith("stream:")) return this.show_stream(at, chat.from?.id ?? "assistant", chat.text);

		if (chat.fix){
			const existing = this.lines.get(at);
			if (existing){ md_into(existing.text, chat.text, true); return; }
			// No existing piece yet — drawn the normal way below so a later call for the
			// same `at` finds it here (kept as a fallback for any OTHER `fix` producer —
			// the stream case above is the only one today, and never reaches this far).
		}

		// A real, settled reply from the same sender as a still-streaming live bubble
		// REPLACES it outright — never merges with it (the fast assistant's own reply
		// landing while a slower run, or the smart assistant's own stream, still shows).
		if (assistant) this.drop_live("stream:" + (chat.from?.id ?? "assistant"));

		const sender = chat.from?.id || chat.from?.kind || (assistant ? "assistant" : "owner");
		const who = chat.from?.id ?? (assistant ? "assistant" : "owner");
		const bubble = this.follow(() => speak(this.$bubbles, {
			cls: assistant ? "chatbox-reply" : "chatbox-you",
			who, text: chat.text, sender, at, id: at, via: chat.via,
		}));
		// `speak()` either made a brand-new bubble (this piece is its only, so its last and
		// only child) or merged this piece onto the thread's last bubble as a new paragraph
		// (this piece is still the LAST child, appended after whatever was already there) —
		// either way `bubble.lastElementChild` is this piece's own text node.
		const text_node = bubble.lastElementChild;
		const ref = { id: at };   // `retag()` below updates `ref.id` in place — see `mark()`'s own doc
		this.lines.set(at, { bubble, text: text_node, ref });
		this.$bubbles.el.scrollTop = this.$bubbles.el.scrollHeight;
		// THE CHAT HITL MARK (`widget.marks`) — only for the OWNER'S OWN line, same rule
		// `WidgetThreadV1` used. `mark()` below stores it ON THE PIECE (`patch_piece()`),
		// not on this node directly, so it survives a LATER merge too (review finding 1).
		if (!assistant && this.widget.marks) this.mark(chat.text, bubble, ref);
	}

	/** A QUESTION FOR YOU — identical to `WidgetThreadV1.draw_ask()`; this part of the
	 *  thread is unchanged by the merge (`readme.md`'s "Not this merge"). Called through
	 *  `follow()` (above) so a still-streaming live bubble stays at the very end, below it. */
	draw_ask(e){
		this.$empty.hide();
		const choices = e.choices?.length ? e.choices : ["Yes", "No"];
		let $q;
		this.$bubbles.append(() => {
			$q = div.c("ux-dictate-widget-bubble card pad ux-dictate-widget-bubble-assistant ux-dictate-widget-ask", () => {
				if (e.heading) div.c("ux-dictate-widget-ask-heading", e.heading);
				if (e.text) span(e.text);
				div.c("ux-dictate-widget-choices flex wrap gap", () => {
					choices.forEach(c => button.c("ux-dictate-widget-choice").attr("type", "button").text(c).click(() => {
						if ($q.el.classList.contains("answered")) return;
						$q.ac("answered");
						[...$q.el.querySelectorAll(".ux-dictate-widget-choice")].forEach(b => {
							b.disabled = true;
							if (b.textContent === c) b.classList.add("picked");
						});
						this.widget.answer?.(c);
					}));
				});
			});
		});
		this.$bubbles.el.scrollTop = this.$bubbles.el.scrollHeight;
	}

	/** A reply STILL being written — a bubble of its own, parked at `this.lives`, never
	 *  one of `speak()`'s own pieces (this class's own doc, and review finding 2). Every
	 *  call for the same `who` redraws the SAME bubble's text whole, the same way
	 *  `Chat.js`'s own `stream()` does; a SECOND reply from the same `who`, later, after
	 *  the first one settled and dropped this bubble, gets a brand-new one — `this.lives`
	 *  no longer has an entry for it by then, so there is nothing stale to reuse. */
	show_stream(key, who, text){
		this.$empty.hide();
		let hit = this.lives.get(key);
		if (!hit){
			// The SAME look a settled reply gets (`chatbox-reply`, from `ext/Chat/Chat.css` —
			// loaded already, since `draw()` imports `speak` from the same file) plus
			// `chatbox-streaming`, whose `.chatbox-text > :last-child::after` is the small
			// blinking cursor `Chat.js`'s own `stream()` shows — never this widget's OWN,
			// visually different `ux-dictate-widget-bubble` look (that one is `draw_ask()`'s,
			// a question card, deliberately distinct).
			let node, text_el;
			this.$bubbles.append(() => {
				node = div.c("chatbox chatbox-reply chatbox-streaming", () => {
					who_label(who);
					text_el = div.c("chatbox-text").el;
				}).el;
			});
			this.lives.set(key, hit = { el: node, text: text_el });
		}
		md_into(hit.text, text, true);
		this.$bubbles.el.scrollTop = this.$bubbles.el.scrollHeight;
	}

	/** Remove a live (streaming) bubble, if one is showing — the real line replacing it
	 *  (`draw()`, above) or an explicit empty `stream(who, "")` both call this. */
	drop_live(key){
		const hit = this.lives.get(key);
		if (!hit) return;
		hit.el.remove();
		this.lives.delete(key);
	}

	/** Same `ux/Understand` call as `WidgetThreadV1.mark()` used to make, now stored ON
	 *  THE PIECE (`patch_piece()`, `ext/Chat/Chat.js`) instead of bolted onto the DOM node
	 *  `draw()` happened to return — review finding 1: a bolted-on mark was wiped the next
	 *  time a merge's `fill()` redrew the bubble from its own stored pieces; a mark that
	 *  arrives AFTER that merge landed on a detached node and never showed at all.
	 *
	 *  `bubble` is captured HERE, synchronously, at draw time — never re-looked-up from
	 *  `this.lines` once this async call resolves, because `retag()` can have already
	 *  MOVED that lookup key by then (a caller's own server answers with a different,
	 *  final `at` almost at once — well before `ux/Understand`'s own answer, in
	 *  practice). `ref` is the same story for the piece's own id: `patch_piece()` needs
	 *  the piece's CURRENT id, which `retag()` may since have changed, so `ref` is a
	 *  tiny mutable box `retag()` updates in place (`ref.id = new_at`) rather than a
	 *  plain string copied by value when `mark()` was first called. */
	mark(text, bubble, ref){
		fetch_marks([text]).then(out => {
			const m = out?.marks?.[0];
			if (!m) return;
			patch_piece(bubble, ref.id, { mark: m });
		}).catch(() => {});
	}

	mark_failed(at){
		const line = this.lines.get(at);
		if (!line) return;
		patch_piece(line.bubble, line.ref.id, { failed: true });
	}

	retag(old_at, new_at){
		const line = this.lines.get(old_at);
		if (!line || old_at === new_at) return;
		this.lines.delete(old_at);
		this.lines.set(new_at, line);
		retag_piece(line.bubble, line.ref.id, new_at);   // so a pending mark()/mark_failed() under the new id still finds the piece
		line.ref.id = new_at;
	}

	add(text){ this.draw({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, text } }); }

	reset(){
		this.lines = new Map();
		this.lives = new Map();
		this.$bubbles.empty();
		this.$empty.show();
	}
};

/** **THE OLD COMPOSER** (`v1: true`) — `Dictate`'s own `mode: "open"` mic: nothing is ever
 *  written into the typed box, every finished sentence reaches `on_text` straight away.
 *  Kept reachable the same reason `ThreadV1` is. See `Widget.Composer`, right below, for
 *  the one every caller gets by default now. */
Widget.ComposerV1 = class WidgetComposerV1 extends View {
	render(){
		this.ac("ux-dictate-widget-composer flex v gap");
		const w = this.widget;

		this.$input = textarea.c("ux-dictate-widget-input")
			.attr("placeholder", w.placeholder || "say something")
			.attr("rows", "1")
			.on("input", () => this.autosize())
			// Enter sends (matches the old single-line box); Shift+Enter makes a new
			// line in the buffer, same as any other multi-line text box on the web.
			.on("keydown", e => { if (e.key === "Enter" && !e.shiftKey){ e.preventDefault(); this.send(); } });

		// THE CONTROLS ROW — mic, Send, and the optional extras (meter, mic picker,
		// Sample), all beneath the typed buffer now instead of beside it.
		div.c("ux-dictate-widget-controls flex gap v-center wrap", () => {
			w.dictate = new Dictate({
				mode: "open",
				revise: w.revision || false,
				on_text: text => w.submit(text, "voice"),
				on_revised: text => w.submit(text, "voice"),
				on_meter: w.level ? level => this.set_level(level) : undefined,
			});

			if (w.level) this.meter();
			if (w.source) this.source_picker();

			this.$send = button.c("ux-dictate-widget-send", "Send").attr("type", "button")
				.click(() => this.send());

			// Same debug flag as the "Debug ▾" bar — no mic, no whisper, a scripted growing
			// guess then a settle, through `Dictate`'s OWN `partial_text`/`draw_caption()`/
			// `commit()` (the exact methods a real segment calls), so "does this widget
			// actually transcribe" can be shown on a machine with no mic and no whisper-server
			// — the playground's own `run_sample()` does the same thing, one level down.
			if (w.debug) this.$sample = button.c("ux-dictate-widget-sample", "▶ Sample").attr("type", "button")
				.attr("title", "a scripted line, no mic needed — proves the bubble + live-guess pipeline")
				.click(() => this.sample());
		});
	}

	// The buffer grows with what's typed into it, no scrollbar and no fixed number of
	// rows — set to the browser's own natural "auto" first so a DELETED line can shrink
	// the box back down too, not just grow it.
	autosize(){
		this.$input.el.style.height = "auto";
		this.$input.el.style.height = this.$input.el.scrollHeight + "px";
	}

	send(){
		const text = this.$input.el.value.trim();
		if (!text) return;
		this.widget.submit(text, "typed");
		this.$input.el.value = "";
		this.autosize();
	}

	// ⚠ Grows the guess through `partial_text`/`draw_caption()` (real `Dictate` fields and
	// methods — the same ones a live resend calls) but SETTLES through `Dictate`'s OWN
	// `sample()`, never `commit()` directly: `commit()` always posts to the real prompt log,
	// and a scripted demo line must never land there (`Dictate.js`'s own `sample()` doc —
	// "must never land in the real prompt log"). `partial_text` is cleared first so the old
	// grey guess doesn't linger beside the real settled bubble `sample()` produces.
	async sample(){
		const d = this.widget.dictate;
		const text = "testing one two three";
		const words = text.split(" ");
		for (let n = 1; n <= words.length; n++){
			d.partial_text = words.slice(0, n).join(" ");
			d.draw_caption();
			await new Promise(r => setTimeout(r, 120));
		}
		d.partial_text = "";
		d.draw_caption();
		await new Promise(r => setTimeout(r, 200));
		await d.sample([text]);
	}

	meter(){
		this.$meter = div.c("ux-dictate-widget-meter", () => { this.$meter_fill = div.c("ux-dictate-widget-meter-fill"); });
	}

	set_level(level){ this.$meter_fill?.style("--ux-dictate-widget-level", level.toFixed(3)); }

	// A compact picker of `enumerateDevices()` audio inputs — same remembered key as every
	// `Dictate` on the site (`remember_device`/`remembered_device`), width capped in CSS so
	// a long device name never reopens the "640px dropdown" this is replacing.
	source_picker(){
		let $select;
		$select = select.c("ux-dictate-widget-source").attr("aria-label", "Microphone")
			.on("change", e => this.pick_device($select, e.target.value));
		this.refresh_devices($select);
	}

	async refresh_devices($select){
		if (!navigator.mediaDevices?.enumerateDevices){
			$select.empty(() => { option("no mic list").attr("value", ""); });
			return;
		}
		let devices = [];
		try { devices = await navigator.mediaDevices.enumerateDevices(); }
		catch { /* no permission asked yet — an empty list still renders something honest */ }

		const inputs = devices.filter(d => d.kind === "audioinput");
		const remembered = remembered_device();
		const picked = inputs.find(d => d.deviceId === remembered?.id) ?? inputs[0];

		$select.empty(() => {
			if (!inputs.length){ option("no mic found").attr("value", ""); return; }
			inputs.forEach((d, i) => {
				option(d.label || remembered?.label || `mic ${i + 1}`).attr("value", d.deviceId)
					.attr("selected", d.deviceId === picked?.deviceId ? "" : undefined);
			});
		});
	}

	pick_device($select, id){
		const opt = [...$select.el.options].find(o => o.value === id);
		remember_device(id, opt?.textContent ?? "");
	}
};

/** **THE COMPOSER** — `ext/Chat/Composer.js`'s own `composer()` (one-dictation, 2026-10-01:
 *  "the entry is `ext/Chat`'s composer" — CLAUDE.md law 6, one of everything). Whisper
 *  writes into the SAME text box the owner can type into (`ext/Chat/Mic.js`'s `ComposerMic`)
 *  instead of `ComposerV1`'s own `mode: "open"` mic, which never touched the box at all. A
 *  finished sentence (it ends in `. ! ?`) goes out on its own after a short natural pause
 *  (`Mic.js`'s `SETTINGS.paragraph_pause_ms`, ~700ms — the owner asked for "500 to 1000
 *  milliseconds"), and the box clears each time; an unfinished remainder only goes out on
 *  Send, or after the longer `SETTINGS.pause_send_ms` silence. The mic, Send and the
 *  settings gear sit in one row UNDER the box (`Composer.js`'s own doc on why, `Chat.css`
 *  for how) — the same layout this widget's own `ComposerV1` already had, now shared by
 *  every composer on the site instead of copied here a second time.
 *
 *  `widget.dictate` is still set here, to the real `ComposerMic` instance (it extends
 *  `Dictate`) — `Widget.mic_active()`/`start_mic()`/`stop_mic()` above, and a proof script's
 *  `dictate.sample([...])`, keep working exactly as they did against `ComposerV1`'s own
 *  plain `Dictate`.
 *
 *  **`floor`/`cues` still ride along, unchanged** (checked after the mastermind flagged
 *  this merge's own first doc comment here as a likely regression — it wasn't one, but the
 *  worry was fair enough to prove, not just argue): `floor`/`cues` are stamped by
 *  `ux/Dictate/chat.js`'s own `deliver` — `floor.stamp(entry)`, called there on EVERY
 *  entry regardless of which composer produced it, from before this merge existed. It
 *  reads the mic's own module-level state (`ux/Dictate/floor.js`), not anything this
 *  composer's `entry` carries, so `ComposerMic`'s `{text, via: "whisper", ...}` (no
 *  `floor` key of its own) gets exactly the same treatment the old composer's entry did.
 *  A voice send while the mic is really on gets `floor: "speaking"` plus `cues` (its
 *  pauses and speaking time); a typed send always gets `floor: "done"`, never `cues`.
 *  Proven against the stubbed Servex in `minion-chatjoin/proof.mjs` ("a voice send carries
 *  floor+cues, a typed one doesn't"), by turning the mic's own `floor.mic_on()` flag on for
 *  this widget's `Dictate` instance the same way a real `start()` does — headless Chromium
 *  has no microphone to actually open, so this is the one honest way to prove the STAMPING
 *  logic without one.
 *
 *  **`level`/`source` are passed through, not dropped** (review finding 4, 2026-10-01: the
 *  first cut of this class only reached `ComposerV1`, so `new Widget({level: true})` quietly
 *  did nothing unless `v1: true` was also set). `ext/Chat/Composer.js`'s own `composer()` now
 *  takes `on_meter`/`device_id` straight through to its `ComposerMic` — the same two options
 *  `ComposerV1` always gave its own plain `Dictate` — so the bigger level bar (`meter()` below)
 *  works exactly as it did there. `source` is a DIFFERENT kind of passthrough: picking a mic
 *  only ever wrote to `localStorage` (`remember_device()`, `ux/Dictate/Dictate.js`), which
 *  EVERY `Dictate` instance already reads on its own with no `device_id` given
 *  (`remembered_device()`) — so the same small `<select>` `ComposerV1` built works here with
 *  no wiring into `ComposerMic` at all; it only needs to exist on screen. */
Widget.Composer = class WidgetComposer extends View {
	render(){
		this.ac("ux-dictate-widget-composer flex v gap");
		const w = this.widget;
		const view = composer({
			placeholder: w.placeholder || "say something",
			revise: w.revision || false,
			on_text: text => w.on_text?.(text),
			deliver: entry => w.submit_entry(entry),
			on_meter: w.level ? level => this.set_level(level) : undefined,
		});
		w.dictate = view.mic;
		if (w.level) this.meter();
		if (w.source) this.source_picker();
	}

	// Same bar, same CSS variable, same shared `--ux-dictate-widget-level` custom property
	// `ComposerV1.meter()`/`.set_level()` use — kept here rather than imported from there so
	// `v1`'s own path stays untouched (CLAUDE.md "ask before… major surgery" — not worth the
	// risk to the proven regression switch-back for two three-line methods).
	meter(){
		this.$meter = div.c("ux-dictate-widget-meter", () => { this.$meter_fill = div.c("ux-dictate-widget-meter-fill"); });
	}
	set_level(level){ this.$meter_fill?.style("--ux-dictate-widget-level", level.toFixed(3)); }

	// The same compact `<select>` of audio input devices `ComposerV1.source_picker()` builds —
	// see this class's own doc above for why it needs no wiring into `ComposerMic` at all.
	source_picker(){
		let $select;
		$select = select.c("ux-dictate-widget-source").attr("aria-label", "Microphone")
			.on("change", e => this.pick_device($select, e.target.value));
		this.refresh_devices($select);
	}

	async refresh_devices($select){
		if (!navigator.mediaDevices?.enumerateDevices){
			$select.empty(() => { option("no mic list").attr("value", ""); });
			return;
		}
		let devices = [];
		try { devices = await navigator.mediaDevices.enumerateDevices(); }
		catch { /* no permission asked yet — an empty list still renders something honest */ }

		const inputs = devices.filter(d => d.kind === "audioinput");
		const remembered = remembered_device();
		const picked = inputs.find(d => d.deviceId === remembered?.id) ?? inputs[0];

		$select.empty(() => {
			if (!inputs.length){ option("no mic found").attr("value", ""); return; }
			inputs.forEach((d, i) => {
				option(d.label || remembered?.label || `mic ${i + 1}`).attr("value", d.deviceId)
					.attr("selected", d.deviceId === picked?.deviceId ? "" : undefined);
			});
		});
	}

	pick_device($select, id){
		const opt = [...$select.el.options].find(o => o.value === id);
		remember_device(id, opt?.textContent ?? "");
	}
};

/** **The model picker** (`models: true`) — moved here from `ext/drawer/tabs/ai.js`
 *  (round 3). Stored only, same as it always was — "nothing reads it yet". */
Widget.Models = class WidgetModels extends View {
	render(){
		label.c("ux-dictate-widget-models flex v-center")
			.attr("title", "Only stored for now — the provider that reads it comes with harness step 2.")
			.append(() => {
				span.c("muted", "model");
				const $pick = select(() => { MODELS.forEach(m => option(m[0].toUpperCase() + m.slice(1)).attr("value", m)); });
				$pick.el.value = model();
				$pick.on("change", () => model($pick.el.value));
			});
	}
};

/** **The debug bar** — one small "Debug ▾" toggle, below the card, collapsed by default.
 *  Opening it mounts [`ux/Dictate/playground`](/framework/ux/Dictate/playground/)'s own
 *  widget (`pg.widget()`) right there: its raw/clean toggle, Chunks, Corrections, Live and
 *  Side-by-side tabs, drawn once, on the first open, and left alone after that — this class
 *  reuses those views wholesale rather than rebuilding a second copy of them. Because `pg`
 *  is one shared singleton pipeline, a sentence said into this SAME page's `Composer` above
 *  also shows up in the debug panel's own session (the playground's own doc has the
 *  details). Never built on the ✦ sheet — `debug` stays `false` there. */
Widget.Debug = class WidgetDebug extends View {
	render(){
		this.ac("ux-dictate-widget-debug");
		this.$toggle = button.c("ux-dictate-widget-debug-toggle", "Debug ▾").attr("type", "button")
			.attr("aria-expanded", "false")
			.attr("title", "Raw vs clean, Chunks, Corrections, Live, Side by side — the playground's own tabs")
			.click(() => this.toggle());
		this.$panel = div.c("ux-dictate-widget-debug-panel");
		this.$panel.el.hidden = true;
	}

	toggle(){
		const open = this.$panel.el.hidden;
		this.$panel.el.hidden = !open;
		this.$toggle.attr("aria-expanded", String(open)).text(open ? "Debug ▴" : "Debug ▾");
		if (open && !this.built){
			this.built = true;
			this.$panel.append(() => { pg.widget(); });
		}
	}
};
