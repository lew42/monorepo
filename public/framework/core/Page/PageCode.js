import PageContentItem from "./PageContentItem.js";

// A function as content: `content(){ h1("Hi") }`. It runs with the page as `this`. doc/content.md
export default class PageCode extends PageContentItem {
	get value(){ return this.fn; }
}
PageCode.View = class PageCodeView extends PageContentItem.View {
	draw(){ return this.item.fn.call(this.item.parent); }
};
