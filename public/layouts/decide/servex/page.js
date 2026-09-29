import { Page, md } from "/app.js";

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
		md("**The five questions, asked of a real page one at a time.** The page is [/framework/servex/](/framework/servex/). Each question went to the same agent as its own turn, so it could think about that one thing only; the answers are below as it gave them.");
		return md.file(import.meta, "answers.md");
	},
});
