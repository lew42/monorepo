// Reply.js — an assistant's answer in the chat. `re` anchors it to what it answers ({to: <sentence id>}, the synthesis's Anchor),
// `level` marks a refined version of the owner's words (Sessions.line with a level), `thread` a reply inside a thread.
import Message from "./Message.js";
import Item from "../../Item/Item.js";

export class Reply extends Message {
	/** {to: "<sentence id>"}: the owner sentence this answers, or null. */
	get re(){ return this.get_one("re") ?? null; }
	get level(){ return this.get_one("level") ?? null; }
}

export default Reply;

Item.register(Reply, "Reply");
Message.TYPES.Reply = Reply;
