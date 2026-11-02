// Message.js — one entry of a session's chat (core/Session/Chat/readme.md): who wrote it (`by`), when (`at`), and its text.
// The base of the chat's entry classes (data-shapes synthesis §2: Prompt, Reply, Question, Card and Ref are Messages). A plain
// Message is a note with no more structure, e.g. Servex saying "the assistant could not be reached". DOM-free: node and the
// browser build the same Message from the same lines.
import Item from "../../Item/Item.js";

export class Message extends Item {
	/* The chat's own type names, filled by each subclass's file. Looked up BEFORE the global registry, because "Prompt" means the chat
	   message here (./Prompt.js) and the Prompt task (core/Task/Prompt.js) in Item.types. A name not here falls back to Item.hydrate's rule. */
	static TYPES = {};
	static hydrate(json, seen){
		const Class = json && Message.TYPES[json.type];
		if (!Class) return super.hydrate(json, seen);
		const { type, ...rest } = json;
		return Item.hydrate.call(Class, rest, seen);   // no type: Item.hydrate builds `this`, the chat's class
	}
	/** "owner" | "smart" | "fast" | "system": who wrote it. */
	get by(){ return this.get_one("by") ?? null; }
	/** When it was said or written: the time on the V1 `{chat}` line it mirrors (local time with offset and ms, Servex's now_ms). */
	get at(){ return this.get_one("at") ?? null; }
	get text(){ return this.get_one("text") ?? ""; }
}

export default Message;

Item.register(Message, "Message");
Message.TYPES.Message = Message;
