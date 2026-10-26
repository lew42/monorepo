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
	read_ids = new Set();   // answered Questions the owner tapped (green ?)
	raw_open = new Set();  // prompt ids whose raw text is showing; kept here so a live redraw does not close it
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
	// JSONL.live() starts its stream only after the record's url resolves, so an unsubscribe() before then would miss it: stopped remembers.
	live(){ super.live(() => {}).then(() => { if (this.stopped) super.unsubscribe(); }); return this; }
	unsubscribe(){ this.stopped = true; return super.unsubscribe(); }

	draw(){
		this.model = this.constructor.Model.fold(this.lines);
		this.els.clear(); this.parts.clear();
		const roots = this.model.roots();
		// review round 3 finding 1: smart_dots is created OUTSIDE the empty-chat branch, so a session that
		// starts with nothing said still has it ready for the first Prompt that arrives later.
		this.$box?.empty(() => {
			if (!roots.length){ div.c("chat-v2-empty", "Nothing said in this session yet."); this.smart_dots = div.c("chat-v2-smart-dots", "🧠").attr("hidden", ""); return; }
			for (const n of roots) this.constructor.Model.kind(n) === "Prompt" ? this.prompt(n) : this.child(n);
			this.smart_dots = div.c("chat-v2-smart-dots", "🧠").attr("hidden", "");
		});
		this.watch_smart();
		this.place_cursors();
	}

	// ONE animated 🧠 at the bottom, round 4 fix: shown whenever SOME Prompt's `working` is fresh (under
	// ~10 min old), full stop — never hidden just because a Prompt exists to carry a cursor (round 3's
	// mistake). The bottom dots and the smart cursor (place_cursors, below) answer different questions:
	// this one says "smart is doing something, somewhere, right now"; the cursor says "here is the one
	// newest chunk and whether smart has answered IT". Both can show at once. Checked on every patch and
	// a slow timer, since `working.at` ages even with no new line (review finding, round 2).
	watch_smart(){
		clearInterval(this._smart_timer);
		this._smart_timer = setInterval(() => this.update_smart_dots(), 15000);
		this.update_smart_dots();
	}
	update_smart_dots(){
		if (!this.smart_dots) return;
		const STALE_MS = 10 * 60 * 1000;
		const working = [...this.model.by_id.values()].some(n => n.working && Date.now() - (Date.parse(n.working.at ?? 0) || 0) < STALE_MS);
		this.smart_dots.el.hidden = !working;
	}

	// One streamed line, already folded into the model (see read()): patch only what it touched.
	// An add appends one new element where it belongs; a field change re-renders only that item's own
	// element. Everything else — siblings, the parent's other children, every other prompt — is never
	// touched, so it keeps its DOM object (and the page keeps its scroll position).
	apply_one(line){
		const touch = this.model.apply(line);
		if (!touch) return;
		this.update_smart_dots();
		if (!touch.added) { this.patch(touch.id); this.place_cursors(); return; }
		const M = this.constructor.Model, node = this.model.by_id.get(touch.id);
		if (!node) return;
		if (touch.parent === null) {
			this.$box?.el.querySelector(":scope > .chat-v2-empty")?.remove();
			if (M.kind(node) === "Prompt") {
				this.$box?.append(() => this.prompt(node));
				if (this.smart_dots) this.$box.el.append(this.smart_dots.el);   // keep the one bottom indicator last
				this.place_cursors();
				return;
			}
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

	// TWO moving marks for the whole chat, round 3-4 (supersedes round 2's single ✓ cursor + a 🧠 stamp per
	// Prompt): both sit after the NEWEST Prompt only, and both drop off the old Prompt the moment a newer
	// one exists — there is never more than one of each on screen.
	//   ✓ (fast): light gray once the Prompt exists, green once it has reached the fast seat (`sent.fast`).
	//   🧠 (smart): light gray while smart HAS the chunk but has not answered yet (`sent.smart` set, no
	//   answer seen) — this covers both "still working" and "sent but not started"; it colours in (the
	//   smart-reply colour) ONLY once an actual answer exists: `M.refined(n)` (title/text written) or a
	//   reply/question/task added after `sent.smart`'s own timestamp. Round 3 had this backwards (coloured
	//   while `!working`, which is also true before smart ever starts) — fixed here (review round 4).
	// Caveat, both marks: `sent.fast`/`sent.smart` are PROMPT-level (Sessions.mark_sent fires once per
	// Prompt reaching a seat), not per sentence/chunk — the owner's per-chunk ask needs a new Servex line;
	// exact shape in proposal.md. Fixed-width slots (ChatV2.css), never shown/hidden by display, so moving
	// either mark never reflows the text around it.
	cursor_el(){ return this._cursor ??= span.c("chat-v2-cursor").el; }
	smart_cursor_el(){ return this._smart_cursor ??= span.c("chat-v2-smart-cursor", "🧠").el; }
	last_prompt(){ const M = this.constructor.Model; const roots = this.model?.roots().filter(n => M.kind(n) === "Prompt") ?? []; return roots.at(-1) ?? null; }
	// Has smart actually answered THIS Prompt: its own title/text, or any reply/question/task added since.
	smart_answered(n){
		const M = this.constructor.Model;
		if (M.refined(n)) return true;
		const sent_at = Date.parse(n.sent?.smart?.at ?? 0) || 0;
		return M.replies(n).some(r => Date.parse(r.ts ?? 0) >= sent_at) || this.model.children(n).some(k => Date.parse(k.ts ?? 0) >= sent_at);
	}
	place_cursors(){
		const fast = this.cursor_el(), smart = this.smart_cursor_el();
		fast.remove(); smart.remove();
		const n = this.last_prompt(), owner = n && this.parts.get(n.id);
		if (!owner) return;
		fast.classList.toggle("done", !!n.sent?.fast);
		owner.head.el.append(fast);
		if (n.sent?.smart){
			smart.classList.toggle("done", this.smart_answered(n));   // gray = has it, not answered yet; coloured = an answer exists
			owner.head.el.append(smart);
		}
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
	// Round 3, ask B(iii): which paragraph a sentence landed in is now VISIBLE — a real gap (margin, CSS)
	// opens before the first sentence of a paragraph after the first, and every sentence's title names its
	// paragraph letter and index (e.g. "paragraph b, sentence 2") — a hover away, never reflowing the row.
	sentences(n, replies){
		const M = this.constructor.Model;
		let last_para = null;
		for (const s of M.sentences(n)) {
			const here = replies.filter(r => M.anchor(r)?.sentence === s.id);
			const new_para = s.para !== last_para && last_para !== null;
			last_para = s.para;
			div.c("chat-v2-sentence" + (new_para ? " chat-v2-new-paragraph" : ""), () => {
				div.c("chat-v2-sentence-text", () => this.words(s.text, here.map(r => M.words_range(M.anchor(r))).find(Boolean)))
					.attr("title", `paragraph ${s.para}, sentence ${s.n}`);
				if (here.length) div.c("chat-v2-beside", () => here.forEach(r => this.reply(r, n, false)));
			}).attr("data-sentence", s.id).attr("data-paragraph", s.para);
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
		if (this.constructor.Model.kind(n) === "Question") view.click(() => {
			if (this.constructor.Model.phase(n) === "open") return;
			this.read_ids.has(n.id) ? this.read_ids.delete(n.id) : this.read_ids.add(n.id);
			this.patch(n.id);
		});
		return view;
	}

	child_body(n){
		const M = this.constructor.Model, phase = M.phase(n), question = M.kind(n) === "Question", answer = question && M.answer(n);
		// A Question's avatar IS its state icon (amber ? while open, green once answered); a Task's avatar is its checkbox.
		if (question) {
			// red = asked, yellow = answered, green = answered and tapped (read; kept in this tab only, tap again to undo)
			const read = phase !== "open" && (phase === "complete" || this.read_ids.has(n.id));
			icon("help_outline").ac("chat-v2-state", "is-" + (read ? "complete" : phase));		}
		else icon(TaskView.STAGE[phase] ?? "help").ac("chat-v2-state", "is-" + phase);   // a Task's avatar IS its state checkbox
		div.c("chat-v2-body", () => {
			div.c("chat-v2-child-head", () => {
				span.c("chat-v2-child-text", M.label(n));
			});
			if (answer) div.c("chat-v2-answer", answer.text);
		});
	}
}
