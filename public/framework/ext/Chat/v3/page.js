import { Page, p, div } from "/app.js";
import ChatV3 from "./ChatV3.js";

export default new Page({
	meta: import.meta,
	title: "Chat v3",
	description: "A rough draft of a session's chat as a plain view over its tasks list: prompts in time order, the assistant's replies and questions inside them.",
	icon: "forum",

	content(){
		const src = new URLSearchParams(location.search).get("src"), url = src ?? new URL("../v2/fixture/session.jsonl", import.meta.url).href;
		p(src ? `This is the chat of the session file you passed in ?src= (${src}), drawn live.` : "This is a demo of Chat v3, drawn from Chat v2's fixture file. Pass ?src=<url of any session.jsonl> to draw a real one.");
		const $box = div.c("chat-v3");
		new ChatV3({ url, $box }).live();
	},
});
