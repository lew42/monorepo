import { Page, md, p } from "/app.js";

/* The module's notes, one topic each.

   ⚠ Each one is DECLARED with the `.md` it renders, the idiom `styles/rules/page.js`
     uses — never left as a bare name for core's probe chain to discover. A declared
     name with no `page.js` costs a real 404 per note in the console before
     `Page.file()` finds the markdown, and four notes is four red lines on a page
     that is working perfectly. Declared, the file is fetched once and titled. */

const note = (title, file, description) => [title, {
	description,
	content(){ return md.file(import.meta, file); },
}];

export default new Page({
	meta: import.meta,
	title: "Docs",
	description: "Four notes: the props, the rules, the fixtures, and the port.",
	icon: "description",

	children: [
		note("Props", "props.md",
			"What a layout declares, in full — and why every one of them is a plain page prop."),
		note("Rules", "rules.md",
			"Three deny rules, and the line-by-line argument for everything CSS already answers."),
		note("Fixtures", "fixtures.md",
			"The eight runs, what the checker reads, and what approved means."),
		note("Porting", "porting.md",
			"Where the thirty came from, and the five things that changed on the way."),
	],

	content(){
		p("Four notes behind the tree. The props are what a filter reads; the rules are the three things CSS cannot answer; the fixtures are what makes a layout approved; the port says where the thirty came from and what changed on the way.");

		this.previews();
	},
});
