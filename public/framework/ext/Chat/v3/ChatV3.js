// ChatV3.js — a session's chat as a plain VIEW over its `tasks` list (rough draft). The session.jsonl is streamed and every task line
// is replayed into a real Session (core/Session), the same replay the item tool uses; Prompts are drawn as they are (raw chunks,
// paragraphs, replies) and are never reshaped. Doc: readme.md
import View, { div, span, a, button, h3, h4, small, blockquote, icon } from "/framework/core/View/View.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";
import Session from "/framework/core/Session/Session.js";
import Prompt from "/framework/core/Task/Prompt.js";
import Question from "/framework/core/Task/Question.js";
import TaskView from "/framework/core/Task/TaskView.js";
import LineKey from "/framework/core/Item/LineKey.js";
import { md_into } from "../md.js";
import * as Wire from "/framework/ext/Session/Session.js";
View.stylesheet(import.meta, "ChatV3.css");

export default class ChatV3 extends JSONL {
	static SHOW = 40;          // roots drawn at first; "show earlier" adds this many more
	static META = new Set(["by", "ts", "at", "origin", "as", "moved_from"]);
	static ASK_ICON = { open: "help_outline", answered: "mark_chat_unread", complete: "check_box" };

	session = new Session();
	els = new Map();           // root id -> the View that draws it
	said = new Map();          // an owner {chat} line's `at` -> its Prompt id (every owner line carries `prompt`)
	chat = new Map();          // prompt id -> the assistant replies written as old-style {chat} lines, in order ({at, text})
	partial = null;            // the reply being written right now, from the session's live wire: {role, text}
	raw_open = new Set();      // prompt ids whose raw words are open
	limit = this.constructor.SHOW;

	// { url: the session.jsonl url, $box: the View to draw into }
	read(entries){
		const first = !this.drawn, hit = new Set();
		for (const raw of entries){
			const line = LineKey.deep(raw);   // `start()` and `#c3` read as start and c3 (D13)
			if (line.chat) { const id = this.chat_line(line.chat); if (id && !first) hit.add(id); continue; }
			if (!this.wanted(line)) continue;
			this.session.replay_line(line);
			if (!first) { const id = this.card_of(line); if (id) hit.add(id); }
		}
		if (first) this.draw(); else this.update(hit);
		return this;
	}
	reset(){ this.session = new Session(); this.els.clear(); this.said.clear(); this.chat.clear(); this.drawn = false; return super.reset(); }
	live(){ super.live(() => {}).then(() => { if (this.stopped) super.unsubscribe(); }); this.listen(true); this.wire(true); return this; }
	unsubscribe(){ this.stopped = true; this.listen(false); this.wire(false); return super.unsubscribe(); }

	/* EVERY REPLY, read-only (dictation-v3, 2026-11-01): most smart-seat replies are written as old-style {chat} lines, not into
	 * the Prompt. An owner line carries `prompt`; a reply carries `re` = the owner line's `at`. So a reply finds its Prompt by
	 * code; one whose `re` names no owner line goes to the newest Prompt. Returns the Prompt id it landed on. */
	chat_line(c){
		if (c.from?.kind === "owner") { if (c.prompt) this.said.set(c.at, c.prompt); return null; }
		if (c.from?.kind !== "assistant" || !String(c.text ?? "").trim()) return null;
		const id = this.said.get(c.re) ?? [...this.roots()].reverse().find(r => r instanceof Prompt)?.id;
		if (!id) return null;
		const list = this.chat.get(id) ?? [];
		if (!list.some(r => r.at === c.at)) list.push({ at: c.at, text: c.text, who: c.from?.id });
		this.chat.set(id, list);
		if (this.partial) { this.partial = null; this.$partial?.el.remove(); }   // the settled reply replaces the one being written
		return id;
	}
	// The replies of one Prompt: its own `replies` list, then the {chat} ones it does not already hold (same text).
	replies_of(p){
		const own = p.replies.map(r => ({ text: r.get_one("text") ?? "" }));
		const seen = new Set(own.map(r => r.text.trim()));
		return [...own, ...(this.chat.get(p.id) ?? []).filter(r => !seen.has(String(r.text).trim()))];
	}

