// A prompt the owner said or typed, as a Task (the owner, 2026-10-24/25; Option C in ai/.../dictation-debug/chat-shape.md): the raw words
// (never lost), the cleaned paragraphs with numbered sentences, the replies anchored to them, and the asks made from it as its own `tasks`.
// Completion and cost roll up on read: task -> prompt -> session. DOM-free, so node and the browser build the same Prompt from the same lines.
import Task from "./Task.js";
import Item from "../Item/Item.js";
import List from "../List/List.js";
import split from "./sentences.js";

/* One paragraph of the cleaned text: {id, text}. Its sentences are computed from `text` (Prompt.split), numbered `<id>1`, `<id>2`…;
   a migrated paragraph may carry them explicitly in `sentences`, so the old cites keep their meaning (Server/PromptsToSession.mjs). */
export class Paragraph extends Item {
	static plain_lists = ["sentences"];   // an array of text: data, not child Items
}
Item.register(Paragraph, "Paragraph");

export class Paragraphs extends List {
	// Adds `text` to the end of paragraph `id` (made if it is not there yet): the fast assistant's one-call edit while someone is still talking.
	append({ id, text } = {}){
		if (id === undefined || typeof text !== "string") return this;
		const p = this.find(id);
		if (!p) return void this.add({ id, text });
		p.set({ text: (p.get_one("text") ?? "") + text });
		return this;
	}
	// Makes paragraph `id`, or sets its fields when it is there (the migration and PromptRecords rewrite the cleaned text this way).
	replace({ id, ...fields } = {}){
		if (id === undefined) return this;
		const p = this.find(id);
		if (!p) return void this.add({ id, ...fields });
		p.set(fields);
		return this;
	}
}
Paragraphs.prototype.of = Paragraph;

export class Prompt extends Task {

	// Arrays kept as data: `raw` (text chunks, appended only), `parts` (the splitter's record, ext/Refine/doc/prompt-records.md), and the
	// migrated `refined` cards and `notes` (Server/PromptsToSession.mjs).
	static plain_lists = ["raw", "parts", "refined", "notes"];
	// Plain fields a log line may set (Task.replay_line reads Task.FIELDS and these).
	static line_fields = ["subject", "process", "handled", "refined", "notes", "text"];
	static queries = [...Task.queries, "sentences", "settled_parts"];

	static KINDS = ["ask", "question", "rule", "idea", "conversation"];
	static OUTCOMES = ["done", "documented", "answered", "task", "no-action", "open"];
	static SETTLED = ["done", "documented", "answered", "no-action"];
	/** A part is settled when its outcome is one of SETTLED, or a task carries it and that task is complete. `task_state(ref)` answers a task's state. */
	static settled(part, task_state = () => null){
		const o = part?.outcome ?? {};
		return Prompt.SETTLED.includes(o.is) || (o.is === "task" && task_state(o.ref) === "complete");
	}
	/** Sentences of a text (core/Task/sentences.js, shared with the chat's fold). */
	static split(text){ return split(text); }

	// ---- the words ----
	/** Everything that was said, in order: text chunks, never edited or dropped. */
	get raw(){ return [...(this.get_one("raw") ?? [])]; }
	get raw_text(){ return this.raw.join(" "); }
	/** Add to the raw words: `{raw: "more"}`, `{raw: {push: "more"}}` or `{raw: ["a", "b"]}` all append; nothing replaces what was heard. */
	push_raw(value){
		const more = [].concat(Array.isArray(value) ? value : value?.push ?? value).filter(s => typeof s === "string" && s.length);
		if (!more.length) return this;
		const old = this.raw;
		this.put("raw", [...old, ...more]);
		this.emit("change", "raw", this.raw, old);
		this.emit("delta", { raw: { push: more } }, this);
		return this;
	}
	set_one(key, value){ return key === "raw" ? void this.push_raw(value) : super.set_one(key, value); }

	get paragraphs(){ return this._paragraphs ??= new Paragraphs({ owner: this, name: "paragraphs" }); }
	set paragraphs(_plain){ void this.paragraphs; }   // Item.hydrate hands over a plain List; the typed one stays
	get replies(){ return this._replies ??= new List({ owner: this, name: "replies" }); }
	set replies(list){ this._replies = list; }
	get(key){ return key === "paragraphs" ? this.paragraphs : key === "replies" ? this.replies : super.get(key); }
	lists(){
		const { _paragraphs, _replies, ...rest } = super.lists();
		return { ...rest, ...(_paragraphs?.length ? { paragraphs: _paragraphs } : {}), ...(_replies?.length ? { replies: _replies } : {}) };
	}

	/** [{id, text, paragraph}]: the numbered sentences of the cleaned paragraphs (or of the raw words before any paragraph exists). */
	get sentences(){
		const out = [];
		const paras = [...this.paragraphs];
		if (!paras.length) this.raw_text && Prompt.split(this.raw_text).forEach((text, i) => out.push({ id: `r${i + 1}`, text, paragraph: null }));
		for (const p of paras){
			const given = p.get_one("sentences");
			(Array.isArray(given) ? given : Prompt.split(p.get_one("text"))).forEach((text, i) => out.push({ id: `${p.id}${i + 1}`, text, paragraph: p.id }));
		}
		return out;
	}
	sentence(id){ return this.sentences.find(s => s.id === id); }
	/** The replies that answer a sentence (and, with a word range, the words), in order. */
	replies_to(sentence_id){ return [...this.replies].filter(r => r.get_one("anchor")?.sentence === sentence_id); }
	/** The cleaned text, paragraphs joined by a blank line; before any paragraph, the raw words. */
	get cleaned(){ const ps = [...this.paragraphs].map(p => p.get_one("text") ?? ""); return ps.length ? ps.join("\n\n") : this.raw_text; }
	/** The text the chat draws: the smart assistant's refined version when it wrote one (`{text}`, with `title`), else the cleaned text. */
	get text(){ return this.get_one("text") ?? this.cleaned; }
	set text(value){ this.put("text", value); }
	get label(){ return this.get_one("title") ?? this.get_one("subject") ?? (this.sentences[0]?.text ?? this.id).slice(0, 80); }

