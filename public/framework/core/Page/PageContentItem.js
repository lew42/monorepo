import Item from "../Item/Item.js";
import View from "../View/View.js";

// The base of the three kinds a page's own code or config makes (PageCode, PageAddress, PageParagraph). doc/content.md
export default class PageContentItem extends Item {
	transient = true;   // never written to page.jsonl
}

// A view that draws in place: no wrapper element, it adds to whatever box is being drawn. `result` is what draw() returned.
PageContentItem.View = class PageContentItemView extends View {
	prerender(){}   // no element
	initialize(){ this.result = this.draw(); }
	draw(){}
};
