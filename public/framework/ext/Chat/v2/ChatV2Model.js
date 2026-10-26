// ChatV2Model.js — a session.jsonl folded into plain objects, in list order. Every field read the chat does is a method here, so a renamed field or the real Prompt/Question classes (core/Task/Prompt.js) change this one file. See readme.md.
import split from "../../../core/Task/sentences.js";
const VERB_STATE = { start: "running", pause: "paused", resume: "running", stop: "stopped", complete: "complete", finish: "complete", wait: "waiting" };

export default class ChatV2Model {
	root = [];            // entries in the order Node appended them: never sorted
	by_id = new Map();

	static fold(lines){ const m = new this(); for (const line of lines) m.apply(line); return m; }

	// One line: {tasks:{add:entry}} at the root, or {"<id>":{…}} for something already in the list (any depth).
	// Returns what it touched (null for a line this model has nothing to do with): {id, parent, added}
	// — `added` true for a brand-new node (`parent` is its owner's id, or null at the root); false for a
	// field changed on a node that already exists (`parent` is undefined: there is nothing new to place).
	apply(line){
		if (!line || typeof line !== "object") return null;
		// An owner chat line names its prompt: remembered so a later {sent} line (which names the chat line's `at`) finds the prompt.
		if (line.chat){ const c = line.chat; if (c.from?.kind === "owner" && c.prompt) (this.prompt_of ??= new Map()).set(c.at, c.prompt); return null; }
		// {sent:{to:"fast"|"smart", at, re:[owner line at…], delay_ms}}: that prompt reached an assistant (Servex Sessions.mark_sent).
		if (line.sent){
			let touch = null;
			for (const r of line.sent.re ?? []){
				const n = this.by_id.get(this.prompt_of?.get(r));
				if (n){ (n.sent ??= {})[line.sent.to] = { at: line.sent.at, delay_ms: line.sent.delay_ms }; touch = { id: n.id, parent: undefined, added: false }; }
			}
			return touch;
		}
		if (line.tasks?.add){
			const node = this.add(this.root, line.tasks.add);
			return node ? { id: node.id, parent: null, added: true } : null;
		}
		for (const [key, delta] of Object.entries(line)) {
			const node = this.by_id.get(key);
			if (node && delta && typeof delta === "object") return this.edit(node, delta);
		}
		return null;
	}

	add(list, entry){
		if (!entry || typeof entry !== "object") return null;
		const { tasks = [], ...own } = entry, node = { ...own, kids: [] };
		if (node.id) this.by_id.set(node.id, node);
		list.push(node);
		// Every kid remembers its parent, even one the writer left off `from` — the one hint an answered
		// Question keeps once it surfaces at the root (ChatV2.js child(), data-from).
		for (const kid of [].concat(tasks)) { const k = this.add(node.kids, kid); if (k && node.id && k.from === undefined) k.from = node.id; }
		return node;
	}

	is_kid(node, id){ const kid = this.by_id.get(id); return !!kid && kid !== node && (node.kids.includes(kid) || (node.id && kid.from === node.id)); }

	edit(node, delta){
		let touch = { id: node.id, parent: undefined, added: false };
		for (const [k, v] of Object.entries(delta)) {
			if (k === "tasks") { if (v?.add){ const kid = this.add(node.kids, v.add); if (kid) touch = { id: kid.id, parent: node.id, added: true }; } }
			// A child addressed through its parent ({"<prompt>":{"<task>":{"complete":{…}}}}): the change is the child's, not a field on the parent.
			// Its kids are its own `tasks` plus root Tasks/Questions whose `from` is its id (`children()`).
			else if (this.is_kid(node, k) && v && typeof v === "object") touch = this.edit(this.by_id.get(k), v);
			else if (k === "raw" && v !== undefined) {
				const more = [].concat(v && typeof v === "object" && !Array.isArray(v) ? v.push ?? [] : v).filter(s => typeof s === "string" && s.length);
				if (more.length) (node.raw ??= []).push(...more);
			}
			else if (k === "paragraphs" && v && !Array.isArray(v)) {
				const list = node.paragraphs ??= [];
				// An id already present is a no-op, the same rule as core's List.insert (one paragraph per id).
				if (v.add && !list.some(x => x.id === v.add.id)) list.push({ ...v.add });
				if (v.append) { const p = list.find(x => x.id === v.append.id); if (p) p.text = (p.text ?? "") + v.append.text; else list.push({ ...v.append }); }
				if (v.replace) { const p = list.find(x => x.id === v.replace.id); if (p) Object.assign(p, v.replace); else list.push({ ...v.replace }); }
			}
			else if (k === "replies" && v && !Array.isArray(v)) {
				if (v.add) { const r = { ...v.add }; (node.replies ??= []).push(r); if (r.id) this.by_id.set(r.id, r); touch = { id: r.id, parent: node.id, added: true, reply: true }; }
			}
			else if (VERB_STATE[k] && typeof v === "object") node.state = VERB_STATE[k];
			else if (k === "set" && typeof v === "object") Object.assign(node, v);
			else node[k] = v;
		}
		return touch;
	}

