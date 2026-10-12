import { Page, md, p, h4 } from "/app.js";

// Every shape `content` can take, one child page each. Proof of core/Page/doc/content-list-step-1.md (readme.md here).
const STRINGS = ["The first plain sentence.", "A second sentence, so the hash differs.", "Third: short.", "Fourth, with `backticks` in the text.", "Fifth and last."];
const ADDRESSES = ["/framework/core/Page/doc/ai-api.md", "/framework/core/Page/parts/readme.md", "/framework/core/Item/readme.md", "/framework/core/Page/jsonl/", "/framework/core/Page/parts/"];

export default new Page({
	meta: import.meta,
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
		h4("Every link below is one shape of page content");
		const link = (label, note) => `- [${label}](${this.url}${label.toLowerCase().replace(/ /g, "-")}/): ${note}`;
		md([
			link("Code", "a function, `content(){…}`"),
			...STRINGS.map((text, i) => link(`String ${i + 1}`, `a string`)),
			...ADDRESSES.map((url, i) => link(`Address ${i + 1}`, `the address ${url}`)),
			link("Both", "code and a `page.jsonl` line, both shown"),
			link("Class body", "`content(){…}` written in the class body"),
		].join("\n"));
	},
});
