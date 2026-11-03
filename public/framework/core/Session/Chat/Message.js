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
	/** A type found here builds that class; `"Ref"` is the one name let through from the GLOBAL registry on purpose (the chat's
	    own documented exception — core/Session/Chat/readme.md). Anything else — no `type` at all, or one nobody registered for
	    the chat (a guessed `"Card"`, `"Note"`, `"Task card"` — review finding 2) — builds a plain Message instead of falling
	    through to `Item.hydrate`'s own generic-Item fallback, which has none of this class's `text`/`title`/`icon` getters: that
	    gap is exactly how the owner's card came back titled the literal word "undefined" (ask3-cards-by-id). Consulting the WHOLE
	    global registry for an unknown name (an earlier version of this fix did) is its own trap: `ext/editor/blocks.js` registers
	    an unrelated `Card` globally (a Panel block, `words: "flex v gap pad surface"`), and a page that happens to have loaded it
	    would hydrate a card message as THAT class instead — caught by `ChatV3.test.mjs`'s live DOM check, never by a node test
	    with no other module loaded. The guessed word itself is not kept; a view (or a reader) should never need it. */
	static hydrate(json, seen){
		const type = json?.type, Known = type ? (Message.TYPES[type] ?? (type === "Ref" ? Item.types.get("Ref") : null)) : null;
		const { type: _drop, ...rest } = json ?? {};
		return Item.hydrate.call(Known ?? Message, rest, seen);
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