	// ---- completion: the owner's rule is "complete when everything it asks is done or documented" ----
	get parts(){ return this.get_one("parts") ?? []; }
	/** Sentence ids no part (or its nested detail) cites. */
	get uncovered(){
		const cited = new Set(), walk = ps => (ps ?? []).forEach(p => { (p.cites ?? []).forEach(n => cited.add(n)); walk(p.parts); });
		walk(this.parts);
		return this.sentences.map(s => s.id).filter(id => !cited.has(id));
	}
	/** A task's state by id or path: my own asks first, then anywhere in the session. */
	task_state(ref){ const key = String(ref ?? "").split("/").filter(Boolean).at(-1); return (this.find(key) ?? this.root()?.find?.(key))?.state ?? null; }
	/** {done, total}: parts settled, out of parts + uncited sentences. */
	progress_parts(task_state = ref => this.task_state(ref)){
		const done = this.parts.filter(p => Prompt.settled(p, task_state)).length;
		return { done, total: this.parts.length + this.uncovered.length };
	}
	settled_parts(){ return this.parts.filter(p => Prompt.settled(p, ref => this.task_state(ref))); }
	/* With parts recorded, completion is settled parts over parts + uncited sentences; else the asks filed under it (Task.progress_of); else
	   my own stored state. Never reads `this.state`, which is computed from this. */
	get completion(){
		if (this.data.checked_by) return 1;
		if (this.parts.length){ const { done, total } = this.progress_parts(); return total ? done / total : 0; }
		const { done, total } = Task.progress_of(this._tasks);
		if (total) return done / total;
		return super.state === "complete" ? 1 : 0;
	}
	/* A prompt reads complete the moment everything it asks is settled, with nobody calling complete(): the session's tally then counts it. */
	get state(){
		const s = super.state;
		if (s === "complete" || s === "stopped") return s;
		const has_work = this.parts.length || Task.progress_of(this._tasks).total;
		return has_work && this.completion === 1 ? "complete" : s;
	}
	progress(){
		if (this.parts.length) return { ...this.progress_parts(), stopped: 0 };
		return super.progress();
	}

	// ---- replay ----
	replay_line(line){
		super.replay_line(line);
		if (line.raw !== undefined) this.push_raw(line.raw);
		if (line.paragraphs && typeof line.paragraphs === "object") this.paragraphs.set(line.paragraphs);
		if (line.replies && typeof line.replies === "object") this.replies.set(line.replies);
		if (Array.isArray(line.parts)) this.put("parts", line.parts);
		return this;
	}

	/* THE TRACE (the owner, 2026-10-25: "didn't I ask for this?"): the Prompts of a session whose words contain the asked words, best first.
	   Each hit: {id, at, subject, score, sentences: [the matching sentence ids], tasks: [{id, title, state, path}], completion}.
	   `tasks` are the asks nested under it plus anything in the session made from it (source.prompt or from = its id). Pure: reads the nodes. */
	static trace(session, words, { min = 0.8 } = {}){
		const tokens = [...new Set(String(words ?? "").toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [])];
		if (!tokens.length) return [];
		const everything = [];
		session.walk(n => { if (n !== session) everything.push(n); });
		const hits = [];
		for (const p of everything){
			if (!(p instanceof Prompt)) continue;
			const hay = [p.raw_text, p.cleaned, p.text, p.get_one("title") ?? "", p.get_one("subject") ?? ""].join(" ").toLowerCase();
			const score = tokens.filter(t => hay.includes(t)).length / tokens.length;
			if (score < min) continue;
			const mine = new Set();
			const own = []; p.walk(n => { if (n !== p && n.get_one && n.state !== undefined) own.push(n); });
			for (const n of own) mine.add(n);
			for (const n of everything){
				if (mine.has(n) || n === p || n instanceof Paragraph) continue;
				const src = n.get_one?.("source");
				if (n.get_one?.("from") === p.id || (src && typeof src === "object" && src.prompt === p.id)) mine.add(n);
			}
			const tasks = [...mine].filter(n => n.state !== undefined && n.get_one && !(n.parent?.owner instanceof Paragraph)).map(n => ({ id: n.id, title: n.get_one("title") ?? n.get_one("text") ?? n.id, state: n.state, ...(n.get_one("path") ? { path: n.get_one("path") } : {}) }));
			const sentences = p.sentences.filter(s => tokens.some(t => s.text.toLowerCase().includes(t))).map(s => s.id);
			hits.push({ id: p.id, at: p.created_at, subject: p.get_one("subject") ?? null, score, sentences, tasks, completion: p.completion });
		}
		return hits.sort((a, b) => b.score - a.score || String(b.at ?? "").localeCompare(String(a.at ?? "")));
	}
}

export default Prompt;

Item.register(Prompt, "Prompt");
