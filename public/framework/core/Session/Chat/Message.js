// Message.js — one entry of a session's chat (core/Session/Chat/readme.md): who wrote it (`by`), when (`at`), and its text.
// The base of the chat's entry classes (data-shapes synthesis §2: Prompt, Reply, Question, Card and Ref are Messages). A plain
// Message is a note with no more structure, e.g. Servex saying "the assistant could not be reached". DOM-free: node and the
// browser build the same Message from the same lines.
import Item from "../../Item/Item.js";
import List from "../../List/List.js";

export class Message extends Item {
	/* The chat's own type names, filled by each subclass's file. Looked up BEFORE the global registry, because "Prompt" means the chat
	   message here (./Prompt.js) and the Prompt task (core/Task/Prompt.js) in Item.types. "Ref" is the one name let through from the
	   global registry too (core/Session/Chat/readme.md); any other name nobody registered here builds a plain Message, never falls
	   through to Item.hydrate's generic-Item fallback (its own rule would miss text/title/icon and the global registry can collide
	   with an unrelated class of the same name — ext/editor/blocks.js's Panel "Card" is one). */
	static TYPES = {};
	static hydrate(json, seen){
		const type = json?.type, Known = type ? (Message.TYPES[type] ?? (type === "Ref" ? Item.types.get("Ref") : null)) : null;
		const { type: _drop, ...rest } = json ?? {};
		return Item.hydrate.call(Known ?? this, rest, seen);
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
