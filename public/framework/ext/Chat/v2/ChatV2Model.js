// ChatV2Model.js — a session.jsonl folded into plain objects, in list order. Every field read the chat does is a method here, so a renamed field or the real Prompt/Question classes (core/Task/Prompt.js) change this one file. See readme.md.
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
		for (const kid of [].concat(tasks)) this.add(node.kids, kid);
		return node;
	}

	edit(node, delta){
		let touch = { id: node.id, parent: undefined, added: false };
		for (const [k, v] of Object.entries(delta)) {
			if (k === "tasks") { if (v?.add){ const kid = this.add(node.kids, v.add); if (kid) touch = { id: kid.id, parent: node.id, added: true }; } }
			// A child addressed through its parent ({"<prompt>":{"<task>":{"complete":{…}}}}): the change is the child's, not a field on the parent.
			else if (node.kids.some(c => c.id === k) && v && typeof v === "object") touch = this.edit(this.by_id.get(k), v);
			else if (k === "raw" && v && !Array.isArray(v)) { if (v.push !== undefined) (node.raw ??= []).push(v.push); }
			else if (k === "paragraphs" && v && !Array.isArray(v)) {
				const list = node.paragraphs ??= [];
				if (v.add) list.push({ ...v.add });
				if (v.append) { const p = list.find(x => x.id === v.append.id); if (p) p.text = (p.text ?? "") + v.append.text; else list.push({ ...v.append }); }
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
			const parts = String(para.text ?? "").match(/[^.!?]+(?:[.!?]+["')\]]*|$)/g) ?? [];
			parts.map(s => s.trim()).filter(Boolean).forEach((text, i) => out.push({ id: para.id + (i + 1), n: i + 1, para: para.id, text }));
		}
		return out;
	}

	// A prompt's children: its own tasks plus any root-level Question/Task whose `from` is its id, in list order.
	children(prompt){ return [...prompt.kids, ...this.root.filter(n => n !== prompt && n.from === prompt.id && this.constructor.kind(n) !== "Prompt")]; }

	// What the chat draws at the root: prompts, and anything whose `from` names no prompt here.
	roots(){
		const prompts = new Set(this.root.filter(n => this.constructor.kind(n) === "Prompt").map(n => n.id));
		return this.root.filter(n => this.constructor.kind(n) === "Prompt" || !prompts.has(n.from));
	}
}