	/* THE REPLY BEING WRITTEN: the session's live wire (ext/Session stream(), the one V1 reads) sends {kind:"stream", role, text}, the whole
	 * reply so far, and text "" when it ends. Drawn at the end of the newest Prompt card until the settled {chat} line arrives. */
	session_id(){ return decodeURIComponent(String(this.url ?? "").split("?")[0].split("/").filter(Boolean).at(-2) ?? ""); }
	wire(on){
		this.stop_wire?.(); this.stop_wire = null;
		const id = on && this.session_id();
		if (id && /^v-|^[w-]{6,}$/.test(id)) this.stop_wire = Wire.stream(id, ev => { if (ev?.kind === "stream") this.stream(ev.role, ev.text ?? ""); });
	}
	stream(role, text){
		if (!text) { this.partial = null; this.$partial?.el.remove(); return; }
		this.partial = { role, text };
		const p = [...this.roots()].reverse().find(r => r instanceof Prompt), card = p && this.els.get(p.id);
		if (!card) return;
		if (!this.$partial?.el.isConnected) { this.$partial = div.c("chat-v3-reply chat-v3-partial"); card.el.append(this.$partial.el); }
		this.$partial.el.replaceChildren();
		const b = document.createElement("span"); b.className = "chat-v3-brain"; b.textContent = "🧠";
		const t = document.createElement("div"); t.className = "chat-v3-reply-text md"; md_into(t, text);
		this.$partial.el.append(b, t);
	}

	// Only the lines that are task deltas: V3 reads the tasks list and nothing else (no {chat}, {place}, {sent}… lines).
	wanted(line){
		if (!line || typeof line !== "object") return false;
		if (line.tasks || line.session || line.start || line.stop || line.decide || typeof line.task === "string") return true;
		const key = Object.keys(line).find(k => !this.constructor.META.has(k));
		return !!key && !!this.session.find(key);
	}
	roots(){ return [...(this.session._tasks ?? [])]; }
	// The root a live line touched (a new root: the last one).
	root_of(line){
		if (line.tasks) return this.roots().at(-1);
		const key = Object.keys(line).find(k => !this.constructor.META.has(k)), node = key && this.session.find(key);
		return node ? this.roots().find(r => r === node || r.find?.(key)) : null;
	}
	// The card that redraws for a line: a root Question or Task that names its Prompt (`from`) lives inside that Prompt's card.
	card_of(line){
		const r = this.root_of(line);
		if (!r) return null;
		const from = r.get_one?.("from");
		return from && this.session.find(from) ? from : r.id;
	}
	nested(p){ return this.roots().filter(r => r.get_one?.("from") === p.id); }
	standalone(r){ const from = r.get_one?.("from"); return !(from && this.session.find(from) instanceof Prompt); }

	draw(){
		this.drawn = true; this.els.clear();
		this.$box?.empty(() => {
			const list = this.roots().filter(r => this.standalone(r));
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

	update(ids){
		for (const id of ids) {
			const node = this.session.find(id), view = this.els.get(id);
			if (view) { view.empty(() => this.fill(node)); }
			else if (node && this.standalone(node)) {
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

	fill(node){
		if (node instanceof Prompt) return this.prompt(node);
		if (node instanceof Question) return this.question(node);
		TaskView.row(node);
	}

	prompt(p){
		const title = p.get_one("title"), open = this.raw_open.has(p.id);
		div.c("chat-v3-head", () => {
			if (title) h3.c("chat-v3-title", title);
		});
		/* Gray is only for words Whisper has not finished (the draft at the end, the owner 2026-10-26: "light gray to black reserved
		 * only for the whisper finalization"). A sentence in the file is final, so it is solid: the cleaned text, else the words heard. */
		const body = div.c("chat-v3-text md");
		md_into(body.el, p.text || p.raw_text);
		if (p.raw.length) button.c("chat-v3-toggle", open ? "hide raw" : "show raw").attr("type", "button")
			.click(() => { open ? this.raw_open.delete(p.id) : this.raw_open.add(p.id); this.els.get(p.id)?.empty(() => this.prompt(p)); });
		if (open) div.c("chat-v3-raw", () => p.raw.forEach(line => blockquote.c("chat-v3-raw-line", line)));
		for (const r of this.replies_of(p)) div.c("chat-v3-reply", () => { span.c("chat-v3-brain", "🧠"); md_into(div.c("chat-v3-reply-text md").el, r.text); });
		if (this.partial && p === [...this.roots()].reverse().find(r => r instanceof Prompt)) queueMicrotask(() => this.stream(this.partial?.role, this.partial?.text ?? ""));
		const kids = [...(p._tasks ?? []), ...this.nested(p)];
		if (kids.length) div.c("chat-v3-nest", () => kids.forEach(k => k instanceof Question ? this.question(k) : TaskView.row(k)));
	}

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
