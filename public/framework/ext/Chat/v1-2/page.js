import { Page, p, div } from "/app.js";
import ChatV1Dot2 from "./ChatV1Dot2.js";

export default new Page({
	meta: import.meta,
	title: "Chat V1.2",
	description: "V1's chat, drawn from session.messages, with a send cursor: one ✓ after the words the assistant has.",
	icon: "forum",

	content(){
		const src = new URLSearchParams(location.search).get("src"), url = src ?? new URL("./fixture/session.jsonl", import.meta.url).href;
		p(src ? `This is the chat of the session file you passed in ?src= (${src}), drawn live.` : "A demo of Chat V1.2. The ✓ sits after the last sentence the assistant has; the grey sentences after it are on their way. Pass ?src=<url of any session.jsonl> to draw a real one.");
		const $box = div.c("chat-v1-2");
		new ChatV1Dot2({ url, $box }).live();
	},
});
