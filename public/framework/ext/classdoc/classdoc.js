import { code } from "../../core/View/View.js";
import { member, patched, dedent } from "../../util/source/source.js";
import md from "../markdown/md.js";

/**
 * classdoc — a class's methods as pages: the real source, plus prose from a
 * sibling `.md` file.
 *
 *   classdoc(this, View, import.meta, "append attr on click");
 *   this.previews();          // …or this.tabs(). The page picks its own nav.
 *
 * Each name becomes a child page at `<this page's url><name>/`, rendering:
 *
 *   code   member(Class, name)              — the source, signature and all
 *   notes  doc/method/<name>.md             — beside the page.js that called
 *
 * So documenting a method is *writing a file*. No UI, no registration, no
 * build step — which is the whole requirement: the author here is usually an
 * AI, and a plain file is the only interface that needs nothing else present.
 *
 * ── Why the list is hand-typed ───────────────────────────────────────────
 * `Object.getOwnPropertyNames(Class.prototype)` would keep the method list in
 * sync for free, and it is still the wrong call: it cannot know which methods
 * have PROSE, and prose is the whole point. Reflection would document
 * `append_fn` and `prepend_pojo` — private helpers — as reader-facing pages
 * with an error box where the notes should be. The list is authorial, exactly
 * like `children`, and it is a string for the same reason.
 *
 * ── Dependencies ─────────────────────────────────────────────────────────
 * Imports `ext/markdown` HARD, because a classdoc with no markdown has nothing
 * to render — the notes are the feature. Depends on `ext/highlight` SOFTLY
 * (the `code.js ??` below), the same deal `demo()` has: if the site imported
 * highlight the source is highlighted, and if it didn't it is still a code
 * block. An ext may lean on an ext; only CORE may never.
 */
export function classdoc(page, Class, meta, names){

	names.trim().split(/\s+/).forEach(name => {
		const fn = member(Class, name);

		// Loud, because the alternative is a page that silently isn't there.
		// A typo'd name is the likeliest error in this whole feature.
		if (!fn)
			return console.warn(`classdoc: ${Class.name} has no member "${name}" — nothing added`);

		const src = dedent(String(fn));
		const note = patched(fn, name) && `> Replaced at runtime — an ext has patched \`${Class.name}.${name}\`, and what you see below is the replacement. That is what actually runs.`;

		page.add(name, {
			title: name,
			classes: "method",
			content(){
				// Said before the code, because otherwise a reader compares this
				// against the class file and concludes the docs are broken.
				if (note) md(note);

				// code.js when ext/highlight is loaded, plain code otherwise
				(code.js ?? code)(src);

				/* Returned, not called for effect: md.file gives a PROMISE, and
				 * View.append_promise places it into a view that was captured
				 * synchronously. Building it after an await would land it
				 * wherever the captor drifted to — the trap that has cost this
				 * repo the most. */
				return md.file(meta, `doc/method/${name}.md`, { h1: false });
			},
		});
	});

	return page;
}

export default classdoc;
