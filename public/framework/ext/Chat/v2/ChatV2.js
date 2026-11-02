// ChatV2.js — `class ChatV2 extends ChatV3` (views-on-messages.md, step 2): everything is ChatV3 (session.messages, a card per
// Prompt, Replies found by `re.to`, pause-based paragraphs, the live draft). V2 adds only: the ✓/🧠 marks beside the newest
// Prompt's title, a Reply drawn beside the sentence it answers (instead of in the trailing list), and its own CSS.
// The marks now read straight off the Prompt MESSAGE (step 3): `Sessions.mark_sent` writes `{messages:{<mid>:{sent:{<to>:{at}}}}}`
// through `ChatWriter.sent_line`, and `Prompt.sent` on `core/Session/Chat/Prompt.js` reads it back as `{fast?, smart?}` — no lookup needed.
import View, { span, div } from "/framework/core/View/View.js";
import ChatV3 from "../v3/ChatV3.js";
import Prompt from "/framework/core/Session/Chat/Prompt.js";
import { cursor_el, smart_cursor_el } from "../cursors.js";
View.stylesheet(import.meta, "ChatV2.css");
View.stylesheet(import.meta, "../cursors.css");

export default class ChatV2 extends ChatV3 {
	// The `chat-v3` class goes on `$box` HERE, not in each caller (review finding 1): every caller (the demo page, the
	// session page's Chat tab, the drawer/✦ sheet) gets ChatV3.css's own column/padding rules, with no fence crossing.
	read(entries){
		this.$box?.el.classList.add("chat-v3");
		return super.read(entries);
	}

	// The ✓ (fast)/🧠 (smart) marks, moving: both sit beside the title of the NEWEST Prompt only (never more than one of
	// each on screen), read straight off the Prompt message's own `sent`. ✓ colours once the fast seat has the line
	// (`sent.fast`); 🧠 colours once an answer actually exists — a Reply after `sent.smart.at`, or the Prompt's own
	// title/text (views-on-messages.md, "One meaning for the brain icon"). Gray while sent but not yet answered.
	marks(p){
		const newest = this.card_roots().filter(r => r instanceof Prompt).at(-1);
		if (p !== newest) return null;
		const sent = p.sent;
		if (!sent.fast && !sent.smart) return null;
		const wrap = span.c("chat-v2-marks");
		if (sent.fast || sent.smart) { const fast = cursor_el(); fast.classList.toggle("done", !!sent.fast); wrap.el.append(fast); }
		if (sent.smart) { const smart = smart_cursor_el(); smart.classList.toggle("done", this.smart_answered(p, sent.smart.at)); wrap.el.append(smart); }
		return wrap;
	}
	smart_answered(p, sent_at){
		if (p.text) return true;
		const at = Date.parse(sent_at ?? 0) || 0;
		if (this.replies_of(p).some(r => (Date.parse(r.at ?? 0) || 0) >= at)) return true;
		const task = this.task_for(p);
		return task ? [...(task._tasks ?? []), ...this.nested_tasks(task)].length > 0 : false;
	}

	// Dictation mode (no refined text): each sentence row is its own small bubble of yours, with its Reply plain beneath it (bubbles.css),
	// so the wrapper is a group, not one bubble. With refined text it is the one hugging bubble, as in V3.
	you_class(p){ return p.text ? "chat-v3-you" : "chat-v3-yours"; }

	// One paragraph, as sentence rows (not one joined string): a Reply with `re.to` naming this sentence is drawn right
	// beside it, instead of in the trailing list after the whole card (ChatV3.trailing_replies, overridden below).
	paragraph(group, p){
		div.c("chat-v3-para", () => group.forEach(s => {
			div.c("chat-v2-sentence", () => {
				div.c("chat-v2-sentence-text chat-v3-you", p.clean[s.id] ?? s.text);
				const here = this.replies_of(p).filter(r => r.re?.to === s.id);
				if (here.length) div.c("chat-v2-beside", () => here.forEach(r => this.reply(r)));
			}).attr("data-sentence", s.id);
		}));
	}
	// Dictation mode (no refined text yet) draws every reply beside its sentence (paragraph(), above); once a Prompt has
	// refined text, sentence rows never show, so replies stay in the normal trailing list, exactly as ChatV3 draws them.
	trailing_replies(p){
		if (p.text) return super.trailing_replies(p);
		const anchored = new Set(p.sentence_items.map(s => s.id));
		return this.replies_of(p).filter(r => !anchored.has(r.re?.to));
	}
}
