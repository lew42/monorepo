import { Page, p, div } from "/app.js";
import ChatV2 from "./ChatV2.js";

export default new Page({
	meta: import.meta,
	title: "Chat v2",
	description: "A session's chat, read only: its prompts at the root, the assistant's replies, questions and tasks nested under each.",
	icon: "forum",

	content(){
		const src = new URLSearchParams(location.search).get("src"), url = src ?? new URL("./fixture/messages-session.jsonl", import.meta.url).href;
		p(src ? `This is the chat of the session file you passed in ?src= (${src}), drawn live.` : "This is a demo of Chat v2, drawn from the same fixture as Chat v3 (session.messages). Pass ?src=<url of any session.jsonl> to draw a real one.");
		const $box = div.c("chat-v3 chat-v2");   // ChatV2 extends ChatV3 and draws its markup: the v3 class gets ChatV3.css's layout, v2 is this page's own hooks
		new ChatV2({ url, $box }).live();
	},
});
