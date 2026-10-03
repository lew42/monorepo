import { View, div, span, button, select, option, label, textarea } from "../../core/View/View.js";
import Dictate, { remember_device, remembered_device } from "./Dictate.js";
import { pg } from "./playground/Playground.js";
import { marks as fetch_marks } from "../Understand/Understand.js";
import { md_into } from "../../ext/Chat/md.js";
import { who_label } from "../../ext/Chat/roles.js";
import { speak, patch_piece, retag_piece, split_bubble, sticky_scroll } from "../../ext/Chat/Chat.js";
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
 * **ONE dictation widget, the same everywhere.** A framed card: bubbles on top, a composer
 * row at the bottom (a typed box, the mic, Send). The ✦ sheet, the desktop drawer and the
 * Dictate page all build this SAME class, configured instead of copied:
 *
 *     new Widget();                                   // just bubbles + the composer row
 *     new Widget({ level: true, source: true });       // + a level meter, + a mic picker
 *     new Widget({ debug: true });                     // + the "Debug ▾" bar
 *     new Widget({ revision: "edit" });                 // ux/Revise tidies each sentence
 *     new Widget({ models: true });                     // + the model picker
 *     new Widget({ pulse: true });                       // a small bottom-right dot that grows with the voice, instead of `level`'s bar
 *     new Widget({ mode: "live", revision: "clean" });  // voice first, STRAIGHT TO A BUBBLE, never the box — see MODES, below
 *
 * Every option is `false`/`null`/off by default, so the plain `new Widget()` call stays the
 * smallest one. `level`/`source`/`debug`/`revision`/`models`/`pulse` are display-only; `history()`,
 * `deliver(entry)`, `on_text(text)`, `answer(choice)` and `marks: true` wire it to a real
 * conversation (`ux/Dictate/chat.js` is the one caller that uses all of them). What each one
 * does, and `v1: true`'s switch back to the old one-bubble-per-sentence thread and open-mic
 * composer: [`doc/chat.md`](doc/chat/).
 *
 * Parts as static subclasses (the `code` skill, §3): `Widget.Thread` (the bubbles, built from
 * `ext/Chat/Chat.js`'s own `speak()` — a sentence from the same sender merges onto the last
 * bubble as a new paragraph, the same rule every chat on the site uses), `Widget.Composer`
 * (the bottom row, `ext/Chat/Composer.js`'s own `composer()`), `Widget.Models`, `Widget.Debug`
 * and `Widget.Pulse` (the `pulse: true` dot, own doc right above its class). `Widget`'s own
 * public surface — `submit`, `sync`, `stream`, `draw`, `mark`,
 * `mark_failed`, `retag`, `reset` — is the seam every caller builds on; it hasn't changed
 * shape since this drew through `ChatPanel` instead.
 */
/** **THE MODE PRESETS** (`mode`, one-dictation item 1 — "a mode is a named preset, never a
 *  second code path", CLAUDE.md law 6). One small table, one row per mode: everything a mode
 *  changes already exists, so a third mode is one more row here, never a new `if` anywhere
 *  else. `"dictate"` (the default, and now the only mode besides `"live"`) changes nothing —
 *  it IS what every surface already does: voice first, a sentence goes out by itself at its
 *  end after a short pause (autosend — `Mic.js`'s own `SETTINGS.send_mode: "pause"`), and
 *  sentences from the same sender join the last bubble.
 *
 *  **Merge 11, "one widget" (2026-10-01):** the `"chat"` row (typed first, manual Send only,
 *  bubbles never merging) is GONE. The owner used both the Dictate page and the ✦ sheet and
 *  found they "look alike but behave differently" — the Dictate page's own Chat mode was
 *  really just autosend switched off, and "that was a mistake to separate those into two
 *  different modes." The owner's own words: "auto send after a pause of a reasonable
 *  amount." Now every surface only ever autosends; typing still sends on Enter or Send, same
 *  as always. The gear no longer offers "manual" as a send-mode choice either
 *  (`Mic.js`'s own `settings_panel()`), and an old saved `send_mode: "manual"` is migrated
 *  back to `"pause"` the moment settings load (`Mic.js`, same place `pause_send_ms` is
 *  migrated). `join` (the piece that let `"chat"` opt out of `speak()`'s own bubble-merging)
 *  stays on `Widget.Thread` below as a general seam, unused by either mode left in this table
 *  today — removing it would be surgery nothing here asked for. Full reasoning:
 *  `doc/decisions.md`.
 *
 *  `"live"` (clean-dictate-mode, 2026-10-01 — the owner: "instead of writing into this text
 *  area, we just do the same thing in the chat bubble where it's going to be sent") is the
 *  box-skipping mode: a finished, clean-revised sentence grows straight into a chat bubble and
 *  is never shown or typed into the composer's text box at all. This is NOT a new pipeline —
 *  it is the exact "Live bubbles" feature `ext/Chat/readme.md` already documents for
 *  `ChatPanel` (`Mic.js`'s own `SETTINGS.into: "chat"` default, gated on a host passing
 *  `on_live`), wired onto THIS widget's composer for the first time. `into: "chat"` is set
 *  explicitly here (not left to the shared default) so this mode behaves the same regardless
 *  of what the owner's own gear has saved; `bubble: true` is the one new flag, read by
 *  `Widget.Composer` below to decide whether to pass `on_live` at all — every other mode leaves
 *  it unset, so dictation keeps landing in the box exactly as it always has. Pair it with
 *  `revision: "clean"` (a separate, already-existing `Widget` option) to get the clean-revised
 *  wording in the bubble, which is what the owner actually asked for — `mode` only decides
 *  WHERE the words appear, `revision` decides WHAT they say. */
const MODES = {
	dictate: {},
	live: { into: "chat", bubble: true },
};

export default class Widget extends View {

	render(){
		this.ac("ux-dictate-widget flex v gap");
		// `this.mode` (default "dictate") picks one row of `MODES` above; an unknown name
		// falls back to "dictate" rather than throwing — a typo'd mode should look like the
		// default, not break the page. `this.mic_preset` is read by `Widget.Composer` below;
		// `this.join` is read by `Widget.Thread`'s own `draw()`.
		const preset = this.constructor.MODES[this.mode] ?? this.constructor.MODES.dictate;
		this.mic_preset = preset;
		this.join = preset.join !== false;
		const Thread = this.v1 ? this.constructor.ThreadV1 : this.constructor.Thread;
		const Composer = this.v1 ? this.constructor.ComposerV1 : this.constructor.Composer;
		// THE SHELL (drawer-chat round 2, 2026-10-02 — the parent review: "the feed's
		// bordered card holds an inset grey panel... make the composer panel run the full
		// width of the chat column, flush at the bottom, with its own background and a top
		// border, so the feed sits above it and the feed card's border doesn't wrap around
		// it"). The NEW composer is now a SIBLING of the feed card, not a child padded
		// inside it — `Widget.css`'s own `.ux-dictate-widget-shell` rules square off the
		// card's bottom and the composer's top where they meet, so the border between them
		// is the composer's own ONE top border, never a second nested box. `v1: true` keeps
		// the OLD composer exactly where it always was, inside the card — this is a change
		// to the new composer's own look, not a structural rule for every composer ever
		// built here.
		div.c("ux-dictate-widget-shell flex v", () => {
			div.c("ux-dictate-widget-card card pad flex v gap", () => {
				if (this.models) new this.constructor.Models({ widget: this });
				// `pulse: true` (the pulsing-dot mic indicator, 2026-10-01) wraps the thread in
				// one extra box so the lock overlay and the dot can sit ON TOP of the feed
				// without scrolling away with it — see `Widget.Pulse`'s own class doc, right
				// below `Widget.Debug`, for why a plain child of the scrolling thread wouldn't work.
				if (this.pulse) div.c("ux-dictate-widget-feed-wrap", () => {
					new Thread({ widget: this });
					new this.constructor.Pulse({ widget: this });
				});
				else new Thread({ widget: this });
				if (this.v1) new Composer({ widget: this });
			});
			if (!this.v1) new Composer({ widget: this });
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
	 *  redrawn each call, under a fixed made-up `at` (`"stream:" + who`) so every call for
	 *  the same speaker updates ONE bubble in place. Kept OUT of `speak()`'s own merge
	 *  tracking (`Thread`'s own `lives` map, below, same split `Chat.js`'s `chat()` factory
	 *  keeps) — otherwise a real, settled reply landing soon after would merge straight into
	 *  the stream's own bubble and the next redraw would overwrite it with a stale chunk.
	 *  `text: ""` drops the live bubble with nothing to replace it. History: `doc/chat.md`. */
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
Widget.prototype.pulse = false;      // the pulsing-dot mic indicator in place of `level` — see `Widget.Pulse` below
Widget.prototype.history = null;     // () => past lines, drawn once on mount — see class doc
Widget.prototype.deliver = null;     // async (entry) => ok — see class doc
Widget.prototype.on_text = null;     // (text) => … — fires the moment a sentence is ready, before `deliver`
Widget.prototype.answer = null;      // (choice) => … — a choice-button question's pick (`say({type:"ask",...})`)
Widget.prototype.marks = false;      // show a ✓/`?` beside each of the OWNER'S OWN bubbles (`ux/Understand`)
Widget.prototype.v1 = false;         // true = the OLD thread (one bubble per sentence) + composer (Dictate's own open mic)
Widget.prototype.mode = "dictate";   // "dictate" (voice first, autosend after a pause, the default and the only one besides "live") | "live" (voice first, straight to a bubble, never the box) — see MODES, above
Widget.MODES = MODES;

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
		// Same fix as `Widget.Thread`, below (chat-autoscroll, 2026-10-01): THIS view's own
		// element scrolls, not `$bubbles` — see that class's own comment for the why.
		this.scroll = sticky_scroll(this.el);
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
		this.scroll.pin();
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
		this.scroll.pin();
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

/** **THE THREAD** — every bubble drawn through `ext/Chat/Chat.js`'s own `speak()`: a
 *  sentence from the same sender as the thread's last bubble, said within `MERGE_GAP_MS`
 *  (10s), joins it as a new paragraph instead of opening a second one — the same
 *  `chatbox-you`/`chatbox-reply` look every other chat on the site uses. The lower-level
 *  `speak()`/`mergeable()` are reused here, not the whole `chat()` factory, which owns its
 *  own container and its own selection/reaction/drill wiring this widget doesn't have.
 *  `split_bubble()` (also from `Chat.js`) is the same idea in reverse, for undoing a merge
 *  the `para` marker says was wrong — see `split_paragraph()`, below. `refine()` (an AI
 *  summary replacing a bubble's raw text) is still not used here.
 *
 *  A mark, a via badge and a failed-send flag all survive a LATER merge because `speak()`
 *  stores them ON THE PIECE, and `patch_piece()` (`Chat.js`) is how this class updates one
 *  after the fact — both redraw through the same `fill()`, so nothing painted straight onto
 *  a DOM node is silently wiped the next time that bubble redraws. History: `doc/chat.md`. */
Widget.Thread = class WidgetThread extends View {
	render(){
		this.ac("ux-dictate-widget-thread flex v gap");
		this.widget.$thread = this;
		this.lines = new Map();   // at -> {bubble, text, ref} — bubble may be SHARED by several `at`s once sentences merge;
		                           // `ref` is a tiny mutable box ({id}) `retag()` updates in place — see `mark()`'s own doc.
		this.lives = new Map();   // "stream:" + who -> {el, text} — a STILL-STREAMING reply, kept OUT of speak()'s merge
		this.$empty = div.c("ux-dictate-widget-empty muted", "Say something, or press the mic. Your words show up here.");
		this.$bubbles = div.c("ux-dictate-widget-bubbles flex v gap");
		// STICKY-BOTTOM SCROLL (`ext/Chat/Chat.js`'s own `sticky_scroll()`, CLAUDE.md law 6 —
		// one scroll behavior, not a second copy here): THIS view's own element (`this.el`,
		// class `ux-dictate-widget-thread`) is the box that actually scrolls — `Widget.css`'s
		// `overflow-y: auto` is on it, not on `this.$bubbles`. Every place below that used to
		// set `this.$bubbles.el.scrollTop` was therefore scrolling an element with nothing to
		// scroll — a silent no-op, which is why neither the Dictate page nor the ✦ sheet ever
		// auto-scrolled (chat-autoscroll, 2026-10-01). `this.scroll.pin()` replaces every one
		// of those calls now.
		this.scroll = sticky_scroll(this.el);
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
	 *  DOM (`mergeable()`) — nothing here tracks that part at all.
	 *
	 *  Also `{para: {re}}` (or `entry()`'s own `{type: "para", re}`) — the `para` marker
	 *  (`doc/chat.md`): no bubble of its own, just a sign to split one already drawn. See
	 *  `split_paragraph()` below. */
	draw(entry){
		if (entry?.type === "ask") return this.follow(() => this.draw_ask(entry));
		const para = entry?.para ?? (entry?.type === "para" ? entry : null);
		if (para?.re) return this.split_paragraph(para.re);
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

		// A real, settled reply from the same sender as a still-streaming live bubble
		// REPLACES it outright — never merges with it (the fast assistant's own reply
		// landing while a slower run, or the smart assistant's own stream, still shows).
		if (assistant) this.drop_live("stream:" + (chat.from?.id ?? "assistant"));

		// MODE "live" ONLY: a real, settled OWNER line replaces the faded "sent:" draft
		// bubble `live()` (below) left behind the instant it went out — the same cleanup
		// `ext/Chat/Chat.js`'s own `chat()` does for its `type:"prompt"` lines. A no-op
		// for every other mode, where `live()` is never called, so no "sent:" key exists.
		if (!assistant){
			const sent_key = [...this.lives.keys()].find(k => k.startsWith("sent:"));
			if (sent_key) this.drop_live(sent_key);
		}

		const sender = chat.from?.id || chat.from?.kind || (assistant ? "assistant" : "owner");
		const who = chat.from?.id ?? (assistant ? "assistant" : "owner");
		const bubble = this.follow(() => speak(this.$bubbles, {
			cls: assistant ? "chatbox-reply" : "chatbox-you",
			who, text: chat.text, sender, at, id: at, via: chat.via,
			join: this.widget.join,   // chat mode's own opt-out (one-dictation item 2) — see MODES, above Widget
		}));
		// `speak()` either made a brand-new bubble (this piece is its only, so its last and
		// only child) or merged this piece onto the thread's last bubble as a new paragraph
		// (this piece is still the LAST child, appended after whatever was already there) —
		// either way `bubble.lastElementChild` is this piece's own text node.
		const text_node = bubble.lastElementChild;
		const ref = { id: at };   // `retag()` below updates `ref.id` in place — see `mark()`'s own doc
		this.lines.set(at, { bubble, text: text_node, ref });
		this.scroll.pin();
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
		this.scroll.pin();
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
		this.scroll.pin();
	}

	/** MODE "live" ONLY (clean-dictate-mode, 2026-10-01) — the OWNER's own words while still
	 *  speaking, growing in a bubble on their side of the log instead of the composer's text
	 *  box: `settled` is Whisper's finished words (the clean-up swapped in once it lands — the
	 *  same text `ComposerMic.show_live()` would otherwise type into the real box), `guess`
	 *  the still-moving tail, drawn grey, plain text (markdown never half-renders a word that
	 *  is still changing). `sent: true` with an empty `text` is the one call `consume_sent()`
	 *  makes the instant the words actually go out: the bubble stays, faded, as proof they were
	 *  heard, until the real settled line lands (`draw()`, above, drops it then) or 15s pass
	 *  with nothing, same as the timeout below.
	 *
	 *  Mirrors `ext/Chat/Chat.js`'s own `chat().live()` (the "Live bubbles" feature,
	 *  `ext/Chat/readme.md`) exactly, including the look (`chatbox-you chatbox-draft`,
	 *  `.chatbox-guess`, `.chatbox-live-sent` — all `Chat.css` rules, loaded already since
	 *  `draw()` above imports `speak` from the same file) — not reused directly because that
	 *  version lives inside `chat()`'s own closure (its own `lives`/`follow()`), which this
	 *  class can't reach into; this class already keeps its own copy of both, for
	 *  `show_stream()` just above, so `live()` builds on those instead of a third copy.
	 *
	 *  Passed straight through as `composer()`'s own `on_live` option by `Widget.Composer`
	 *  below, and ONLY when `mode: "live"`'s own preset (`MODES`, top of file) asks for it —
	 *  every other mode never calls this at all, so dictation keeps landing in the box exactly
	 *  as it always has for them. */
	live({ text = "", settled = text, guess = "", sent = false } = {}){
		if (!text){
			const hit = this.lives.get("draft");
			if (!hit) return;
			if (!sent) return this.drop_live("draft");
			this.lives.delete("draft");
			hit.el.classList.add("chatbox-live-sent");   // `Chat.css`'s own fade rule — reused, not a new class
			this.live_sent_n = (this.live_sent_n ?? 0) + 1;
			const key = "sent:" + this.live_sent_n;
			hit.timer = setTimeout(() => this.drop_live(key), 15000);
			this.lives.set(key, hit);
			return;
		}
		this.$empty.hide();
		this.follow(() => {
			let hit = this.lives.get("draft");
			if (!hit){
				let node, text_el;
				this.$bubbles.append(() => {
					node = div.c("chatbox chatbox-you chatbox-live chatbox-draft", () => {
						who_label("owner");
						text_el = div.c("chatbox-text").el;
					}).el;
				});
				this.lives.set("draft", hit = { el: node, text: text_el });
			}
			hit.text.textContent = settled;
			if (guess) hit.text.append(span.c("chatbox-guess").text((settled ? " " : "") + guess).el);
		});
		this.scroll.pin();
	}

	/** Remove a live (streaming) bubble, if one is showing — the real line replacing it
	 *  (`draw()`, above) or an explicit empty `stream(who, "")`/`live()` call both call this.
	 *  Clears a pending fade-out timer too (`live()`'s own "sent:" entry, above) so a bubble
	 *  dropped early (the real line arrived before the 15s fade ran out) never fires a second,
	 *  stale removal later — harmless either way (`drop_live` is a no-op on a missing key), just
	 *  not worth leaving a timer running for nothing. */
	drop_live(key){
		const hit = this.lives.get(key);
		if (!hit) return;
		clearTimeout(hit.timer);
		hit.el.remove();
		this.lives.delete(key);
	}

	/** `ux/Understand`'s own `marks()` call, stored ON THE PIECE (`patch_piece()`) so it
	 *  survives a later redraw instead of being bolted onto a DOM node that gets replaced.
	 *  `bubble`/`ref` are captured at draw time, not re-looked-up later: `retag()` can move
	 *  the piece's own id before this async call resolves, and `ref` (a tiny mutable box
	 *  `retag()` updates in place) is how this still finds it. History: `doc/chat.md`. */
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

	/** THE PARAGRAPH SPLIT (`doc/chat.md`'s "para" marker) — the fast assistant decided the
	 *  paragraph named `re` actually starts a new topic. That piece, and every piece merged
	 *  in after it on the SAME bubble, move out into a brand-new bubble right after the
	 *  original; `ext/Chat/Chat.js`'s `split_bubble()` does the real move (it owns the
	 *  pieces/bubbles bookkeeping `speak()` needs — this class never touches that directly,
	 *  same reason `mark()`/`retag()` above go through `patch_piece()`/`retag_piece()`).
	 *
	 *  Both halves get fully re-rendered by `split_bubble()`'s own `fill()` calls, so every
	 *  piece's cached text node in `this.lines` — used by `chat.fix`'s in-place correction,
	 *  above — is stale the instant this returns; the loop below re-finds each one by its own
	 *  `data-re` attribute and repoints `line.bubble`/`line.text` to wherever it actually
	 *  ended up. A session re-read from line 0 (`ux/Dictate/chat.js`'s own `sync()`) hits this
	 *  same method, at the same point in the sequence, so a reload draws the same picture. */
	split_paragraph(re){
		const hit = this.lines.get(re);
		if (!hit) return;   // the paragraph named isn't on screen (opened mid-conversation) — nothing to split
		const old_bubble = hit.bubble;
		const made = this.follow(() => split_bubble(this.$bubbles, old_bubble, re));
		if (!made) return;   // `re` was already the bubble's first paragraph, or not found there
		for (const [at, line] of this.lines){
			if (line.bubble !== old_bubble && line.bubble !== made) continue;
			const moved_node = made.querySelector(`[data-re="${at}"]`);
			line.bubble = moved_node ? made : old_bubble;
			line.text = moved_node ?? old_bubble.querySelector(`[data-re="${at}"]`) ?? line.text;
		}
		this.scroll.pin();   // follows only if the reader was already at the bottom — `scroll.locked()`
	}

	add(text){ this.draw({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, text } }); }

	reset(){
		this.lines = new Map();
		this.lives = new Map();
		this.$bubbles.empty();
		this.$empty.show();
	}
};

/** Shared by BOTH composers below (`Widget.Composer` and `Widget.ComposerV1` — review
 *  finding, one-dictation item 5: they used to each keep their own identical copy of these
 *  four methods, CLAUDE.md law 6). Plain functions, not class methods, so either composer's
 *  own `meter()`/`source_picker()` can call straight into them; `composer_meter(view)` takes
 *  the composer itself so it can still set `view.$meter`/`$meter_fill` — each composer keeps
 *  its own one-line `set_level()`, not worth sharing. */
function composer_meter(view){
	view.$meter = div.c("ux-dictate-widget-meter", () => { view.$meter_fill = div.c("ux-dictate-widget-meter-fill"); });
}
// A compact picker of `enumerateDevices()` audio inputs — same remembered key as every
// `Dictate` on the site (`remember_device`/`remembered_device`), width capped in CSS so a
// long device name never reopens the "640px dropdown" this is replacing.
function composer_source_picker(){
	let $select;
	$select = select.c("ux-dictate-widget-source").attr("aria-label", "Microphone")
		.on("change", e => composer_pick_device($select, e.target.value));
	composer_refresh_devices($select);
}
async function composer_refresh_devices($select){
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
function composer_pick_device($select, id){
	const opt = [...$select.el.options].find(o => o.value === id);
	remember_device(id, opt?.textContent ?? "");
}

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

	meter(){ composer_meter(this); }

	set_level(level){ this.$meter_fill?.style("--ux-dictate-widget-level", level.toFixed(3)); }

	source_picker(){ composer_source_picker(); }
};

/** **THE COMPOSER** — `ext/Chat/Composer.js`'s own `composer()`. Whisper writes into the
 *  SAME text box the owner can type into (`ext/Chat/Mic.js`'s `ComposerMic`), unlike
 *  `ComposerV1`'s own open mic, which never touched the box. A finished sentence (ends in
 *  `. ! ?`) goes out on its own after a short pause (`Mic.js`'s `SETTINGS.paragraph_pause_ms`);
 *  an unfinished remainder goes out on Send, or after the longer `pause_send_ms` silence. The
 *  mic, Send and the settings gear sit in one row under the box, shared by every composer on
 *  the site now instead of copied here a second time.
 *
 *  `widget.dictate` is still the real `ComposerMic` instance (it extends `Dictate`), so
 *  `Widget.mic_active()`/`start_mic()`/`stop_mic()` and a proof's `dictate.sample([...])`
 *  keep working exactly as they did against `ComposerV1`'s own plain `Dictate`. `floor`/
 *  `cues` still ride along unchanged — stamped by `ux/Dictate/chat.js`'s `deliver`, which
 *  reads the mic's own module-level state, not anything this composer's `entry` carries.
 *  `level`/`source` are passed straight through to `ComposerMic` (`on_meter`/`device_id`)
 *  the same way `ComposerV1` gave them to its own plain `Dictate`. History: `doc/chat.md`. */
Widget.Composer = class WidgetComposer extends View {
	render(){
		this.ac("ux-dictate-widget-composer flex v gap");
		const w = this.widget;
		const view = composer({
			placeholder: w.placeholder || "say something",
			revise: w.revision || false,
			on_text: text => w.on_text?.(text),
			deliver: entry => w.submit_entry(entry),
			// `pulse` reads the SAME smoothed number `level` does (`Dictate`'s own
			// `on_meter`, 0..1) — both can be on at once, each drives its own display.
			on_meter: (w.level || w.pulse) ? level => { this.set_level(level); w.$pulse?.set_level(level); } : undefined,
			// MODE "live" ONLY (`w.mic_preset.bubble`, set by `MODES.live` above): the
			// mic's own `live_active()` check (`Mic.js`) is `!!this.on_live && into === "chat"` —
			// `on_live` left `undefined` for every other mode is what keeps dictation
			// landing in the real box for them, unchanged. `this.widget.$thread` always
			// exists by the time this fires (`Thread` is built before `Composer`, `Widget`'s
			// own `render()`, above).
			on_live: w.mic_preset.bubble ? state => this.widget.$thread?.live?.(state) : undefined,
		});
		w.dictate = view.mic;
		// THE MODE PRESET (one-dictation item 1) lands on this ONE mic instance, after it
		// already exists — never on the shared `SETTINGS` (`Mic.js`'s own `send_mode`/`into`
		// per-mic overrides, same seam `mode_now()`/`live_active()` already read), so a mode
		// never touches what the owner's gear has saved, and the gear still wins for this box.
		if (view.mic){
			if ("send_mode" in w.mic_preset) view.mic.send_mode = w.mic_preset.send_mode;
			if ("into" in w.mic_preset) view.mic.into = w.mic_preset.into;
			// `pulse` (the pulsing-dot indicator) needs to know the instant the mic is
			// asked to start or really stops, so it can swap the locked overlay for the
			// dot and back — plain instance hooks (`Dictate.prototype.on_start`/`on_stop`,
			// null by default), set directly on this ONE mic the same way `send_mode`/
			// `into` are, just above. `view.mic.on_start` fires the moment `start()` is
			// called (asked-for, maybe still a permission prompt away); `on_stop` fires
			// once `stop()` actually runs — `Widget.Pulse`'s own doc has the full picture.
			if (w.pulse){
				view.mic.on_start = () => w.$pulse?.locked(false);
				view.mic.on_stop = () => w.$pulse?.locked(true);
			}
		}
		if (w.level) this.meter();
		if (w.source) this.source_picker();
	}

	// Same bar, same CSS variable, same shared `--ux-dictate-widget-level` custom property
	// `ComposerV1` uses — `composer_meter()`, above, is the one copy of it now.
	meter(){ composer_meter(this); }
	set_level(level){ this.$meter_fill?.style("--ux-dictate-widget-level", level.toFixed(3)); }

	source_picker(){ composer_source_picker(); }
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

/** **THE PULSING DOT** (`pulse: true`, 2026-10-01 — the owner's own words: "a little orange
 *  dot, the primary color, pretty small, but then kind of just grows, bounces... it stays in
 *  place but fluctuates, the size of it pulses with the audio... bottom right corner maybe").
 *  Replaces `level`'s meter bar's job (no fixed-height bar needed) with one small circle, so
 *  `level` and `pulse` are two different DISPLAYS of the exact same smoothed 0..1 number
 *  (`Dictate`'s own `on_meter` — see `Widget.Composer`'s own `on_meter` line, above) — turn
 *  on whichever one a caller wants, or neither; turning one on never touches the other.
 *
 *  TWO STATES, matching the owner's own words exactly:
 *  - **locked** (mic off, the default): a darkened card over the whole feed, "tap to talk" —
 *    tapping it anywhere calls `widget.start_mic()`, which both unlocks (this card goes away,
 *    `locked(false)`, fired by the mic's own `on_start` hook below) AND turns the mic on, in
 *    one tap, same as the owner described.
 *  - **live** (mic on): the lock is gone, just the small dot, bottom-right, sized by
 *    `set_level()` below. Tapping the dot calls `widget.stop_mic()` — the owner: "maybe you
 *    can tap on it" — which re-locks once the mic really stops (`on_stop`, below).
 *
 *  WHY A WRAPPING BOX (`Widget.render()`'s own `ux-dictate-widget-feed-wrap`, above) instead
 *  of a plain child of `Widget.Thread`: the thread's own element is what SCROLLS now
 *  (`sticky_scroll`, the chat-autoscroll merge) — a child positioned `absolute` inside a
 *  scrolling box scrolls away with it, so both the lock and the dot would drift out of sight
 *  the moment there's enough history to scroll. The wrap sits OUTSIDE that scrolling element,
 *  so this view's own `inset: 0`/bottom-right positioning always lines up with the visible
 *  feed, never the scrolled-away content (`Widget.css`'s own comment has the exact rule).
 *
 *  `set_level()` only ever runs while live (`Widget.Composer`'s own `on_meter` still fires
 *  while idle too, briefly, before the first `on_start`? — no: `on_meter` is `Dictate`'s own
 *  `on_level()`, only ever called from inside its audio-processing loop, which only runs
 *  while the mic is actually open — so a stray call while locked cannot happen). */
Widget.Pulse = class WidgetPulse extends View {
	render(){
		this.ac("ux-dictate-widget-pulse");
		const w = this.widget;
		w.$pulse = this;

		this.$lock = div.c("ux-dictate-widget-pulse-lock").attr("role", "button").attr("tabindex", "0")
			.attr("title", "tap to start listening").text("tap to talk")
			.click(() => w.start_mic())
			.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); w.start_mic(); } });

		this.$dot = div.c("ux-dictate-widget-pulse-dot").attr("role", "button").attr("tabindex", "0")
			.attr("title", "tap to stop listening")
			.click(() => w.stop_mic())
			.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); w.stop_mic(); } });

		// Starts LOCKED — `w.dictate` (the real mic) isn't built yet at this point in
		// `Widget.render()` (`Thread`/`Pulse` are built before `Composer`), so `mic_active()`
		// reads as idle either way; this just states the true default out loud.
		this.locked(true);
	}

	/** The live audio level, 0..1 — the exact number `level`'s meter bar reads, grown into a
	 *  CSS custom property (`Widget.css`'s own `--ux-dictate-widget-pulse-level`) so the dot's
	 *  own `transform: scale(...)` can read it with no JS layout work on every audio frame. */
	set_level(level){ this.$dot.style("--ux-dictate-widget-pulse-level", Math.min(1, level).toFixed(3)); }

	/** `true` = locked (mic off): show the darkened "tap to talk" card, hide the dot, and
	 *  reset the dot back to its resting size so the NEXT time it shows live it starts small,
	 *  never still scaled up from whatever the level was the instant the mic stopped. */
	locked(is_locked){
		this.$lock.el.hidden = !is_locked;
		this.$dot.el.hidden = is_locked;
		if (is_locked) this.set_level(0);
	}
};
