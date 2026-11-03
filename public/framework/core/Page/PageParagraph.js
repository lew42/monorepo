import PageContentItem from "./PageContentItem.js";
import { p } from "../View/View.js";

// A plain string as content: one paragraph. doc/content.md
export default class PageParagraph extends PageContentItem {
	get value(){ return this.text; }
}
PageParagraph.View = class PageParagraphView extends PageContentItem.View {
	draw(){ return p(this.item.text); }
};
