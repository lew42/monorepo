import { Page, p, div } from "/app.js";
import ChatList from "./ChatList.js";

export default new Page({
	meta: import.meta,
	title: "Chat list",
	description: "A session's real chat list (session.messages), drawn live: one bubble per message, in the list's order, from the list's lines alone.",
	icon: "chat",

	content(){
		const src = new URLSearchParams(location.search).get("src"), url = src ?? new URL("./fixture/session.jsonl", import.meta.url).href;
		p(src ? `The chat of the session at ${src}, drawn live: a new message appears here as soon as it is written.` : "Every voice session now keeps its chat as one list: what you said, and each reply, in the order it happened. This is a small example session, drawn from that list alone. When a new message is added, it appears here without reloading.");
		const $box = div.c("chatlist");
		new ChatList({ url, $box }).live();
	},
});
