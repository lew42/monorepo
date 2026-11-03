// Message.js — one entry of a session's chat (core/Session/Chat/readme.md): who wrote it (`by`), when (`at`), and its text.
// The base of the chat's entry classes (data-shapes synthesis §2: Prompt, Reply, Question, Card and Ref are Messages). A plain
// Message is a note with no more structure, e.g. Servex saying "the assistant could not be reached". DOM-free: node and the
// browser build the same Message from the same lines.
import Item from "../../Item/Item.js";
import List from "../../List/List.js";

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
	/** "A card with an icon and a title" (ask3-cards-by-id) is just a Message with these two fields set — no separate Card class
	    (Law 6): `item({delta:{messages:{add:{icon,title}}}})` makes one, and setting `title` on any existing message (a Reply, a
	    plain Message) "upgrades" it into a card the same way. One Material Symbols name. */
	get icon(){ return this.get_one("icon") ?? null; }
	/** A short heading. `Prompt.title` overrides this with its own getter — same field, same meaning. */
	get title(){ return this.get_one("title") ?? null; }
	/** Whatever is filed under this message once it is a card: a List of plain Items, made on first use (same pattern as
	    `Prompt.items`). Reading, appending and rewriting all go through the item tool at this message's id. */
	get content(){
		if (!this._content) this._content = new List({ owner: this, name: "content" });
		return this._content;
	}
	set content(_plain){ void this.content; }   // Item.hydrate hands over a plain List; the typed one stays
	lists(){
		const { _content, ...rest } = super.lists();
		return { ...rest, ...(_content?.length ? { content: _content } : {}) };
	}
}

export default Message;

Item.register(Message, "Message");
Message.TYPES.Message = Message;
// "Card" is not its own class: an agent naturally guesses `type: "Card"` for "a card" (the owner got a literal "undefined" when
// that guess fell through to a generic, Message-less Item — ask3-cards-by-id, the bug this alias and the page_tools.js fix close).
Message.TYPES.Card = Message;
