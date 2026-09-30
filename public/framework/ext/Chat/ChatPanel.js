import { View } from "/app.js";
import { chat } from "./Chat.js";
import { composer } from "./Composer.js";

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

		// Both factories are bare calls, not wrapped in a capture callback: `render()`
		// is already running inside its own `append_fn` (`code` skill's own captor
		// note), the captor is still `this`, and `div.c(...)` inside each one appends
		// itself the moment it is built — a second, manual `this.append()` here would
		// only move the same element a second time.
		this.talk = chat({
			source: this.source ?? (() => local),
			keep: this.keep,
			answer: this.answer ?? (() => {}),
		});

		// ⚠ THE LINE A FUTURE REFINE-LEVEL OPTION EXTENDS (voice-sessions
		// coordination, 2026-09-29 — `ext/drawer/tabs/ai.js` and `rail.js` both
		// point back here): `composer()` builds the microphone; a `refine:` value
		// added to this call is the one place it would reach every host of
		// `ChatPanel` at once.
		this.compose = composer({
			deliver: this.deliver ?? (async entry => { local.push(entry); this.sync(); return true; }),
			re: this.re,
			mic: this.mic,
			autostart: this.autostart,
			max: this.max,
			placeholder: this.placeholder ?? "say something",
			hint: this.hint ?? "",
			sent: this.sent ?? "sent",
			failed: this.failed ?? "nothing was sent",
			on_text: text => this.on_text?.(text),
		});

		this.sync();
	}

	/** Draw whatever is new since the last call — same contract as `chat().sync()`. */
	sync(){ this.talk.sync(); return this; }

	/** Add one entry to the panel's OWN list (ignored once a real `source` is given) and draw it. */
	say(entry){ this.entries.push(entry); return this.sync(); }
}
// On the prototype (`code` skill §4: `classify()` runs inside `super()`, before a
// class field would exist) — the one class this View mints, matching Chat.js's
// and Composer.js's own `chatbox-*` prefix rather than the `chat-panel` `classify()`
// would guess from the constructor's name.
ChatPanel.prototype.classes = "chatbox-panel";

export default ChatPanel;
