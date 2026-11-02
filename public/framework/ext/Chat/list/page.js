import { Page, p, div } from "/app.js";
import ChatList from "./ChatList.js";

export default new Page({
	meta: import.meta,
	title: "Chat list",
	description: "A session's real chat list (session.messages), drawn live: one bubble per message, in the list's order, from the list's lines alone.",
	icon: "chat",

	content(){
		const src = new URLSearchParams(location.search).get("src"), url = src ?? new URL("./fixture/session.jsonl", import.meta.url).href;
		p(src ? `The chat list of the session file you passed in ?src= (${src}), drawn live.` : "A demo: a small session written by Servex's real writer (Servex/agents/chat-messages.test.mjs). Pass ?src=<url of any session.jsonl> to draw a live one; a voice session written since this landed has the list.");
		const $box = div.c("chatlist");
		new ChatList({ url, $box }).live();
	},
});
