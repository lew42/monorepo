// ChatV2.js — `class ChatV2 extends ChatV3` (views-on-messages.md, step 2): everything is ChatV3 (session.messages, a card per
// Prompt, Replies found by `re.to`, pause-based paragraphs, the live draft). V2 adds only: the ✓/🧠 marks beside the newest
// Prompt's title, a Reply drawn beside the sentence it answers (instead of in the trailing list), and its own CSS.
// The marks stay on the Prompt TASK this step (sent.fast/sent.smart; step 3 moves them onto the message): Sessions.mark_sent
// still writes `{sent:{to,at,re:[owner line "at"...]}}` as a broadcast line, matched to a Prompt TASK id through the V1 `{chat}`
// line's `prompt` field — the same small lookup ChatV2Model used to do, kept here (not the whole old model) until step 3.
import View, { span, div } from "/framework/core/View/View.js";
import ChatV3 from "../v3/ChatV3.js";
import Prompt from "/framework/core/Session/Chat/Prompt.js";
import { cursor_el, smart_cursor_el } from "../cursors.js";
View.stylesheet(import.meta, "ChatV2.css");
View.stylesheet(import.meta, "../cursors.css");

export default class ChatV2 extends ChatV3 {
	prompt_of = new Map();     // an owner line's `at` -> the Prompt TASK id it belongs to, from V1 `{chat}` lines
	sent_by_task = new Map();  // Prompt TASK id -> {fast?: {at}, smart?: {at}}, from `{sent}` broadcast lines

	// Track the V1 `{chat}`/`{sent}` broadcast lines ChatV3 skips (they carry no `session.messages` shape of their own) so the
	// marks below can still find them, same lookup ChatV2Model used to do; everything else replays exactly as ChatV3 does.
	read(entries){
		for (const raw of entries) {
			if (raw?.chat?.from?.kind === "owner" && raw.chat.prompt && raw.chat.at) this.prompt_of.set(raw.chat.at, raw.chat.prompt);
			if (raw?.sent?.to) {
				for (const at of raw.sent.re ?? []) {
					const task_id = this.prompt_of.get(at);
					if (!task_id) continue;
					const rec = this.sent_by_task.get(task_id) ?? {};
					rec[raw.sent.to] = { at: raw.sent.at };
					this.sent_by_task.set(task_id, rec);
				}
			}
		}
		return super.read(entries);
	}
	reset(){ this.prompt_of.clear(); this.sent_by_task.clear(); return super.reset(); }

	// The ✓ (fast)/🧠 (smart) marks, moving: both sit beside the title of the NEWEST Prompt only (never more than one of
	// each on screen), read through its Prompt TASK (`p.prompt`). ✓ colours once the fast seat has the line (`sent.fast`);
	// 🧠 colours once an answer actually exists — a Reply after `sent.smart.at`, or the Prompt's own title/text
	// (views-on-messages.md, "One meaning for the brain icon"). Gray while sent but not yet answered.
	marks(p){
		const newest = this.card_roots().filter(r => r instanceof Prompt).at(-1);
		if (p !== newest) return null;
		const sent = p.prompt && this.sent_by_task.get(p.prompt);
		if (!sent) return null;
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

	// One paragraph, as sentence rows (not one joined string): a Reply with `re.to` naming this sentence is drawn right
	// beside it, instead of in the trailing list after the whole card (ChatV3.trailing_replies, overridden below).
	paragraph(group, p){
		div.c("chat-v3-para", () => group.forEach(s => {
			div.c("chat-v2-sentence", () => {
				div.c("chat-v2-sentence-text", p.clean[s.id] ?? s.text);
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
