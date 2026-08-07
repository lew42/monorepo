import { Page, p, div, a } from "/app.js";
import { this_file } from "../../../compound/recipe.js";

/* A file-backed page that is ALSO a layout anyone can fill.
 *
 * The trick is one word: `export`. The factory is the layout; the default export
 * is one instance of it. A consumer who only wants the page walks to it lazily
 * and never sees this function; a consumer who wants to fill its slots imports
 * the function and builds its own instance — and pays the import, which is the
 * honest price of reaching inside somebody else's file. */
export function panel(fill){
	return {
		...fill,
		content(){
			div.c("embed-box", () => {
				div.c("code-label", this.title);
				this.header ? this.header() : p("(no header supplied)").ac("note");
				p("The layout's own body. No parent can replace this — a layout that let you replace everything would not be a layout.");
				this.footer ? this.footer() : p("(no footer supplied)").ac("note");
			});
		}
	};
}

export default new Page(panel({
	meta: import.meta,
	title: "Fixed",
	header(){ p("This instance fills its own header, in its own file."); },
	content_note: true,
}));
