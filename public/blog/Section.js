import { Page, md } from "/app.js";
import { section, of_section, under_blog } from "./posts.js";
import { Post } from "./Post.js";

/**
 * A section index — `/blog/framework/`, `/blog/systems/`, `/blog/ai/`.
 *
 *     export default new Section({ meta: import.meta });   // the whole file
 *
 * Deliberately thin: the rail beside it already IS the archive, so this page owes
 * the reader one sentence about the section and its posts as cards. What it exists
 * for is the ADDRESS — a post lives at `<section>/<post>/`, so the section is a real
 * ancestor and `Router.mark_links()` can light it `in-path` while you are inside it.
 * Nothing computes that state; the file structure is it.
 *
 * Like `Post`, it looks ITSELF up in the manifest by the directory it was imported
 * from, so the title and blurb have exactly one copy. doc/structure.md.
 */
export class Section extends Page {

	/* ⚠ Both defaults go in FIRST, never as class fields: a field initialises AFTER
	 *   `super()` returns and would overwrite anything a page.js passed. Later args win.
	 * ⚠ `classes` REPLACES the shape word in `Page.render()`, so `standard` is said out
	 *   loud here rather than silently lost. */
	constructor(...args){
		const seed = Object.assign({}, ...args);
		const name = under_blog(seed.meta)[0];

		super({ classes: "standard blog-section" }, section(name) ?? { name }, ...args);
	}

	content(){
		if (this.blurb) md(this.blurb);

		// A post's directory may not exist yet (an entry in the manifest is what
		// commissions one), so this is a list of LINKS built from data — never a walk
		// of children, which would need every post module imported to print a title.
		Post.wall(of_section(this.name));
	}
}

export default Section;
