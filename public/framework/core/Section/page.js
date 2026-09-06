import { Page, demo, md, div, p } from "/app.js";
import Section from "./Section.js";

/* One screen: the thing itself, three times — empty, filled, and read off disk.

   ⚠ Every section here is given a `url`. A Section is a Page, so its url is its
     storage key and its children hang off it; a section built with no address at
     all works fine and simply has neither. */

export default new Page({
	meta: import.meta,
	title: "Section",
	description: "A page inside a page: an empty box that picks an approved layout.",
	icon: "view_agenda",

	children: ["doc"],

	content(){

		p("A Section is a page you put inside a page. It starts as a plain box two and a half lines tall with nothing in it at all. Turn editing on and it grows exactly one control: the layouts from core/Layout that fit this box, and picking one turns that layout's named boxes into the section's own slots.");

		demo("Empty, with editing on", () => {

			new Section({ url: "/framework/core/Section/empty/", editing: true }).render();

		}, "Hover the dashed box. One control, in the corner, and nothing on the page moved to make room for it. Open it: every approved layout that fits this width is pickable, and every one that does not says what it needs instead. Drag the handle to 700 and open it again — the list is read off the box's live width, so it changes with the box.");

		demo("Children mount into the slots by name", () => {

			new Section({
				url: "/framework/core/Section/team/",
				editing: true,
				layout: "main-aside",
				children: {
					Main:  { content(){ p("The layout calls this box Main. This page is called main. That is the whole wiring — the layout names the boxes, the page names the children, and the two meet by name."); } },
					Aside: { content(){ p("And this one landed in Aside."); } },
				},
			}).render();

		}, "Pick a different layout and the same two children move into the new shape. Pick one whose boxes are called something else and they fall out of the slots and stack underneath — a section never silently drops what it was given. And press MOBILE: 390px is under this layout's proven floor of 700, so the section stacks and the overlay says which layout it is holding. That is LayoutRule #1, live.");

		demo("The same thing, read from a page.json", () => {

			div($box => {
				Section.from("/framework/core/Section/example/")
					.then(section => $box.empty(() => { section.edit().render(); }));
			});

		}, "A Section is a Page, so it reads a page.json the way any page does — plus one key, layout. Children, naming, storage and the six page words all arrive inherited rather than written.");

		md(`**Demos do not persist.** The picker's choice lives on the instance, so a reload is this page again. Storage is inherited and works — \`section.store()\` is keyed on the section's own url — but writing is an editor's job, and an editor has to make saving visible.`);

		md("Behind it: [what a Section is, and is not](/framework/core/Section/doc/idea/) · [the picker, and the width rule it asks](/framework/core/Section/doc/picker/) · [slots, children and regions](/framework/core/Section/doc/slots/) · [core/Layout](/framework/core/Layout/), where the thirty layouts live.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
