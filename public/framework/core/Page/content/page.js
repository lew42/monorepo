import { Page, p, h4 } from "/app.js";

// Every shape `content` can take, one child page each. Proof of core/Page/doc/content.md step 1 (readme.md here).
const STRINGS = ["The first plain sentence.", "A second sentence, so the hash differs.", "Third: short.", "Fourth, with `backticks` in the text.", "Fifth and last."];
const ADDRESSES = ["/framework/core/Page/doc/ai-api.md", "/framework/core/Page/parts/readme.md", "/framework/core/Item/readme.md", "/framework/core/Page/jsonl/", "/framework/core/Page/parts/"];

export default new Page({
	title: "Page content, every shape",
	icon: "view_list",
	description: "A function, a string, an address, parts in page.jsonl, or code and parts together: one child page each.",

	children: [
		["Code", { content(){ h4("A function"); p("Written as content(){…}, drawn as one code item."); } }],
		...STRINGS.map((text, i) => [`String ${i + 1}`, { content: text }]),
		...ADDRESSES.map((url, i) => [`Address ${i + 1}`, { content: url }]),
		"both/page.jsonl",
		"class-body/page.jsonl",
	],

	content(){
		h4("Every child below is one shape of page content");
		p("Code, five strings, five addresses, a class with its own content(), and code plus a page.jsonl line together.");
	},
});
