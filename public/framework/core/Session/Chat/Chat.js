// Chat.js — a session's conversation, in the order it happened: one List of Messages (core/Session/Chat/readme.md; data-shapes
// synthesis §2, `class Chat extends List<Message>`). It lives on the Session as `session.messages`; the raw words live beside it in
// `session.sentences`. Members: Prompt (the owner's words), Reply (an assistant's answer), Message (a plain note). The order of the
// list IS the chat's order: nothing is sorted by time, and a member's text may change in place but its position never does.
import Item from "../../Item/Item.js";
import List from "../../List/List.js";
import Message from "./Message.js";
import "./Prompt.js";   // fills Message.TYPES.Prompt
import "./Reply.js";    // fills Message.TYPES.Reply
import "../../Item/Ref.js";   // registers "Ref" in Item.types, so a {type:"Ref"} message hydrates as the real core Ref (F7's doc)

export class Chat extends List {
	/** The messages, in order (the owner's word). */
	get messages(){ return [...this.items]; }
	/** The newest message, or undefined. */
	get last(){ return this.items.at(-1); }

	/* Resurface (the owner, 2026-11-01): a message read again belongs at the BOTTOM too, but the original must stay exactly
	   where it was said — the log is never rewritten. So this adds a Ref to it at the bottom (never a move: F7's `add` would
	   only make a Ref anyway, since `message` already lives in this very list) and marks the original `resurfaced: <ref id>`
	   so a view can dim it, or draw an arrow from the old line to the new one. Two item-tool lines: the Ref's `add`, the
	   original's `set`. */
	resurface(message){
		const msg = message instanceof Message ? message : this.find(message);
		if (!msg) throw new Error("Chat.resurface: no such message");
		const ref = this.add({ type: "Ref", path: Item.Store.address(msg, this.root()) });
		msg.set({ resurfaced: ref.id });
		return ref;
	}
}
// A plain member is built by Message.hydrate: its type through Message.TYPES ("Prompt" is ./Prompt.js here), an untyped one a Message.
// On `of`, so replay (List.make) and a snapshot load (Item.hydrate's lists) build the same classes.
Chat.prototype.of = Message;

export default Chat;
