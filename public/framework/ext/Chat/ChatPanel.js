import { View } from "/app.js";
import { chat } from "./Chat.js";
import { composer } from "./Composer.js";
import { watch as watch_session } from "/framework/ext/Session/Session.js";
import { rename_options } from "/framework/ux/Rename/Rename.js";
import { marks } from "/framework/ux/Understand/Understand.js";

View.stylesheet(import.meta, "Chat.css");

/**
 * ONE CHAT WIDGET: the scrolling log (`Chat.js`) plus the composer and its
 * microphone (`Composer.js`), as one class with one view — so the desktop
 * drawer's AI tab and the mobile sheet can both build the exact same thing
 * instead of two hand-rolled copies (the owner, 2026-09-29: "we need a
 * consistent chat widget… whether it's in a desktop sidebar or a mobile
 * sheet").
 *
 *     const panel = new ChatPanel({ source: () => entries, deliver: async e => post(e) });
 *     panel.view;      // === panel — a View; place it anywhere
 *     panel.sync();    // draw whatever is new in source() — call after entries change
 *
 * With no `source`/`deliver`, the panel keeps its own list — `panel.say(entry)`
 * appends to it and draws — which is all the demo below needs, and all a fresh
 * caller has to write to see it working.
 *
 * VARIABLE HEIGHT, PURE CSS (Chat.css's `.chatbox-panel`): the panel starts as
 * tall as its composer plus a message or two, grows with its content, and stops
 * at `--chatbox-panel-max` (70vh by default — set it on a host to change it,
 * e.g. `--chatbox-panel-max: 100%` for a host that is already the full height
 * of the drawer). Past that height only the LOG scrolls; the composer stays put
 * at the bottom. No JS measures anything — it is a flex column with a
 * `max-height` on the box and `min-height: 0` on the log, the standard way to
 * let one flex child absorb the overflow.
 */
export class ChatPanel extends View {
	render(){
		const local = [];
		// Kept even when a real `source` is given, so `say()` always works and a
		// caller that never wires one up (the demo, a quick page) still can.
		this.entries = local;
		// The last few RAW owner lines this panel has said, for pairing a later
		// revision to the right one — `handle_revision()`'s own doc has the why.
		this.raw_recent = [];

		// Both factories are bare calls, not wrapped in a capture callback: `render()`
		// is already running inside its own `append_fn` (`code` skill's own captor
		// note), the captor is still `this`, and `div.c(...)` inside each one appends
		// itself the moment it is built — a second, manual `this.append()` here would
		// only move the same element a second time.
		// `watch` — an `ext/Session` file url: every RAW `{chat:{...}}` line it
		// polls (Session.watch()) lands in `local` UNCHANGED — never through
		// `Session.entry()`, which flattens to the old `{type,by,text}` shape and
		// would drop `re`/`level` on the floor. This is what lets a future
		// voice-sessions assistant's own revision lines pair the exact same way
		// a Dictate-fed one does (`readme.md`'s "revision line", agreed with
		// mastermind-servex-7, 2026-09-29): `chat_line()` only reads the shape.
		if (this.watch) this.stop_watch = watch_session(this.watch, line => {
			if (line.chat) local.push(line);
			this.sync();
		});

		// `local` is read even when a real `source` is given (merged in) — both
		// `say()`'s own writes (a revision this panel paired itself) and a
		// watched session's lines need somewhere to land that `source()` alone,
		// reading only a card's own persisted entries, would never show.
		this.talk = chat({
			source: this.source ? () => [...local, ...this.source()] : () => local,
			keep: this.keep,
			answer: this.answer ?? (() => {}),
			// SELECT (deliverable 2): one bubble at a time, tracked here only so
			// `handle_rename()` knows nothing else — `chat()` itself owns the DOM.
			on_select: sel => { this.selected = sel; },
			// RENAME (deliverable 3): `ux/Rename`'s own ask, reused as-is; `chat()`
			// draws the button and the dropdown, this panel only delivers the pick.
			rename: { options: rename_options, on_renamed: (info, name) => this.deliver_rename(info, name) },
			// ✓/? MARKS (deliverable 4): behind its own option, `ux/Understand`'s
			// own ask, reused as-is.
			marks: this.marks ? marks : undefined,
			on_unclear: (c, m) => this.handle_unclear(c, m),
		});

		// ⚠ THE LINE A FUTURE REFINE-LEVEL OPTION EXTENDS (voice-sessions
		// coordination, 2026-09-29 — `ext/drawer/tabs/ai.js` and `rail.js` both
		// point back here): `composer()` builds the microphone; a `refine:` value
		// added to this call is the one place it would reach every host of
		// `ChatPanel` at once.
		this.compose = composer({
			// The default (no real `deliver`): the universal chat-line shape, straight
			// through `say()` — so even the plain demo remembers its raw line and can
			// pair a revision to it, same as every other caller.
			deliver: this.deliver ?? (async entry => {
				this.say({ chat: { at: entry.at ?? new Date().toISOString(), from: { kind: "owner" }, via: entry.via, text: entry.text } });
				return true;
			}),
			re: this.re,
			mic: this.mic,
			autostart: this.autostart,
			max: this.max,
			placeholder: this.placeholder ?? "say something",
			hint: this.hint ?? "",
			sent: this.sent ?? "sent",
			failed: this.failed ?? "nothing was sent",
			on_text: text => this.on_text?.(text),
			// PASSED THROUGH UNCHANGED (2026-09-29 reconcile): clean-transcription's
			// own composer already defaults `revise` to `false` and AI 2 turns on
			// `"clean"` itself — a default of `"edit"` HERE used to fight that and
			// force every host into a mode it never asked for. A revision pair
			// (below) draws for a LINE that carries `re` + `level`, never for the
			// mode alone, so removing this default costs the pair nothing.
			// DEFAULT "clean" (dictation-stream, 2026-09-30): the ✦ sheet never set `revise`, so with
			// SETTINGS.clean on its bubbles were still raw Whisper (the owner: "it doesn't look like
			// you're fixing punctuation"). `revise: false` still turns it off for one host; the gear's
			// kill switch (SETTINGS.clean) turns it off everywhere.
			revise: this.revise === undefined ? "clean" : this.revise,
			// DICTATION INTO THE CHAT (SETTINGS.into, Mic.js): the words grow in a bubble in the log.
			on_live: state => this.talk.live(state),
			on_revised: (text, meta) => this.handle_revision(text, meta.raw, meta.level),
			// RENAME (deliverable 3): "rename this" is a command, not a message —
			// `chat()`'s own `rename_selected()` starts the dropdown on whatever is
			// selected and reports whether there WAS one; nothing selected falls
			// through and this text sends as a plain line, same as any typo would.
			try_command: text => /^rename this[.!]?$/i.test(text) && this.talk.rename_selected(),
		});

		this.sync();
	}

