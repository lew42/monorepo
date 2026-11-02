// ChatV3.js — a session's chat as a VIEW over `session.messages` (core/Session/Chat/readme.md; views-on-messages.md, step 1): one card
// per Prompt, in the list's order, with the Replies that answer it (found by `re.to`, a sentence id of that Prompt) drawn inside it.
// Tasks and Questions still sit beside their Prompt, found through the Prompt message's `prompt` link to its Prompt TASK (session.tasks).
// It never writes and never reshapes a message. This is the one chat view; step 2 (views-on-messages.md) makes ChatV2 its subclass.
import View, { div, span, a, button, h3, h4, small, blockquote, icon } from "/framework/core/View/View.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";
import Session from "/framework/core/Session/Session.js";
import Message from "/framework/core/Session/Chat/Message.js";
import Prompt from "/framework/core/Session/Chat/Prompt.js";
import Reply from "/framework/core/Session/Chat/Reply.js";
import Sentence from "/framework/core/Session/Chat/Sentence.js";
import List from "/framework/core/List/List.js";
import Question from "/framework/core/Task/Question.js";
import TaskView from "/framework/core/Task/TaskView.js";
import LineKey from "/framework/core/Item/LineKey.js";
import { md_into } from "../md.js";
import * as Wire from "/framework/ext/Session/Session.js";
import { owning_prompt, paragraphs } from "./placement.js";
View.stylesheet(import.meta, "ChatV3.css");

export default class ChatV3 extends JSONL {
	static SHOW = 40;          // roots drawn at first; "show earlier" adds this many more
	static ASK_ICON = { open: "help_outline", answered: "mark_chat_unread", complete: "check_box" };

	session = new Session();
	els = new Map();           // root id -> the View that draws it
	dirty = new Set();         // roots (Prompt or plain Message) to refill after this batch
	listening = false;
	partial = null;            // the reply being written right now, from the session's live wire: {role, text}
	raw_open = new Set();      // prompt ids whose raw words are open
	limit = this.constructor.SHOW;

	// { url: the session.jsonl url, $box: the View to draw into }
	read(entries){
		const first = !this.drawn;
		if (!this.listening){
			this.listening = true;
			this.session.on("delta", (line, from) => {
				const member = this.added_member(line, from);
				if (member instanceof Reply) { this.partial = null; this.$partial?.el.remove(); }   // its settled Reply landed: stop drawing the partial
				const card = this.card_for(member); if (card) this.dirty.add(card);
			});
		}
		for (const raw of entries){
			const line = LineKey.deep(raw);   // `start()` and `#c3` read as start and c3 (D13)
			if (line?.chat || line?.place) continue;   // V1-only; the real update is the separate messages/sentences mirror line
			this.session.replay_line(line);
		}
		if (first) this.draw(); else this.update();
		this.dirty.clear();
		return this;
	}
	reset(){ this.session = new Session(); this.els.clear(); this.dirty.clear(); this.listening = false; this.drawn = false; return super.reset(); }
	live(){ super.live(() => {}).then(() => { if (this.stopped) super.unsubscribe(); }); this.listen(true); this.wire(true); return this; }
	unsubscribe(){ this.stopped = true; this.listen(false); this.wire(false); return super.unsubscribe(); }

	// Every card-level root, in list order: a Prompt or a plain Message (a note). A Reply is never a root; it draws inside the Prompt it answers.
	card_roots(){ return this.session.messages.messages.filter(m => !(m instanceof Reply)); }
	// The session's own task list (session.tasks), the Prompt/Question/Task tree V2/V3 draw beside the messages.
	task_roots(){ return [...(this.session._tasks ?? [])]; }

	// The Prompt a Reply answers (placement.js, DOM-free, node-testable): the one whose `sentences` holds `re.to`, else the newest Prompt before it.
	owning_prompt(reply){ return owning_prompt(this.session.messages.messages, reply); }
	// A list's own "delta" (an add) bubbles with `from` = the LIST itself (List.announce, List.js:270), never the member added
	// (List extends Item, so `get_one` is no help here): resolve to that member so `card_for` sees the thing that actually changed.
	added_member(line, from){
		if (!(from instanceof List)) return from;
		const added = line?.add;
		if (added == null) return null;
		const one = Array.isArray(added) ? added.at(-1) : added;
		const id = one && typeof one === "object" ? one.id : one;
		return id != null ? this.session.find(id) : null;
	}
	// The card a changed node belongs to, for a live redraw: a Reply's Prompt, a Sentence's Prompt, a root as itself, or (a Task/Question
	// nested under a Prompt's task) the message Prompt whose `prompt` link names that task's top-level ancestor.
	card_for(node){
		if (!node) return null;
		if (node instanceof Reply) return this.owning_prompt(node);
		const roots = this.card_roots();
		if (roots.includes(node)) return node;
		if (node instanceof Sentence) return roots.find(p => p instanceof Prompt && p.sentences.includes(node.id)) ?? null;
		const tasks = this.task_roots();
		let n = node;
		while (n && !tasks.includes(n)) n = n.parent;
		if (!n) return null;
		const from = n.get_one?.("from") ?? n.id;
		return roots.find(p => p instanceof Prompt && p.prompt === from) ?? null;
	}
	// The Prompt TASK (session.tasks) a message Prompt's words were also filed into, the link to its nested Tasks/Questions.
	task_for(p){ return p.prompt ? this.session.find(p.prompt) : null; }
	nested_tasks(task){ return task ? this.task_roots().filter(r => r.get_one?.("from") === task.id) : []; }

