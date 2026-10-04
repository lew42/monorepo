import { Doc, md, code, h2, p, a, files } from "/app.js";
import { file_link } from "./file_link.js";
import FsFile from "./FsFile.js";

const EXAMPLE = "framework/ext/filesystem/FsFile.js";

export default new Doc({
	meta: import.meta,
	title: "File system",
	description: "The DATA behind every file on the site: FsFile and Dir — a path, a name, a parent, and the operations to read, write, render and link one. ext/files, next door, is the browsing widget built on these.",
	icon: "folder_open",
	// This page documents two classes (FsFile and FsDir); `subject` names the one the
	// brief calls out by hand for the dark class-card treatment (2026-10-02, framework
	// home). Doc.is_class(subject) only sees a `subject` that's actually set — a page
	// with no `subject:` at all renders as an ordinary light content page, which is what
	// was happening here before this line existed.
	subject: FsFile,

	notes: "decisions",
	files: "FsFile.js Dir.js tree.js file_link.js menu.js filesystem.css",

	content(){
		md("Every real file on this site, as one small object — a **path**, a **name**, a **parent**, and, for a directory, its **children**. This page's own folder, right here, is drawn from one. Right-click any row for **Copy path**, **Open in /fs**, **Open raw**:");

		files(import.meta, "FsFile.js Dir.js tree.js file_link.js menu.js readme.md").ac("wide");

		code.js(`import FsFile from "/framework/ext/filesystem/FsFile.js";\nawait file.read()   // the text on disk\nfile.render()      // the row you see above`);

		h2("Link to a file, and a line");

		md("`file_link(path, line?)` — exported from `ext/filesystem` and from `/app.js` — turns a path into a link that opens `/fs/` with that file already selected:");

		code.js(`import { file_link } from "/app.js";\nfile_link("${EXAMPLE}", 12)`);

		p(() => { a(file_link(EXAMPLE, 12)).href(file_link(EXAMPLE, 12)); });

		md("That's a real link — click it. Selecting the right file is built here; scrolling to and highlighting the line itself is a separate piece, built in [`ext/files`](/framework/ext/files/) (`code.file()`'s line gutter, `mark_lines()`).");

		h2("Two classes: `FsFile` and `Dir`");

		md("`Dir` is the owner's own plain word for a directory — nothing on this site collides with it, so it kept its short name. `FsFile` stays prefixed: `File` is also the browser's own built-in for a picked upload, and shadowing it silently would bite the first feature that needs both in the same file. [Decisions](/framework/ext/filesystem/doc/decisions/) has the full reasoning.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
