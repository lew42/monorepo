// Prompt.js — what the owner said in one go, as ONE chat message: the ids of its sentences (in `session.sentences`), grown while the
// owner keeps talking, and later a title and cleaned text (data-shapes synthesis §2: `class Prompt extends Message`).
//
// ⚠ TWO CLASSES NAMED Prompt, on purpose and for now: core/Task/Prompt.js is today's Prompt TASK (session.tasks, read by Chat V2/V3),
// registered globally as "Prompt". This one is the chat message the shape moves to (synthesis decision 2). It is NOT registered
// globally (one wire name, one class); a chat member's type is resolved through Message.TYPES first (Message.hydrate), so a line
// `{"messages":{"add":{"type":"Prompt",…}}}` builds this and `{"tasks":{"add":{"type":"Prompt",…}}}` still builds the task.
// Import the one you mean by its path. When the Task Prompt retires, this one is registered and the note goes.
//
// PROMPT AS A CARD (chat-model step 6, plan.md decision 4): `kind` ("task"|"request"|"question", absent = a plain dictation) turns a
// Prompt into a card a view draws as title -> items -> raw text. `items` is a List of PromptItem (each `{title, sentences:[ids]}`) or a
// Ref to something filed elsewhere — no separate Card class (Law 6): the shape lives on Prompt itself.
import Message from "./Message.js";
import List from "../../List/List.js";
import PromptItem from "./PromptItem.js";

export class Prompt extends Message {
	// `sentences` is an array of ids: data, not child Items.
	static plain_lists = ["sentences"];

	/** The ids of its sentences, in the order they were said. */
	get sentences(){ return [...(this.get_one("sentences") ?? [])]; }
	/** "draft" while it has no refined text, else "refined". Computed, never stored. */
	get state(){ return this.get_one("text") ? "refined" : "draft"; }
	get title(){ return this.get_one("title") ?? null; }
	/** The cleaned text, once someone refines it; the words as said are `raw`. */
	get text(){ return this.get_one("text") ?? ""; }
	/** The id of today's Prompt task (session.tasks) these words were also filed into, the link V2/V3 can follow. */
	get prompt(){ return this.get_one("prompt") ?? null; }
	/** "task" | "request" | "question", once a view or an agent makes it a card; absent = a plain dictation. */
	get kind(){ return this.get_one("kind") ?? null; }
	/** The smart seat's "seen it, writing" sign: `{by, at}` while it answers, else null (`{working: null}` clears it; core/Task/Prompt.js carries the same shape until a view reads this one). */
	get working(){ return this.get_one("working") ?? null; }
	/** {fast?: {at}, smart?: {at}}: when each seat was handed this Prompt's words (`Sessions.mark_sent`, through ChatWriter). 🧠 means answered, not just received — a Reply or this Prompt's own title/text after `smart.at`. */
	get sent(){ return { ...(this.get_one("sent") ?? {}) }; }
	/** The Sentence items, looked up in the session's `sentences` list (a member's parent is the list's owner, the Session). */
	get sentence_items(){
		const all = this.parent?._sentences;
		return this.sentences.map(id => all?.find(id)).filter(Boolean);
	}
	/** The exact words as said, rebuilt from its sentences — never stored: each sentence's own text, in order, joined by one space, untrimmed (plan.md decision 5; the same rule a V1 raw prompt was built from). */
	get raw(){ return this.sentence_items.map(s => s.text).join(" "); }
	/** Old name for `raw`, kept because `ext/Chat/v3/ChatV3.js:163` reads it and that file is dictation-v3's fence (never edited here). Remove once v3 moves to `raw`. */
	get said(){ return this.raw; }
	/** {<sentence id>: text}: the fast seat's cleaned text per sentence (a `{place}` with edit "improve"); the raw words stay in `sentences`. */
	get clean(){ return { ...(this.get_one("clean") ?? {}) }; }
	/** The words with each sentence's cleaned text where it has one: what a view shows by default. */
	get cleaned(){ const c = this.clean; return this.sentence_items.map(s => c[s.id] ?? s.text).join(" "); }
	/** The card's sub-items, each `{title, sentences:[ids]}` (PromptItem) or a Ref to something filed elsewhere. Made on first use. */
	get items(){
		if (!this._items){ this._items = new List({ owner: this, name: "items" }); this._items.of = PromptItem; }
		return this._items;
	}
	set items(_plain){ void this.items; }   // Item.hydrate hands over a plain List; the typed one stays

	/** Set the cleaned text of some sentences: `{clean: {"s-2": "…"}}` MERGES into what is there (the latest text for a sentence wins). */
	merge_clean(value){
		if (!value || typeof value !== "object" || Array.isArray(value)) return this;
		const old = this.clean;
		this.put("clean", { ...old, ...value });
		this.emit("change", "clean", this.clean, old);
		this.emit("delta", { clean: value }, this);
		return this;
	}

	/** Merge `{fast?: {at}, smart?: {at}}` into `sent` (the latest mark for a seat wins; the other seat's mark is kept). */
	merge_sent(value){
		if (!value || typeof value !== "object" || Array.isArray(value)) return this;
		const old = this.sent;
		this.put("sent", { ...old, ...value });
		this.emit("change", "sent", this.sent, old);
		this.emit("delta", { sent: value }, this);
		return this;
	}

	/** Grow it by one or more sentence ids: `{sentences: {push: "s-2"}}` or `{sentences: ["s-2"]}`. Nothing ever removes a sentence. */
	push_sentences(value){
		const more = [].concat(Array.isArray(value) ? value : value?.push ?? value).filter(s => typeof s === "string" && s.length);
		if (!more.length) return this;
		const old = this.sentences;
		this.put("sentences", [...old, ...more]);
		this.emit("change", "sentences", this.sentences, old);
		this.emit("delta", { sentences: { push: more } }, this);
		return this;
	}
	lists(){
		const { _items, ...rest } = super.lists();
		return { ...rest, ...(_items?.length ? { items: _items } : {}) };
	}
	set_one(key, value){
		if (key === "sentences") return void this.push_sentences(value);
		if (key === "clean") return void this.merge_clean(value);
		if (key === "sent") return void this.merge_sent(value);
		return super.set_one(key, value);
	}
	wire(){ return "Prompt"; }
}

Message.TYPES.Prompt = Prompt;
export default Prompt;