	/** Draw whatever is new since the last call — same contract as `chat().sync()`. */
	sync(){ this.talk.sync(); return this; }

	/** An assistant's reply while it is still being written (`chat().stream()`); `""` removes it. */
	stream(who, text){ this.talk.stream(who, text); return this; }

	/** Add one entry to the panel's OWN list (ignored once a real `source` is given) and draw it.
	 *  A fresh RAW owner line (`{chat: {from: {kind: "owner"}, text, …}}`, no `re` of its own) is
	 *  also remembered — see `handle_revision()` below. */
	say(entry){
		if (entry.chat && entry.chat.from?.kind === "owner" && !entry.chat.re) this.remember_raw(entry.chat);
		this.entries.push(entry);
		return this.sync();
	}

	remember_raw(c){
		this.raw_recent.push({ at: c.at, text: c.text });
		if (this.raw_recent.length > 20) this.raw_recent.shift();
	}

	/** A REVISION of something already said — `ux/Revise` running in the
	 *  background off `ux/Dictate`'s own `revise:` option, a moment after the
	 *  raw words landed. Paired to its raw line by a `re` (the raw line's own
	 *  `at`) + `level` on the chat line itself (`ext/Chat/readme.md`'s
	 *  "revision line"), not by who wrote it — a future voice-sessions
	 *  assistant writing that same shape into a session file needs no change
	 *  here (the mastermind, 2026-09-29).
	 *
	 *  `raw` is the RAW TEXT `ux/Dictate` revised, not an id — `on_revised`'s
	 *  own shape (`ux/Dictate/readme.md`) hands back the words, not a chunk
	 *  id, so the match is by TEXT against the panel's own `raw_recent` (most
	 *  recent unpaired match wins). A caller with its own real session log
	 *  (a card's persisted thread, not this panel's local list) needs its own
	 *  `deliver` to remember its raw lines the same way for this to find them
	 *  — `readme.md`'s "Left open" note. */
	handle_revision(text, raw, level){
		const hit = [...this.raw_recent].reverse().find(r => r.text === raw && !r.used);
		if (!hit) return;   // no raw line to pair with — never shown as a standalone line either (readme.md)
		hit.used = true;
		this.say({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, text, re: hit.at, level } });
	}

	/** RENAME (deliverable 3): a name chosen on a selected bubble's dropdown
	 *  (`ux/Rename`'s own ask — `Chat.js`'s `chat()` draws it, this only answers
	 *  the pick). Delivers the SAME `at` as the renamed piece, `fix: true`, and
	 *  the new title — the exact shape any other correction uses, so latest
	 *  wins everywhere the log is read (readme.md). `this.deliver` is asked
	 *  first, same as a typed message would be, so a real caller (a card, a
	 *  session) can persist it for real; with none, `say()` writes it straight
	 *  to this panel's own list, same as the demo. */
	async deliver_rename(info, name){
		const at = info.piece?.id ?? new Date().toISOString();
		const entry = { at, type: "prompt", by: "owner", text: name, via: "typed", fix: true };
		if (this.deliver){ try { await this.deliver(entry); } catch (e){ console.error("chat: rename delivery failed", e); } }
		else this.say({ chat: { at, from: { kind: "owner" }, text: name, fix: true } });
	}

	/** ✓/? MARKS (deliverable 4, behind `marks: true`): an UNCLEAR line drops
	 *  ONE clarification card into the flow — `place`-d at `ux/Content/Decision`,
	 *  the exact same card `ux/Understand`'s own demo already uses, unmodified. */
	handle_unclear(c, m){
		this.say({ chat: {
			at: new Date().toISOString(),
			from: { kind: "assistant" },
			place: {
				module: "/framework/ux/Content/Decision/Decision.js",
				id: "clarify-" + c.at,
				ask: m.question.ask,
				options: m.question.options.map(say => ({ say })),
				// THE LOOP-BACK: a real pick (not the "clear it" unchoose, which
				// writes `option: null`) flips the ORIGINAL sentence's ? back to a
				// ✓ — `Chat.js`'s own `resolve_mark()`, keyed on that line's `at`.
				on_chosen: line => {
					if (line.chose?.option == null) return;
					this.talk.resolve_mark(c.at, { mark: "ok", purpose: "Clarified: " + line.chose.option });
				},
			},
		} });
	}
}
// On the prototype (`code` skill §4: `classify()` runs inside `super()`, before a
// class field would exist) — the one class this View mints, matching Chat.js's
// and Composer.js's own `chatbox-*` prefix rather than the `chat-panel` `classify()`
// would guess from the constructor's name.
ChatPanel.prototype.classes = "chatbox-panel";

export default ChatPanel;
