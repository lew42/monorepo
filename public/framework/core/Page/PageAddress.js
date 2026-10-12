import PageContentItem from "./PageContentItem.js";

// A "/…" address as content: a markdown file or another page, drawn in this page's box. doc/content.md
export default class PageAddress extends PageContentItem {
	get value(){ return this.address; }
}
PageAddress.View = class PageAddressView extends PageContentItem.View {
	draw(){ return this.item.parent.content_at(this.item.address); }
};
