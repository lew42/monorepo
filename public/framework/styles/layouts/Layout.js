import { Page, div } from "/app.js";

/* A page that IS a layout. `classes` shapes the page, `layout()` fills it — and
 * the index renders that same `layout()` inside a gallery card, so a thumbnail
 * cannot drift from the page it links to. Design record: readme.md.
 */
export default class Layout extends Page {

	// no `h1`: a heading above a masthead means it isn't one. Router still sets
	// document.title from `title`.
	render(){
		return this.view ??= div.c("page", () => this.layout())
			.ac(this.classes)
			.ac("page-" + this.name);
	}
}

export { Layout };
