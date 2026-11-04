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
import ReciteBubble from "/framework/audio/Recite/ReciteBubble.js";
import * as Wire from "/framework/ext/Session/Session.js";
import { owning_prompt, paragraphs, paragraph_groups, note_view, far_off_questions, find_answered_ids } from "./placement.js";
View.stylesheet(import.meta, "ChatV3.css");
View.stylesheet(import.meta, "../bubbles.css");

export default class ChatV3 extends JSONL {
	static SHOW = 40;          // roots drawn at first; "show earlier" adds this many more
	static ASK_ICON = { open: "help_outline", answered: "mark_chat_unread", complete: "check_box" };

	session = new Session();
	els = new Map();           // root id -> the View that draws it
	dirty = new Set();         // roots (Prompt or plain Message) to refill after this batch
	moved = new Set();         // roots a `move` delta re-ordered: their drawn node is moved in the DOM, never refilled
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
				const mid = from instanceof List ? line?.move?.id : null, node = mid != null ? this.session.find(mid) : null;
				if (node) { if (this.card_roots().includes(node)) this.moved.add(node); else { const card = this.card_for(node); if (card) this.dirty.add(card); } return; }
				const member = this.added_member(line, from);
				if (member instanceof Reply) { this.partial = null; this.$partial?.el.remove(); }   // its settled Reply landed: stop drawing the partial
				const card = this.card_for(member); if (card) this.dirty.add(card);
			});
		}
		for (const raw of entries){
			const line = LineKey.deep(raw);   // `start()` and `#c3` read as start and c3 (D13)
			if (line?.chat || line?.place) continue;   // V1-only; the real update is the separate messages/sentences mirror line
			this.session.replay_line(line);
			// Review fix (ask7, finding 1 + 4): a plain nested-field write (a Question's `answer` or `also_from`,
			// `Task.replay_line`'s `take()`) fires no live "delta" event — fixed here, in the view, not core Item:
			// find_answered_ids (placement.js) reads the line itself for any id that just changed one of those fields.
			// Its own card is marked dirty like any other change; `also_from` additionally names OTHER Prompts (the
			// ones that repeated it), each of whose own card must redraw too, to show the reference pointing back here.
			for (const id of find_answered_ids(line)){
				const q = this.session.find(id);
				if (!q) continue;
				const card = this.card_for(q); if (card) this.dirty.add(card);
				for (const tid of q.also_from ?? []){ const other = this.card_roots().find(p => p instanceof Prompt && p.prompt === tid); if (other) this.dirty.add(other); }
			}
		}
		if (first) this.draw(); else this.update();
		this.dirty.clear(); this.moved.clear();
		return this;
	}
	reset(){ this.session = new Session(); this.els.clear(); this.dirty.clear(); this.moved.clear(); this.listening = false; this.drawn = false; return super.reset(); }
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
	// The card a changed node belongs to, for a live redraw: a Reply's Prompt, a Sentence's Prompt, a root as itself, a card's own
	// `content` member (its `.parent` IS the root Message — List.js's `child.parent = this.owner`, ask3-cards-by-id), or (a
	// Task/Question nested under a Prompt's task) the message Prompt whose `prompt` link names that task's top-level ancestor.
	card_for(node){
		if (!node) return null;
		if (node instanceof Reply) return this.owning_prompt(node);
		const roots = this.card_roots();
		if (roots.includes(node)) return node;
		if (node instanceof Sentence) return roots.find(p => p instanceof Prompt && p.sentences.includes(node.id)) ?? null;
		if (roots.includes(node.parent)) return node.parent;
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
	// Replies drawn after the body, in the trailing list: all of them (V2 overrides to drop any it already drew beside a sentence).
	trailing_replies(p){ return this.replies_of(p); }

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
		const t = document.createElement("div"); t.className = "chat-v3-reply-text md"; md_into(t, text);
		this.$partial.el.append(t);
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
		this.refresh_refs();   // also keeps the live draft after it (draft_at_end)
		const want = location.hash.slice(1), el = want ? this.$box?.el.querySelector(`[id="${CSS.escape(want)}"]`) : null;
		el?.scrollIntoView({ block: "center" });
	}

	update(){
		for (const node of this.dirty){
			const view = this.els.get(node.id);
			if (view) { view.empty(() => this.fill(node)); }
			else if (this.card_roots().includes(node)){
				this.$box?.el.querySelector(":scope > .chat-v3-empty")?.remove();
				// Review fix (ask7, finding 2): a plain append would land AFTER `.chat-v3-refs` once that box exists, drifting
				// the references into the middle of the chat as new cards kept arriving. A fresh card always lands just
				// before the refs box (or at the end, when there is none yet) — refs stay "near the end", never the middle.
				const fresh = this.card(node);
				if (this.$refs?.el.isConnected) this.$refs.el.before(fresh.el); else this.$box?.el.append(fresh.el);
				this.draft_at_end();
			}
		}
		for (const node of this.moved) this.relocate(node);
		this.refresh_refs();
	}

	// A re-ordered root keeps its drawn node (same object, same text node): only its place in the box changes, to just after the
	// node of the root now before it in the list, or first when it leads. A root not drawn (older than the shown limit) is skipped.
	relocate(node){
		const el = this.els.get(node.id)?.el;
		if (!el) return;
		const roots = this.card_roots(), prev = roots[roots.indexOf(node) - 1], prev_el = prev && this.els.get(prev.id)?.el;
		if (prev_el?.parentNode === el.parentNode) prev_el.after(el);
		else if (this.$earlier?.el.parentNode === el.parentNode) this.$earlier.el.after(el);
		else el.parentNode?.prepend(el);
		this.draft_at_end();
	}

	card(node){
		const view = div.c("chat-v3-card " + (node instanceof Prompt ? "chat-v3-prompt" : "chat-v3-loose"), () => this.fill(node)).attr("id", node.id).attr("data-id", node.id);
		this.els.set(node.id, view);
		return view;
	}

	fill(node){ return node instanceof Prompt ? this.prompt(node) : this.note(node); }

	// A plain Message (a note, e.g. Servex saying an assistant could not be reached — or a card: icon/title/content set, fresh
	// or upgraded, ask3-cards-by-id): its own small card, no replies, no nesting. `note_view` (placement.js, DOM-free) is the
	// one place that decides what to show — never the stringified word "undefined" for a field a member does not have.
	note(m){
		const { title, icon: icon_name, text, content } = note_view(m);
		div.c("chat-v3-head", () => {
			if (icon_name) icon(icon_name).ac("chat-v3-icon");
			h3.c("chat-v3-title" + (title ? "" : " is-untitled"), title || ChatV3.first_words(text));
		});
		if (text) md_into(div.c("chat-v3-text md").el, text);
		if (content.length) div.c("chat-v3-content", () => content.forEach(line => div.c("chat-v3-content-line", line)));
	}

	prompt(p){
		const title = p.title, refined = p.text, open = this.raw_open.has(p.id), sentences = p.sentence_items;
		div.c(this.you_class(p), () => this.you(p, title, refined, open, sentences));
		for (const r of this.trailing_replies(p)) this.reply(r);
		if (this.partial && p === this.card_roots().filter(r => r instanceof Prompt).at(-1)) queueMicrotask(() => this.stream(this.partial?.role, this.partial?.text ?? ""));
		const task = this.task_for(p), kids = task ? [...(task._tasks ?? []), ...this.nested_tasks(task)] : [];
		// ask7 (review fix, finding 4): "a repeated question links to its existing card" — the item tool never writes a second
		// Question for a repeat; it adds the new Prompt's own task id to the EXISTING Question's `also_from` instead. So THIS
		// Prompt (the one that repeated it) draws the same small reference ChatV3 already uses for a far-off answer, right
		// here where the repeat happened, pointing back at the one true card.
		const also = task ? this.all_questions().filter(q => q.also_from.includes(task.id)) : [];
		if (kids.length || also.length) div.c("chat-v3-nest", () => {
			kids.forEach(k => k instanceof Question ? this.question(k) : TaskView.row(k));
			also.forEach(q => this.reference(q));
		});
	}
	// Every Question anywhere in the task tree (top-level task_roots plus their own nested kids) — `also_from` lookups
	// need the whole tree, not just one Prompt's own kids (a repeat can happen under any Prompt, pointing at any other).
	all_questions(){
		const out = [];
		const walk = list => { for (const t of list ?? []){ if (t instanceof Question) out.push(t); walk(t._tasks); } };
		walk(this.task_roots());
		return out;
	}

	// The owner's side of a card: ONE right-aligned bubble that hugs its words (bubbles.css), holding the title, the text (or the dictation)
	// and the raw toggle. Everything the assistant says is drawn after it, outside it (Claude-style layout, the owner 2026-11-02).
	you_class(p){ return "chat-v3-you"; }
	you(p, title, refined, open, sentences){
		div.c("chat-v3-head", () => {
			if (title) h3.c("chat-v3-title", title);
			else if (!this.redundant_title(p)) h3.c("chat-v3-title is-untitled", ChatV3.first_words(p.cleaned || p.raw));   // no AI title yet: its first words, muted
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
	}

	// One assistant Reply: plain markdown text on the left, no avatar. Small and overridable (V2 adds its ✓/🧠 marks, step 2).
	// A Reply with `title`/`icon` set on it (the same two fields any Message has) draws them above the text, the same head
	// `note()` draws.
	reply(r){
		const { title, icon: icon_name, text } = note_view(r);
		const box = div.c("chat-v3-reply" + (title || icon_name ? " is-card" : ""), () => {
			if (title || icon_name) div.c("chat-v3-head", () => { if (icon_name) icon(icon_name).ac("chat-v3-icon"); if (title) h3.c("chat-v3-title", title); });
			md_into(div.c("chat-v3-reply-text md").el, text);
		}).attr("data-id", r.id);
		ReciteBubble.mount(box.el, { text: () => r.text });   // play / pause / back 10 s for this reply (Chat V2 draws replies through here too)
	}

	// The ✓/🧠 marks slot beside a Prompt's title: nothing yet (they live on the Prompt TASK until views-on-messages.md step 3); V2 overrides this.
	marks(p){ return null; }

	/** The words as dictated, when no AI text exists yet: one paragraph per run of sentences with no long pause between them, clamped to
	 *  a few lines with "show all (N words)". Replaces the old "one paragraph per sent chunk, cut every 3 sentences" (views-on-messages.md). */
	dictation(p){
		const groups = this.constructor.paragraph_groups(p.sentence_items);
		const words = groups.flat().map(s => p.clean[s.id] ?? s.text).join(" ").split(/\s+/).filter(Boolean).length;
		return this.clamped_text(p, words, () => groups.forEach(g => this.paragraph(g, p)));
	}
	// One paragraph: its sentences' cleaned (or raw) text, joined into one string. Small and overridable: V2 draws one row per
	// sentence instead, with a Reply beside the one it answers (`re.to`), step 2 of views-on-messages.md.
	paragraph(group, p){ div.c("chat-v3-para", group.map(s => p.clean[s.id] ?? s.text).join(" ")); }
	// The clamp-to-a-few-lines wrapper with "show all (N words)", shared by `dictation()` (and V2's sentence rows, same words count).
	clamped_text(p, words, fill){
		const long = words > 80, all = this.all_open?.has(p.id);
		const box = div.c("chat-v3-text chat-v3-dictation" + (long && !all ? " is-clamped" : ""), fill);
		if (long) button.c("chat-v3-toggle", all ? "show less" : `show all (${words} words)`).attr("type", "button").click(() => {
			(this.all_open ??= new Set())[all ? "delete" : "add"](p.id); this.els.get(p.id)?.empty(() => this.prompt(p));
		});
		return box;
	}
	// Delegates to placement.js (DOM-free, node-testable): a new paragraph where the gap to the previous sentence's `at` is a long pause.
	static paragraphs(sentence_items, clean = {}){ return paragraphs(sentence_items, clean); }
	static paragraph_groups(sentence_items){ return paragraph_groups(sentence_items); }
	static first_words(text, n = 8){ const w = String(text ?? "").split(/\s+/).filter(Boolean); return w.slice(0, n).join(" ") + (w.length > n ? "…" : ""); }
	static norm_words(text){ return String(text ?? "").toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, "").replace(/\s+/g, " ").trim(); }

	/* A chit-chat Prompt ("Hello") has no AI title and no refined text, so the muted first-words title (above) reads
	 * as the exact same line as the body right under it (the owner, 2026-11-02: "Hello" over "Hello" again). Drop the
	 * title only there: a real topic card — an AI title, or refined text — always keeps its title (the owner's call:
	 * a chit-chat card is fine to exist, its title just should not repeat its own one or two sentences). */
	redundant_title(p){
		if (p.title || p.text) return false;
		const body = p.cleaned || p.raw;
		if (ChatV3.norm_words(ChatV3.first_words(body)) === ChatV3.norm_words(body)) return true;
		return p.sentence_items.length <= 2;
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

	// Every Question nested under a drawn Prompt, paired with the Prompt card it sits under — `far_off_questions` (placement.js)
	// needs both: which card the Question belongs to, and whether that card is still the newest one.
	questions_with_prompts(){
		const out = [];
		for (const p of this.card_roots()) if (p instanceof Prompt){
			const task = this.task_for(p), kids = task ? [...(task._tasks ?? []), ...this.nested_tasks(task)] : [];
			for (const k of kids) if (k instanceof Question) out.push({ question: k, prompt: p });
		}
		return out;
	}
	// A far-off answered Question's real card never moves (ux/Dictate/doc/principles.md, "Questions"): this is the small
	// reference near the end instead, a back-arrow overlay on its icon, linking to the real card's own `#id` permalink
	// (ChatV3.js's existing scroll-to-hash, draw()). Recomputed after every draw/update; cheap at chat sizes.
	refresh_refs(){
		// Review fix, finding 9: a Prompt older than the "show earlier" limit has no drawn card (draw()'s `slice(-this.limit)`),
		// so a reference to it would link to an `#id` nothing on screen owns. Only reference a Prompt actually in `this.els`.
		const far = far_off_questions(this.questions_with_prompts(), this.card_roots()).filter(({ prompt }) => this.els.has(prompt.id));
		if (!this.$refs?.el.isConnected) { this.$refs = div.c("chat-v3-refs"); this.$box?.el.append(this.$refs.el); }
		this.$refs.empty(() => far.forEach(({ question }) => this.reference(question)));
		this.$refs.el.hidden = !far.length;
		this.draft_at_end();   // the live draft stays after the refs, same rule draft_at_end already keeps
	}
	reference(q){
		a.c("chat-v3-ask-ref", () => {
			icon("mark_chat_unread").ac("chat-v3-state", "is-answered", "chat-v3-ref-icon");
			span.c("chat-v3-ref-text", ChatV3.first_words(q.text ?? "", 10));
		}).attr("href", "#" + q.id);
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
		const you = document.createElement("div"); you.className = "chat-v3-you";
		const t = document.createElement("div"); t.className = "chat-v3-text is-moving";
		t.textContent = settled; if (guess) { const g = document.createElement("span"); g.className = "chat-v3-guess"; g.textContent = (settled ? " " : "") + guess; t.append(g); }
		you.append(t); this.$draft.el.append(you);
		this.draft_at_end();
	}
	draft_at_end(){ if (this.$draft?.el.isConnected || this.$draft) this.$box?.el.append(this.$draft.el); }
}