	// The Replies that answer one Prompt, in the chat list's own order.
	replies_of(p){ return this.session.messages.messages.filter(m => m instanceof Reply && this.owning_prompt(m) === p); }

	/* THE REPLY BEING WRITTEN: the session's live wire (ext/Session stream(), the one V1 reads) sends {kind:"stream", role, text}, the whole
	 * reply so far, and text "" when it ends. Drawn at the end of the newest Prompt card until the settled Reply message arrives. */
	session_id(){ return decodeURIComponent(String(this.url ?? "").split("?")[0].split("/").filter(Boolean).at(-2) ?? ""); }
	wire(on){
		this.stop_wire?.(); this.stop_wire = null;
		const id = on && this.session_id();
		if (id && /^v-|^[\w-]{6,}$/.test(id)) this.stop_wire = Wire.stream(id, ev => { if (ev?.kind === "stream") this.stream(ev.role, ev.text ?? ""); });
	}
	stream(role, text){
		if (!text) { this.partial = null; this.$partial?.el.remove(); return; }
		this.partial = { role, text };
		const p = this.card_roots().filter(r => r instanceof Prompt).at(-1), card = p && this.els.get(p.id);
		if (!card) return;
		if (!this.$partial?.el.isConnected) { this.$partial = div.c("chat-v3-reply chat-v3-partial"); card.el.append(this.$partial.el); }
		this.$partial.el.replaceChildren();
		const b = document.createElement("span"); b.className = "chat-v3-brain"; b.textContent = "🧠";
		const t = document.createElement("div"); t.className = "chat-v3-reply-text md"; md_into(t, text);
		this.$partial.el.append(b, t);
	}

	draw(){
		this.drawn = true; this.els.clear();
		this.$box?.empty(() => {
			const list = this.card_roots();
			if (!list.length) { div.c("chat-v3-empty", "Nothing said in this session yet."); return; }
			this.$earlier = button.c("chat-v3-earlier", "").attr("type", "button").click(() => { this.limit += this.constructor.SHOW; this.draw(); });
			list.slice(-this.limit).forEach(r => this.card(r));
			this.$earlier.el.textContent = `show earlier (${Math.max(0, list.length - this.limit)})`;
			this.$earlier.el.hidden = list.length <= this.limit;
		});
		this.draft_at_end();
		const want = location.hash.slice(1), el = want ? this.$box?.el.querySelector(`[id="${CSS.escape(want)}"]`) : null;
		el?.scrollIntoView({ block: "center" });
	}

	update(){
		for (const node of this.dirty){
			const view = this.els.get(node.id);
			if (view) { view.empty(() => this.fill(node)); }
			else if (this.card_roots().includes(node)){
				this.$box?.el.querySelector(":scope > .chat-v3-empty")?.remove();
				this.$box?.append(() => this.card(node));
				this.draft_at_end();
			}
		}
	}

	card(node){
		const view = div.c("chat-v3-card " + (node instanceof Prompt ? "chat-v3-prompt" : "chat-v3-loose"), () => this.fill(node)).attr("id", node.id).attr("data-id", node.id);
		this.els.set(node.id, view);
		return view;
	}

	fill(node){ return node instanceof Prompt ? this.prompt(node) : this.note(node); }

	// A plain Message (a note, e.g. Servex saying an assistant could not be reached): its own small card, no replies, no nesting.
	note(m){
		div.c("chat-v3-head", () => h3.c("chat-v3-title is-untitled", ChatV3.first_words(m.text)));
		md_into(div.c("chat-v3-text md").el, m.text);
	}