	// --- the field reads: one small method per field ---------------------------------------------------------------------------
	static title(n){ return n.title ?? n.subject ?? null; }           // same order as core/Task/Prompt.js's `label`
	static text(n){ return n.text ?? null; }
	// What a child card shows as its one line: its title, else its text, else its id.
	static label(n){ return n.title ?? n.text ?? n.id; }
	static refined(n){ return !!(this.title(n) || this.text(n)); }    // the smart assistant's version exists
	static raw(n){ return n.raw ?? []; }
	static paragraphs(n){ return n.paragraphs ?? []; }
	static replies(n){ return n.replies ?? []; }
	static anchor(reply){ return reply.anchor ?? null; }
	// `words:[start,end)` or `{from,to}` — core's own Reply/anchor shape (end exclusive either way).
	static words_range(anchor){ return anchor ? (anchor.words ?? (anchor.from !== undefined ? [anchor.from, anchor.to] : null)) : null; }
	static answer(n){ return n.answer ?? null; }
	static kind(n){ return n.type ?? "Task"; }
	static answered_question(n){ return this.kind(n) === "Question" && !!this.answer(n); }
	// The answer's own time — written as `at` (Question.js's documented shape) or `ts` (the fixture's older lines): either reads.
	static answered_at(n){ const a = this.answer(n); return a ? Date.parse(a.at ?? a.ts ?? "") || 0 : 0; }

	// One static switch (round 2 of the review, 2026-10-25): off is the old behaviour — never sorted, never
	// moved, a Question always stays in its prompt's nest. Read by ordered()/children()/roots() here, and by
	// ChatV2.apply_one/move_to_end (V2) and chat.js draw_task (V1).
	static RESURFACE = true;

	// The id a line just answered, direct ({"<id>":{answer:…}}) or through its parent ({"<prompt>":{"<id>":{answer:…}}});
	// null for every other line. Used to move that one card, the same signal V1 (Widget.show_task) and V2 (ChatV2.apply_one) read.
	static answer_edit(line){
		if (!line || typeof line !== "object") return null;
		for (const [k, v] of Object.entries(line)) {
			if (!v || typeof v !== "object") continue;
			if ("answer" in v) return k;
			for (const [k2, v2] of Object.entries(v)) if (v2 && typeof v2 === "object" && "answer" in v2) return k2;
		}
		return null;
	}

	// answer_edit(line), but only when it is genuinely NEW: a Question that had no answer before this line
	// (never a Task, never a second edit replacing one it already had). Call BEFORE model.apply(line) mutates
	// the node — the whole reason for the guard is reading its state as it was just before this line.
	static newly_answered(model, line){
		if (!this.RESURFACE) return null;
		const id = this.answer_edit(line), n = id && model.by_id.get(id);
		return n && this.kind(n) === "Question" && !this.answer(n) ? id : null;
	}

	// Answered questions sort after everything else in the list, by WHEN they were answered (answered_at) —
	// not where they were asked; everything else (prompts, tasks, an open question) keeps its own arrival
	// order, exactly as the list already holds it. A slow answer must never stay buried above cards that
	// arrived after it (the owner, 2026-10-25), and two answers land in the order they actually happened.
	static ordered(list){
		if (!this.RESURFACE) return list;
		const head = [], tail = [];
		for (const n of list) (this.answered_question(n) ? tail : head).push(n);
		tail.sort((a, b) => this.answered_at(a) - this.answered_at(b));
		return [...head, ...tail];
	}

	// A Question: open (no answer) → answered (answer, not complete) → complete, the same rule as core's Question.phase.
	// A Task: its own state.
	static phase(n){
		if (this.kind(n) === "Question") return n.state === "complete" ? "complete" : this.answer(n) ? "answered" : "open";
		return n.state ?? "idle";
	}

	// Sentences are computed, never stored: id = paragraph id + 1-based index (a1, a2, b1), so earlier ids survive appended text.
	static sentences(prompt){
		const out = [];
		for (const para of this.paragraphs(prompt)) {
			split(para.text).forEach((text, i) => out.push({ id: para.id + (i + 1), n: i + 1, para: para.id, text }));
		}
		return out;
	}

	// A prompt's own tasks plus any root-level Question/Task whose `from` is its id, in list order — the raw
	// union children()/sentences() both start from, answered or not (sentences() needs the unanswered-only
	// filter NOT applied here, so a sentence that became a Question stays hidden even once the Question
	// itself has surfaced at the root).
	own_and_from(prompt){ return [...prompt.kids, ...this.root.filter(n => n !== prompt && n.from === prompt.id && this.constructor.kind(n) !== "Prompt")]; }

	// A prompt's children for drawing: own_and_from(), minus an answered Question — RESURFACE moves that one
	// to the root (roots(), below), by answer time, not asked time.
	children(prompt){
		const list = this.own_and_from(prompt);
		return this.constructor.RESURFACE ? list.filter(n => !this.constructor.answered_question(n)) : list;
	}

	// What the chat draws at the root: prompts, anything whose `from` names no prompt here, PLUS — once
	// RESURFACE is on — every answered Question that would otherwise be nested inside a prompt, surfaced to
	// the newest end of this same list, in the order it was actually answered (ordered(), above).
	roots(){
		const prompts = new Set(this.root.filter(n => this.constructor.kind(n) === "Prompt").map(n => n.id));
		const base = this.root.filter(n => this.constructor.kind(n) === "Prompt" || !prompts.has(n.from));
		if (!this.constructor.RESURFACE) return base;
		const surfaced = [...this.by_id.values()].filter(n => this.constructor.answered_question(n) && prompts.has(n.from) && !base.includes(n));
		return this.constructor.ordered([...base, ...surfaced]);
	}
}
