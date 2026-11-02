// Sentence.js — one finished sentence the owner said or typed, kept as it was heard: the raw words of the chat (data-shapes
// synthesis §3 [A]: sentences live in their own list, `session.sentences`, append-only and never moved, and a Prompt holds their ids,
// so an anchor on a sentence stays valid forever). `raw` is Whisper's own words when the clean-up changed them.
import Item from "../../Item/Item.js";

export class Sentence extends Item {
	get text(){ return this.get_one("text") ?? ""; }
	/** "voice" | "text" (typed). */
	get via(){ return this.get_one("via") ?? null; }
	get at(){ return this.get_one("at") ?? null; }
	get raw(){ return this.get_one("raw") ?? null; }
}

export default Sentence;

Item.register(Sentence, "Sentence");
