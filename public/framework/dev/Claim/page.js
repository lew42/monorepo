import { Doc, md, code, h2, button, div } from "/app.js";
import { claim, release, claimed } from "./claim.js";

export default new Doc({
	meta: import.meta,
	title: "Claim",
	description: "A tab, claimed by an agent — a ring around the viewport and a mark in the title.",
	icon: "crop_free",

	files: "claim.js claim.css page.js readme.md",
	notes: "decisions",

	content(){

		code.js(`import { claim, release } from "/framework/dev/Claim/claim.js";

claim("claude", "layout-generator-rules");`);

		md("Four Claude sessions run in this repo at once and they share one browser. A claimed tab says which one is yours — **a 6px ring around the whole viewport**, a label at the top centre, and a 🟠 in the tab title so it still reads as claimed from the tab strip.");

		this.demo();

		h2("Nobody imports it");

		md("It is loaded by `Server/plugins/MCP.js`'s **`claim`** and **`release`** tools, which wrap the two exports in an `eval` — so it ships zero bytes to a visitor and needs no localhost guard of its own. The socket that reaches it already has one. How it came about: [layout-generator-rules](/framework/ai/2026-08-16/layout-generator-rules/); why the tools own the verb: [mcp-tab-awareness](/framework/ai/2026-08-18/mcp-tab-awareness/).");

		code.js(`mcp__site__eval  path: "/framework/styles/layouts/space/"
  code: import("/framework/dev/Claim/claim.js").then(m => m.claim("claude", "my-task"))`);

		md("**Release it when the task lands.** A ring left up says an agent is driving a window that nobody is driving.");

		md.details(import.meta, "readme.md", "Readme");
	},

	demo(){
		return div.c("flex gap wrap v-center", () => {
			button("Claim this tab").click(() => claim("you", "trying it out"));
			button("Release").click(() => release());
			button("Is it claimed?").click(function(){ this.text(claimed() ? "claimed" : "free"); });
		});
	},
});
