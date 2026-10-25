// ChatV2.js — a session's chat, read only: its session.jsonl streamed, folded (ChatV2Model) and drawn in list order. Doc: readme.md
import View, { div, span, button, h3, mark, blockquote, small, icon } from "/framework/core/View/View.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";
import TaskView from "/framework/core/Task/TaskView.js";
import ChatV2Model from "./ChatV2Model.js";
View.stylesheet(import.meta, "ChatV2.css");

export default class ChatV2 extends JSONL {
	static Model = ChatV2Model;
	static QUESTION_ICON = { open: "help_outline", answered: "mark_chat_unread", complete: "check_box" };

	lines = [];
	raw_open = new Set();   // prompt ids whose raw text is showing; kept here so a live redraw does not close it

	// { url: the session.jsonl url, $box: the View to draw into }
	read(entries){ this.lines.push(...entries); this.draw(); return this; }
	reset(){ this.lines = []; return super.reset(); }
	live(){ super.live(() => {}); return this; }

	draw(){
		this.model = this.constructor.Model.fold(this.lines);
		const roots = this.model.roots();
		this.$box?.empty(() => {
			if (!roots.length) return div.c("chat-v2-empty", "Nothing said in this session yet.");
			for (const n of roots) this.constructor.Model.kind(n) === "Prompt" ? this.prompt(n) : this.child(n);
		});
	}

	// One prompt at the root of the chat (no bubble): the refined version, "show raw", then everything it led to, nested under the brain.
	prompt(n){
		const M = this.constructor.Model, refined = M.refined(n), open = this.raw_open.has(n.id);
		const hidden = [...M.raw(n), ...(refined ? M.paragraphs(n) : [])].length > 0;
		const sentences_shown = !refined || open;
		const replies = M.replies(n), kids = this.model.children(n);
		div.c("chat-v2-prompt", () => {
			if (M.title(n)) h3.c("chat-v2-title", M.title(n));
			if (refined && M.text(n)) div.c("chat-v2-text", M.text(n));
			if (!refined) this.sentences(n, replies);
			if (hidden) button.c("chat-v2-toggle", open ? "hide raw" : "show raw").attr("type", "button").attr("aria-expanded", String(open))
				.click(() => { open ? this.raw_open.delete(n.id) : this.raw_open.add(n.id); this.draw(); });
			if (open) div.c("chat-v2-raw", () => {
				small.c("chat-v2-label", "What was said (raw)");
				for (const line of M.raw(n)) blockquote.c("chat-v2-raw-line", line);
				if (refined) { small.c("chat-v2-label", "Cleaned into paragraphs"); this.sentences(n, replies); }
			});
			const listed = replies.filter(r => !sentences_shown || !M.anchor(r));
			if (listed.length || kids.length) div.c("chat-v2-nest", () => {
				listed.forEach(r => this.reply(r, n));
				kids.forEach(k => this.child(k));
			});
		}).attr("data-id", n.id);
	}

	// The paragraphs as sentence rows; a reply anchored to a sentence sits beside it (below it on a phone).
	sentences(n, replies){
		const M = this.constructor.Model;
		for (const s of M.sentences(n)) {
			const here = replies.filter(r => M.anchor(r)?.sentence === s.id);
			div.c("chat-v2-sentence", () => {
				div.c("chat-v2-sentence-text", () => this.words(s.text, here.map(r => M.anchor(r).words).find(Boolean)));
				if (here.length) div.c("chat-v2-beside", () => here.forEach(r => this.reply(r, n, false)));
			}).attr("data-sentence", s.id);
		}
	}

	// A sentence's text, with the words a reply points at marked ([start, end): end exclusive).
	words(text, range){
		if (!range) return span(text);
		const w = text.split(/\s+/), [a, b] = range;
		if (a > 0) span(w.slice(0, a).join(" ") + " ");
		mark.c("chat-v2-mark", w.slice(a, b).join(" "));
		if (b < w.length) span(" " + w.slice(b).join(" "));
	}

	reply(r, prompt, quote = true){
		const M = this.constructor.Model, a = M.anchor(r), s = a && M.sentences(prompt).find(x => x.id === a.sentence);
		div.c("chat-v2-reply", () => {
			span.c("chat-v2-brain", "🧠").attr("title", r.by ?? "the smart assistant");
			div.c("chat-v2-body", () => {
				if (quote && s) blockquote.c("chat-v2-quote", () => this.words(s.text, a.words));
				div.c("chat-v2-reply-text", r.text);
			});
		}).attr("data-id", r.id);
	}

	// A Question or a Task under a prompt: its state as one icon, its text, and a Question's answer under it.
	child(n){
		const M = this.constructor.Model, phase = M.phase(n), question = M.kind(n) === "Question", answer = question && M.answer(n);
		div.c("chat-v2-child", () => {
			span.c("chat-v2-brain", "🧠");
			div.c("chat-v2-body", () => {
				div.c("chat-v2-child-head", () => {
					icon(question ? this.constructor.QUESTION_ICON[phase] : TaskView.STAGE[phase] ?? "help").ac("chat-v2-state", "is-" + phase);
					span.c("chat-v2-kind", question ? "Question" : "Task");
					span.c("chat-v2-child-text", M.label(n));
					span.c("chat-v2-phase", phase);
				});
				if (answer) div.c("chat-v2-answer", answer.text);
			});
		}).attr("data-id", n.id).attr("data-phase", phase);
	}
}
