import { Page, div, p, a, img } from "/app.js";
import { Wizard } from "/framework/ux/Wizard/Wizard.js";

/* THE FILE SYSTEM, 2026-09-29 — press Next. One picture of the real thing per step, one
   sentence under it, a link to the live page. The step is in the address (#3), so a
   reload or Back lands on the same step. Same shape as ai/2026-09-28/file-explorer-fs/walkthrough/. */
const shot = name => new URL("shots/" + name, import.meta.url).href;

const STEPS = [
	{ title: "Files beside the site nav", pic: "1-explorer-1920.png", open: "/framework/ext/filesystem/fs/FsFile.js/#L30",
		say: "Add /fs/ to any page's address. The site's nav stays on the left; the file tree and the code fill the rest of the screen." },
	{ title: "Link to a line", pic: "1-explorer-1920.png", open: "/framework/ext/filesystem/fs/FsFile.js/#L30",
		say: "End the link with #L30 and the code scrolls to line 30 and highlights it (#L40-L44 marks a range). Click a line number to get that link." },
	{ title: "More than one code column", pic: "2-columns-3440.png", open: "/framework/ext/filesystem/fs/FsFile.js/",
		say: "Hover a file in the tree and press its + button: it opens beside the one you're reading. On a wide screen three fit." },
	{ title: "On a phone: the code, full width", pic: "3-phone-400.png", open: "/framework/ext/filesystem/fs/FsFile.js/#L30",
		say: "On a narrow screen the code takes the whole width, under a sticky bar with the file's name." },
	{ title: "Tap the name to switch files", pic: "4-phone-dropdown-400.png", open: "/framework/ext/filesystem/fs/FsFile.js/",
		say: "Tapping the name opens the tree; pick another file and it opens. Every file has its own address, so Back works." },
	{ title: "The objects underneath", pic: "5-filesystem-1920.png", open: "/framework/ext/filesystem/",
		say: "A new module, File system: every file is an FsFile and every folder an FsDir. file_link(path, line) makes the links above. Right-click a file for Copy path, Open in /fs, Open raw." },
	{ title: "System pages link their files", pic: "6-servex-source-1920.png", open: "/framework/servex/",
		say: "Servex, Page, AI 2 and the dev server now link their own files. Servex's own code, outside the site, opens under Source (on the dev server only)." },
	{ title: "The floating Folder link is gone", pic: "7-no-folder-link-400.png", open: "/framework/ext/files/",
		say: "The small, unclear \"Folder\" link at the top of every page is removed. A Files item in the drawer takes its place (the mobile-nav task is adding it)." },
	{ title: "The old view is one click away", pic: "8-classic-1920.png", open: "/framework/ext/files/fs/?v=1",
		say: "The previous full-screen explorer still works: the ↶ button in the code toolbar, or ?v=1 on any /fs/ address." },
];

const from_hash = () => Math.max(0, Math.min(STEPS.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));

export default new Page({
	meta: import.meta,
	title: "The file system",
	description: "A walkthrough of the file system: File and Directory objects, /fs beside the site nav, links to a file and a line, the phone view.",
	icon: "slideshow",

	content(){
		const w = new Wizard({
			index: from_hash(),
			steps: STEPS.map(s => ({ title: s.title, content(){
				div.c("flow", () => {
					p().style({ fontSize: "1.25em", maxWidth: "40em" }).text(s.say);
					img().style({ border: "1px solid var(--line)", borderRadius: "0.4em", maxHeight: "68vh", maxWidth: "100%", width: "auto" }).attr("src", shot(s.pic)).attr("alt", s.title);
					a.c("page-link").href(s.open).text("Open it live →");
				});
			} })),
			done(){ this.go(0); },
		});
		// The step is part of the address: Next and Back write it, a reload reads it.
		const go = w.go.bind(w);
		w.go = i => { const r = go(i); history.replaceState(null, "", "#" + (w.index + 1)); return r; };
		w.ac("wide");
		w.$body.el.classList.remove("measure");
	},
});
