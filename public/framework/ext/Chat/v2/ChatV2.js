// ChatV2.js — a session's chat, read only: its session.jsonl streamed, folded (ChatV2Model) and drawn in list order,
// then kept live by patching only what each new line touched (one element per id). Doc: readme.md
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
	els = new Map();        // id → the View that draws it (a prompt, a child, or a reply)
	parts = new Map();      // prompt id → { head, raw, nest }: the three containers a prompt patches separately

	// { url: the session.jsonl url, $box: the View to draw into }
	read(entries){
		const first = !this.model;
		this.lines.push(...entries);
		if (first) { this.draw(); return this; }
		for (const entry of entries) this.apply_one(entry);
		return this;
	}
	reset(){ this.lines = []; this.model = null; this.els.clear(); this.parts.clear(); return super.reset(); }   // the file was rewritten: the replay that follows is a first draw
	live(){ super.live(() => {}); return this; }

	draw(){
		this.model = this.constructor.Model.fold(this.lines);
		this.els.clear(); this.parts.clear();
		const roots = this.model.roots();
		this.$box?.empty(() => {
			if (!roots.length) return div.c("chat-v2-empty", "Nothing said in this session yet.");
			for (const n of roots) this.constructor.Model.kind(n) === "Prompt" ? this.prompt(n) : this.child(n);
		});
	}

	// One streamed line, already folded into the model (see read()): patch only what it touched.
	// An add appends one new element where it belongs; a field change re-renders only that item's own
	// element. Everything else — siblings, the parent's other children, every other prompt — is never
	// touched, so it keeps its DOM object (and the page keeps its scroll position).
	apply_one(line){
		const touch = this.model.apply(line);
		if (!touch) return;
		if (!touch.added) { this.patch(touch.id); return; }
		const M = this.constructor.Model, node = this.model.by_id.get(touch.id);
		if (!node) return;
		if (touch.parent === null) {
			this.$box?.el.querySelector(":scope > .chat-v2-empty")?.remove();
			if (M.kind(node) === "Prompt") { this.$box?.append(() => this.prompt(node)); return; }
			const home = node.from && this.parts.get(node.from);   // a root Task or Question whose `from` names a drawn prompt sits in its nest (ChatV2Model.children)
			home ? home.nest.append(() => this.child(node)) : this.$box?.append(() => this.child(node));
			return;
		}
		const owner = this.parts.get(touch.parent);
		if (!owner) return;   // the parent isn't a drawn prompt (deeper nesting the view never shows)
		touch.reply ? this.insert_reply(touch.parent, node) : owner.nest.append(() => this.child(node));
	}

	// A reply beside its sentence when sentences are shown for its prompt right now, else listed in the nest.
	insert_reply(prompt_id, r){
		const M = this.constructor.Model, n = this.model.by_id.get(prompt_id), owner = this.parts.get(prompt_id);
		if (!owner) return;
		const sentences_shown = this.sentences_shown(n);
		if (M.anchor(r) && sentences_shown) this.patch(prompt_id);   // re-place beside its sentence
		else owner.nest.append(() => this.reply(r, n));
	}

	// Anchored replies sit beside their sentence while the sentences show (head), else in the nest. When that flips,
	// move just those replies, so every other element in the nest keeps its DOM object.
	move_anchored(n, owner, shown){
		const M = this.constructor.Model, kid = owner.nest.el.querySelector(":scope > .chat-v2-child");
		for (const r of M.replies(n).filter(r => M.anchor(r))) {
			owner.nest.el.querySelector(`:scope > [data-id="${r.id}"]`)?.remove();
			if (shown) continue;
			owner.nest.append(() => this.reply(r, n));
			owner.nest.el.insertBefore(this.els.get(r.id).el, kid);   // replies come before the children, as in prompt_nest
		}
	}

	// A field changed on an item that is already drawn: re-render only its own element.
	patch(id){
		const n = this.model.by_id.get(id);
		if (!n) return;
		const M = this.constructor.Model;
		if (this.parts.has(id)) {
			const owner = this.parts.get(id), replies = M.replies(n);
			owner.head.empty(() => this.prompt_head(n, replies));
			owner.raw.empty(() => this.prompt_raw_wrap(n, replies));
			const shown = this.sentences_shown(n);   // where anchored replies sit flipped (show raw, or a first title): the nest's list changes too
			if (shown !== owner.shown) { owner.shown = shown; this.move_anchored(n, owner, shown); }
			return;
		}
		if (!n.type) return;   // a reply: nothing here edits one once it is added
		const view = this.els.get(id);
		if (!view) return;
		view.attr("data-phase", M.phase(n));
		view.empty(() => this.child_body(n));
	}

	// One prompt at the root of the chat (no bubble): the refined version, "show raw", then everything it
	// led to, nested under the brain. Three containers (head, raw, nest) so a later field change can
	// re-render just one of them without disturbing the others.
	prompt(n){
		const M = this.constructor.Model;
		let head, raw, nest;
		const view = div.c("chat-v2-prompt", () => {
			head = div.c("chat-v2-head", () => this.prompt_head(n, M.replies(n)));
			raw = div.c("chat-v2-raw-wrap", () => this.prompt_raw_wrap(n, M.replies(n)));
			nest = div.c("chat-v2-nest", () => this.prompt_nest(n, M.replies(n)));
		}).attr("data-id", n.id);
		this.els.set(n.id, view);
		this.parts.set(n.id, { head, raw, nest, shown: this.sentences_shown(n) });
		return view;
	}

	prompt_head(n, replies){
		const M = this.constructor.Model, refined = M.refined(n);
		if (M.title(n)) h3.c("chat-v2-title", M.title(n));
		if (refined && M.text(n)) div.c("chat-v2-text", M.text(n));
		if (!refined) this.sentences(n, replies);
	}

	prompt_raw_wrap(n, replies){
		const M = this.constructor.Model, open = this.raw_open.has(n.id);
		const hidden = [...M.raw(n), ...(M.refined(n) ? M.paragraphs(n) : [])].length > 0;
		if (hidden) button.c("chat-v2-toggle", open ? "hide raw" : "show raw").attr("type", "button").attr("aria-expanded", String(open))
			.click(() => { open ? this.raw_open.delete(n.id) : this.raw_open.add(n.id); this.patch(n.id); });
		if (open) div.c("chat-v2-raw", () => {
			small.c("chat-v2-label", "What was said (raw)");
			for (const line of M.raw(n)) blockquote.c("chat-v2-raw-line", line);
			if (M.refined(n)) { small.c("chat-v2-label", "Cleaned into paragraphs"); this.sentences(n, replies); }
		});
	}

	// The sentence rows show when there is no refined version yet, or "show raw" is open; an anchored reply then sits beside its sentence, not in the nest.
	sentences_shown(n){ return !this.constructor.Model.refined(n) || this.raw_open.has(n.id); }

	prompt_nest(n, replies){
		const M = this.constructor.Model, sentences_shown = this.sentences_shown(n);
		const listed = replies.filter(r => !sentences_shown || !M.anchor(r));
		listed.forEach(r => this.reply(r, n));
		this.model.children(n).forEach(k => this.child(k));
	}

	// The paragraphs as sentence rows; a reply anchored to a sentence sits beside it (below it on a phone).
	sentences(n, replies){
		const M = this.constructor.Model;
		for (const s of M.sentences(n)) {
			const here = replies.filter(r => M.anchor(r)?.sentence === s.id);
			div.c("chat-v2-sentence", () => {
				div.c("chat-v2-sentence-text", () => this.words(s.text, here.map(r => M.words_range(M.anchor(r))).find(Boolean)));
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
		const view = div.c("chat-v2-reply", () => this.reply_body(r, prompt, quote)).attr("data-id", r.id);
		this.els.set(r.id, view);
		return view;
	}

	reply_body(r, prompt, quote){
		const M = this.constructor.Model, a = M.anchor(r), s = a && M.sentences(prompt).find(x => x.id === a.sentence);
		span.c("chat-v2-brain", "🧠").attr("title", r.by ?? "the smart assistant");
		div.c("chat-v2-body", () => {
			if (quote && s) blockquote.c("chat-v2-quote", () => this.words(s.text, M.words_range(a)));
			div.c("chat-v2-reply-text", r.text);
		});
	}

	// A Question or a Task under a prompt: its state as one icon, its text, and a Question's answer under it.
	child(n){
		const view = div.c("chat-v2-child", () => this.child_body(n)).attr("data-id", n.id).attr("data-phase", this.constructor.Model.phase(n));
		this.els.set(n.id, view);
		return view;
	}

	child_body(n){
		const M = this.constructor.Model, phase = M.phase(n), question = M.kind(n) === "Question", answer = question && M.answer(n);
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
	}
}
