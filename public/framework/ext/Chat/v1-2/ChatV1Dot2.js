// ChatV1Dot2.js — Chat V1.2: V1 (../Chat.js, untouched) drawing `session.messages` instead of `{chat}` lines, plus ONE send cursor.
// V1's own `chat({source})` still does every draw (bubbles, merging, order, threads, replies); this class only swaps what feeds it:
// `V1Bubbles.events(session)` (core/Session/Chat/V1Bubbles.js) becomes the `{chat}` entries `chat()` expects, so the 0-diff compare
// (Server/ChatV1Compare.mjs) is also the proof the two feeds draw the same bubbles.
// The cursor: after the last sentence of the newest Prompt the assistant has (`sent.fast.at >= sentence.at`). Sentences after it have
// ended but are not received yet: they are dimmed (.chat-unsent), and the ✓ is dimmed while any wait, lit green once caught up.
// Owner doc: ./readme.md.
import View from "/framework/core/View/View.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";
import Session from "/framework/core/Session/Session.js";
import V1Bubbles from "/framework/core/Session/Chat/V1Bubbles.js";
import LineKey from "/framework/core/Item/LineKey.js";
import { chat } from "../Chat.js";
import SendCursor from "./SendCursor.js";
View.stylesheet(import.meta, "ChatV1Dot2.css");

export default class ChatV1Dot2 extends JSONL {
	session = new Session();
	emitted = new Map();      // event id -> the text last handed to chat(); a changed text goes in again as a `fix`
	send_cursor = new SendCursor({ session: this.session, root: () => this.talk?.view.el }).start();   // the ✓ + dimming; .stop() leaves plain V1.2

	/** The `{chat}` entries V1's chat() reads, from the session's messages. A sentence whose text changed since (a fast-seat improve)
	 * is sent again as a `fix`, the same way V1 corrects a line in place. */
	entries(){
		const out = [];
		for (const e of V1Bubbles.events(this.session)){
			const prior = this.emitted.get(e.id), said_at = new Date(e.at).toISOString();
			const from = e.sender === "owner" ? { kind: "owner" } : { kind: "assistant", id: e.sender };
			const chat = { at: e.id, said_at, from, text: e.text, ...(e.re ? { re: e.re } : {}), ...(e.level ? { level: e.level } : {}) };
			if (prior === undefined) out.push({ at: said_at, chat });
			else if (prior !== e.text) out.push({ at: said_at, chat: { ...chat, fix: true } });
			this.emitted.set(e.id, e.text);
		}
		return out;
	}

	// { url: the session.jsonl url, $box: the View to draw into }
	read(entries){
		if (!this.talk){
			this.talk = chat({ source: () => this.entries(), ...(this.options ?? {}) });
			this.$box?.append(this.talk.view);
			this.$box?.ac("chat-v1-2");
		}
		for (const raw of entries){
			const line = LineKey.deep(raw);
			if (line?.chat || line?.place) continue;   // V1's own lines: the real update is the messages/sentences mirror line
			this.session.replay_line(line);
		}
		this.talk.sync();
		this.send_cursor.mark();
		return this;
	}
	reset(){ this.session = new Session(); this.emitted.clear(); this.send_cursor.clear(); this.send_cursor.session = this.session; this.talk?.view.el.replaceChildren(); this.talk = null; return super.reset(); }
	live(){ super.live(() => {}); return this; }
}
