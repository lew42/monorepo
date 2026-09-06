import { Page, md } from "/app.js";

/* The module's notes, one topic each.

   ⚠ Each one is DECLARED with the `.md` it renders — never left as a bare name for
     core's probe chain to discover. A declared name with no `page.js` costs a real
     404 per note in the console before `Page.file()` finds the markdown. The idiom
     is `core/Layout/doc/page.js`'s, copied deliberately. */

const note = (title, file, description) => [title, {
	description,
	content(){ return md.file(import.meta, file); },
}];

export default new Page({
	meta: import.meta,
	title: "Docs",
	description: "Three notes: the idea, the picker, and the slots.",
	icon: "description",

	children: [
		note("Idea", "idea.md",
			"What a Section is, what it is not, and why it is a Page rather than a View."),
		note("Picker", "picker.md",
			"One control, the width rule it asks, and why a greyed row is not a disabled one."),
		note("Slots", "slots.md",
			"How a layout's boxes become regions, how children find them, and what happens to the ones that do not."),
	],

	content(){ return this.previews(); },
});
