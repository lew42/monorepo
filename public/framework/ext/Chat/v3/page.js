import { Page, p, div } from "/app.js";
import ChatV3 from "./ChatV3.js";

export default new Page({
	meta: import.meta,
	title: "Chat v3",
	description: "A session's chat drawn from session.messages: prompts in list order, the replies that answer them (found by re.to) and the tasks/questions beside them.",
	icon: "forum",

	content(){
		const src = new URLSearchParams(location.search).get("src"), url = src ?? new URL("./fixture/messages-session.jsonl", import.meta.url).href;
		p(src ? `This is the chat of the session file you passed in ?src= (${src}), drawn live.` : "This is a demo of Chat v3, drawn from a real voice session's fixture (session.messages). Pass ?src=<url of any session.jsonl> to draw a real one.");
		const $box = div.c("chat-v3");
		new ChatV3({ url, $box }).live();
	},
});
