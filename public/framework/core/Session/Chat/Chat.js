// Chat.js — a session's conversation, in the order it happened: one List of Messages (core/Session/Chat/readme.md; data-shapes
// synthesis §2, `class Chat extends List<Message>`). It lives on the Session as `session.messages`; the raw words live beside it in
// `session.sentences`. Members: Prompt (the owner's words), Reply (an assistant's answer), Message (a plain note). The order of the
// list IS the chat's order: nothing is sorted by time, and a member's text may change in place but its position never does.
import List from "../../List/List.js";
import Message from "./Message.js";
import "./Prompt.js";   // fills Message.TYPES.Prompt
import "./Reply.js";    // fills Message.TYPES.Reply

export class Chat extends List {
	/** The messages, in order (the owner's word). */
	get messages(){ return [...this.items]; }
	/** The newest message, or undefined. */
	get last(){ return this.items.at(-1); }
}
// A plain member is built by Message.hydrate: its type through Message.TYPES ("Prompt" is ./Prompt.js here), an untyped one a Message.
// On `of`, so replay (List.make) and a snapshot load (Item.hydrate's lists) build the same classes.
Chat.prototype.of = Message;

export default Chat;
