import { Page, md, div, p, h3 } from "/app.js";

// The pick from each answer in answers.md, copied by hand after the run.
const PICKS = [
	["How much room is there?", "Most of a 3440 screen"],
	["How much content is there?", "A little"],
	["Is it outlined yet?", "Yes"],
	["How will the content fill the width?", "A wall of cards"],
	["Which approved layout fits?", "Tile wall"],
];

/* LAYOUT. Container: a child of /layouts/decide/, the ordinary page grid. Size: prose, the
   `main` track. Own layout: one markdown file. Preview: the default card.

   The five questions from ../questions.js, asked of /framework/servex/ ONE AT A TIME by
   Server/ask-each.mjs (one agent session, context once, then each question as its own turn),
   answers saved beside this file as answers.md. How it was run: the top of answers.md. */
export default new Page({
	meta: import.meta,
	title: "Worked example: Servex",
	icon: "quiz",
	description: "The five questions, asked of /framework/servex/.",

	content(){
		md("**The five questions, asked of a real page one at a time, picked a tile wall.** The page is [/framework/servex/](/framework/servex/). Each question went to the same agent as its own turn, so it could think about that one thing only. Its five picks first; its reasoning, as it gave it, below.");
		div.c("grid auto gap wide", () => PICKS.forEach(([q, pick], i) => {
			div.c("card flex v gap-35", () => { p.c("muted", `${i + 1}. ${q}`); h3(pick); });
		})).style("--column", "14rem");
		return md.file(import.meta, "answers.md");
	},
});
