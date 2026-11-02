// Prompt.js — what the owner said in one go, as ONE chat message: the ids of its sentences (in `session.sentences`), grown while the
// owner keeps talking, and later a title and cleaned text (data-shapes synthesis §2: `class Prompt extends Message`).
//
// ⚠ TWO CLASSES NAMED Prompt, on purpose and for now: core/Task/Prompt.js is today's Prompt TASK (session.tasks, read by Chat V2/V3),
// registered globally as "Prompt". This one is the chat message the shape moves to (synthesis decision 2). It is NOT registered
// globally (one wire name, one class); a chat member's type is resolved through Message.TYPES first (Message.hydrate), so a line
// `{"messages":{"add":{"type":"Prompt",…}}}` builds this and `{"tasks":{"add":{"type":"Prompt",…}}}` still builds the task.
// Import the one you mean by its path. When the Task Prompt retires, this one is registered and the note goes.
import Message from "./Message.js";

export class Prompt extends Message {
	// `sentences` is an array of ids: data, not child Items.
	static plain_lists = ["sentences"];

	/** The ids of its sentences, in the order they were said. */
	get sentences(){ return [...(this.get_one("sentences") ?? [])]; }
	/** "draft" while it has no refined text, else "refined". Computed, never stored. */
	get state(){ return this.get_one("text") ? "refined" : "draft"; }
	get title(){ return this.get_one("title") ?? null; }
	/** The cleaned text, once someone refines it; the words as said are `said`. */
	get text(){ return this.get_one("text") ?? ""; }
	/** The id of today's Prompt task (session.tasks) these words were also filed into, the link V2/V3 can follow. */
	get prompt(){ return this.get_one("prompt") ?? null; }
	/** The Sentence items, looked up in the session's `sentences` list (a member's parent is the list's owner, the Session). */
	get sentence_items(){
		const all = this.parent?._sentences;
		return this.sentences.map(id => all?.find(id)).filter(Boolean);
	}
	/** The words as said: its sentences joined, the full dictation. */
	get said(){ return this.sentence_items.map(s => s.text).join(" "); }

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
	set_one(key, value){ return key === "sentences" ? void this.push_sentences(value) : super.set_one(key, value); }
	wire(){ return "Prompt"; }
}

Message.TYPES.Prompt = Prompt;
export default Prompt;
