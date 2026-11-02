import { Page, p, div } from "/app.js";
import ChatV1Dot2 from "./ChatV1Dot2.js";

export default new Page({
	meta: import.meta,
	title: "Chat V1.2",
	description: "V1's chat, drawn from session.messages, with a send cursor: one ✓ after the words the assistant has.",
	icon: "forum",

	content(){
		const src = new URLSearchParams(location.search).get("src"), url = src ?? new URL("./fixture/session.jsonl", import.meta.url).href;
		p(src ? `This is the chat of the session file you chose (${src}), drawn live.` : "A demo of Chat V1.2. The green ✓ sits after the last sentence the assistant has received; the faded sentence after it is on its way. To see a real session, add ?src= and the address of its session.jsonl to this page's address.");
		const $box = div.c("chat-v1-2");
		new ChatV1Dot2({ url, $box }).live();
	},
});