	prompt(p){
		const title = p.title, refined = p.text, open = this.raw_open.has(p.id), sentences = p.sentence_items;
		div.c("chat-v3-head", () => {
			if (title) h3.c("chat-v3-title", title);
			else h3.c("chat-v3-title is-untitled", ChatV3.first_words(p.cleaned || p.said));   // no AI title yet: its first words, muted
			this.marks(p);
		});
		/* Gray is only for words Whisper has not finished (the draft at the end, the owner 2026-10-26: "light gray to black reserved
		 * only for the whisper finalization"). A sentence in the file is final, so it is solid.
		 * The card shows the AI's cleaned text when there is one; until then the dictation itself, in paragraphs and a few lines high
		 * with "show all", never one wall (the owner, 2026-11-01: a 6,760-character Prompt came up as "a huge wall of text"). */
		if (refined) md_into(div.c("chat-v3-text md").el, refined);
		else this.dictation(p);
		const has_clean = Object.keys(p.clean).length > 0;
		if (has_clean) button.c("chat-v3-toggle", open ? "hide raw" : "show raw").attr("type", "button")
			.click(() => { open ? this.raw_open.delete(p.id) : this.raw_open.add(p.id); this.els.get(p.id)?.empty(() => this.prompt(p)); });
		if (open) div.c("chat-v3-raw", () => sentences.forEach(s => blockquote.c("chat-v3-raw-line", s.text)));
		for (const r of this.replies_of(p)) this.reply(r);
		if (this.partial && p === this.card_roots().filter(r => r instanceof Prompt).at(-1)) queueMicrotask(() => this.stream(this.partial?.role, this.partial?.text ?? ""));
		const task = this.task_for(p), kids = task ? [...(task._tasks ?? []), ...this.nested_tasks(task)] : [];
		if (kids.length) div.c("chat-v3-nest", () => kids.forEach(k => k instanceof Question ? this.question(k) : TaskView.row(k)));
	}

	// One assistant Reply: the brain mark and its markdown text. Small and overridable (V2 adds its ✓/🧠 marks, step 2).
	reply(r){ div.c("chat-v3-reply", () => { span.c("chat-v3-brain", "🧠"); md_into(div.c("chat-v3-reply-text md").el, r.text); }); }

	// The ✓/🧠 marks slot beside a Prompt's title: nothing yet (they live on the Prompt TASK until views-on-messages.md step 3); V2 overrides this.
	marks(p){ return null; }

	/** The words as dictated, when no AI text exists yet: one paragraph per run of sentences with no long pause between them, clamped to
	 *  a few lines with "show all (N words)". Replaces the old "one paragraph per sent chunk, cut every 3 sentences" (views-on-messages.md). */
	dictation(p){
		const paras = this.constructor.paragraphs(p.sentence_items, p.clean);
		const words = paras.join(" ").split(/\s+/).filter(Boolean).length, long = words > 80, all = this.all_open?.has(p.id);
		const box = div.c("chat-v3-text chat-v3-dictation" + (long && !all ? " is-clamped" : ""), () => paras.forEach(s => div.c("chat-v3-para", s)));
		if (long) button.c("chat-v3-toggle", all ? "show less" : `show all (${words} words)`).attr("type", "button").click(() => {
			(this.all_open ??= new Set())[all ? "delete" : "add"](p.id); this.els.get(p.id)?.empty(() => this.prompt(p));
		});
		return box;
	}
	// Delegates to placement.js (DOM-free, node-testable): a new paragraph where the gap to the previous sentence's `at` is a long pause.
	static paragraphs(sentence_items, clean = {}){ return paragraphs(sentence_items, clean); }
	static first_words(text, n = 8){ const w = String(text ?? "").split(/\s+/).filter(Boolean); return w.slice(0, n).join(" ") + (w.length > n ? "…" : ""); }

	// A Question is a few words; its answer is one or two short sentences.
	question(q){
		const phase = q.phase, wrap = div.c("chat-v3-ask").attr("data-phase", phase).attr("id", q.id).attr("data-id", q.id);
		wrap.append(() => {
			icon(this.constructor.ASK_ICON[phase] ?? "help_outline").ac("chat-v3-state", "is-" + phase);
			div.c("chat-v3-ask-body", () => {
				div.c("chat-v3-ask-head", () => h4.c("chat-v3-ask-text", q.text ?? q.id));
				if (q.answer) md_into(div.c("chat-v3-answer md").el, q.answer.text ?? "");
			});
		});
	}

	// The words being spoken right now, before they are sent: faint, last in the chat (the composer's mic reports them as "chat-live").
	listen(on){
		this._live ??= e => this.draft(e.detail ?? {});
		window[on ? "addEventListener" : "removeEventListener"]("chat-live", this._live);
	}
	draft({ text = "", settled = text, guess = "" } = {}){
		if (!this.$box) return;
		if (!text) { this.$draft?.el.remove(); this.$draft = null; return; }
		if (!this.$draft?.el.isConnected) this.$draft = div.c("chat-v3-card chat-v3-draft");
		this.$draft.el.replaceChildren();
		const t = document.createElement("div"); t.className = "chat-v3-text is-moving";
		t.textContent = settled; if (guess) { const g = document.createElement("span"); g.className = "chat-v3-guess"; g.textContent = (settled ? " " : "") + guess; t.append(g); }
		this.$draft.el.append(t);
		this.draft_at_end();
	}
	draft_at_end(){ if (this.$draft?.el.isConnected || this.$draft) this.$box?.el.append(this.$draft.el); }
}
