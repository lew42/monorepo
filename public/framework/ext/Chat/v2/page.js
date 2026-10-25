import { Page, p, div } from "/app.js";
import ChatV2 from "./ChatV2.js";

export default new Page({
	meta: import.meta,
	title: "Chat v2",
	description: "A session's chat, read only: its prompts at the root, the assistant's replies, questions and tasks nested under each.",
	icon: "forum",

	content(){
		const src = new URLSearchParams(location.search).get("src"), url = src ?? new URL("./fixture/session.jsonl", import.meta.url).href;
		p(src ? `This is the chat of the session file you passed in ?src= (${src}), drawn live.` : "This is a demo of Chat v2: a made-up session's conversation, read from a fixture file and drawn live. Pass ?src=<url of any session.jsonl> to draw a real one.");
		const $box = div.c("chat-v2");
		new ChatV2({ url, $box }).live();
	},
});
