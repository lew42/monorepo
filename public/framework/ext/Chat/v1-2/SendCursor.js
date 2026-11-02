// SendCursor.js — Chat V1.2's one ✓: it sits after the last sentence of the newest Prompt the assistant has (`sent.fast.at >=
// sentence.at`), sentences after it are dimmed (.chat-unsent), and the ✓ is dimmed while any wait, lit green once caught up.
// A switchable part: start() begins marking, stop() removes its DOM and leaves the bubble plain V1.2. Doc: ./readme.md.
import Prompt from "/framework/core/Session/Chat/Prompt.js";
import { cursor_el } from "../cursors.js";

export default class SendCursor {
	static id = "send-cursor";
	static defaults = { on: true };

	cursor = cursor_el();   // the one ✓ — moved by re-appending, never a second one (cursors.css)
	on = false;

	// { session, root: () => the chat's log element (V1's view.el) }
	constructor({ session, root }){ this.session = session; this.root = root; }

	start(){ this.on = true; this.mark(); return this; }
	stop(){ this.on = false; this.clear(); return this; }

	/** The newest Prompt's sentences split at the cursor: { received, waiting } (sentence ids). Pure data, no DOM. */
	split(){
		const p = this.session.messages.messages.filter(m => m instanceof Prompt).at(-1);
		if (!p) return { received: [], waiting: [] };
		const got = Date.parse(p.sent?.fast?.at ?? 0) || 0, received = [], waiting = [];
		for (const s of p.sentence_items) (got && (Date.parse(s.at) || 0) <= got ? received : waiting).push(s.id);
		return { received, waiting };
	}

	clear(){
		this.cursor.remove();
		this.root()?.querySelectorAll(".chat-unsent").forEach(n => n.classList.remove("chat-unsent"));
	}

	/** Call after every draw: chat() rebuilds a bubble's text nodes whenever it grows, which drops the ✓ and the dimming. */
	mark(){
		const root = this.root();
		if (!this.on || !root) return;
		this.clear();
		const { received, waiting } = this.split(), at = id => root.querySelector(`[data-re="${CSS.escape(id)}"]`);
		for (const id of waiting) at(id)?.classList.add("chat-unsent");
		const last = at(received.at(-1) ?? "");
		if (!last) return;
		this.cursor.classList.add("done");
		this.cursor.classList.toggle("chat-cursor-waiting", waiting.length > 0);
		this.cursor.title = waiting.length ? "the assistant has these words; the rest is on its way" : "the assistant has every word";
		(last.lastElementChild ?? last).append(this.cursor);
	}
}
