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
View.stylesheet(import.meta, "ChatV3.css");

export default class ChatV3 extends JSONL {
	static SHOW = 40;          // roots drawn at first; "show earlier" adds this many more
	static MOVING_MS = 8000;   // a Prompt touched this recently is still moving (Servex closes a thought after about 8 s of quiet)
	static META = new Set(["by", "ts", "at", "origin", "as", "moved_from"]);
	static ASK_ICON = { open: "help_outline", answered: "mark_chat_unread", complete: "check_box" };

	session = new Session();
	els = new Map();           // root id -> the View that draws it
	touched = new Map();       // prompt id -> Date.now() of its latest live line
	timers = new Map();        // prompt id -> the timeout that settles it
	raw_open = new Set();      // prompt ids whose raw words are open
	limit = this.constructor.SHOW;

	// { url: the session.jsonl url, $box: the View to draw into }
	read(entries){
		const first = !this.drawn, hit = new Set();
		for (const raw of entries){
			const line = LineKey.deep(raw);   // `start()` and `#c3` read as start and c3 (D13)
			if (!this.wanted(line)) continue;
			this.session.replay_line(line);
			if (!first) { const id = this.card_of(line); if (id) hit.add(id); }
		}
		if (first) this.draw(); else this.update(hit);
		return this;
	}
	reset(){ this.session = new Session(); this.els.clear(); this.touched.clear(); this.drawn = false; return super.reset(); }
	live(){ super.live(() => {}).then(() => { if (this.stopped) super.unsubscribe(); }); this.listen(true); return this; }
	unsubscribe(){ this.stopped = true; this.listen(false); this.timers.forEach(clearTimeout); return super.unsubscribe(); }

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
			if (node instanceof Prompt) this.settle_later(node);   // before drawing: a Prompt that just moved draws gray
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

	// A Prompt is moving while it is the newest and was touched a moment ago by a live line.
	moving(p){ return Date.now() - (this.touched.get(p.id) ?? 0) < this.constructor.MOVING_MS; }
	settle_later(p){
		this.touched.set(p.id, Date.now());
		clearTimeout(this.timers.get(p.id));
		this.timers.set(p.id, setTimeout(() => { this.touched.delete(p.id); this.els.get(p.id)?.empty(() => this.fill(p)); }, this.constructor.MOVING_MS + 100));
	}

	fill(node){
		if (node instanceof Prompt) return this.prompt(node);
		if (node instanceof Question) return this.question(node);
		TaskView.row(node);
	}

	prompt(p){
		const moving = this.moving(p), title = p.get_one("title"), open = this.raw_open.has(p.id);
		div.c("chat-v3-head", () => {
			if (title && !moving) h3.c("chat-v3-title", title);
			this.link(p);
		});
		// moving: the words as they were heard, light gray; settled: the cleaned text (the smart seat's, else the fast seat's), solid
		const body = div.c("chat-v3-text md" + (moving ? " is-moving" : ""));
		md_into(body.el, moving ? p.raw_text : p.text || p.raw_text);
		if (p.raw.length && !moving) button.c("chat-v3-toggle", open ? "hide raw" : "show raw").attr("type", "button")
			.click(() => { open ? this.raw_open.delete(p.id) : this.raw_open.add(p.id); this.els.get(p.id)?.empty(() => this.prompt(p)); });
		if (open) div.c("chat-v3-raw", () => p.raw.forEach(line => blockquote.c("chat-v3-raw-line", line)));
		for (const r of p.replies) div.c("chat-v3-reply", () => { span.c("chat-v3-brain", "🧠"); md_into(div.c("chat-v3-reply-text md").el, r.get_one("text") ?? ""); });
		const kids = [...(p._tasks ?? []), ...this.nested(p)];
		if (kids.length) div.c("chat-v3-nest", () => kids.forEach(k => k instanceof Question ? this.question(k) : TaskView.row(k)));
	}

	// A Question is a few words; its answer is one or two short sentences.
	question(q){
		const phase = q.phase, wrap = div.c("chat-v3-ask").attr("data-phase", phase).attr("id", q.id).attr("data-id", q.id);
		wrap.append(() => {
			icon(this.constructor.ASK_ICON[phase] ?? "help_outline").ac("chat-v3-state", "is-" + phase);
			div.c("chat-v3-ask-body", () => {
				div.c("chat-v3-ask-head", () => { h4.c("chat-v3-ask-text", q.text ?? q.id); this.link(q); });
				if (q.answer) md_into(div.c("chat-v3-answer md").el, q.answer.text ?? "");
			});
		});
	}

	// A task has no page of its own yet: its link is a permalink to its card in this chat.
	link(node){
		const href = location.pathname + location.search + "#" + node.id;
		a.c("chat-v3-link", icon("link")).href(href).attr("title", "Link to this card").click(e => {
			e.preventDefault(); history.replaceState(history.state, "", href);
			document.getElementById(node.id)?.scrollIntoView({ block: "center" });
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
