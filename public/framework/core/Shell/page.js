import { Doc, demo, h2, md, div, p, toc } from "/app.js";
import { Shell } from "/framework/core/Shell/Shell.js";

/* One line of filler content for a region — every demo below uses the same
 * little box, so the only thing that changes from demo to demo is which
 * regions exist, never what they look like. */
function fill(label){
	return () => p.c("muted", label);
}

export default new Doc({
	meta: import.meta,
	title: "Shell",
	description: "Five optional regions around a CSS grid — header, left, right, footer, main. Wrap any page in one; put a Shell inside a Shell's main and they nest.",
	icon: "dashboard_customize",

	subject: Shell,

	properties: "content frame dark name",

	methods: "render header footer left right main slot grab size restore_sizes store apply_dark watch_frame",

	notes: "decisions",

	files: "Shell.js Shell.css page.js readme.md",

	content(){

		toc();

		md("**Five regions, all optional: header, left, right, footer, main.** Leave one out and there is no empty box where it would have been — the grid just gives the rest of the room to whatever you did pass. Every region is either a plain function (written exactly like a page's own `content()`) or a View.");

		h2("One region");

		demo(() => {
			new Shell({ left: fill("left") }).style({ height: "12rem" });
		}, "`left` alone. Nothing else exists — no header, no footer, no main box — so `left` is the only thing on the grid.");

		demo(() => {
			new Shell({ right: fill("right") }).style({ height: "12rem" });
		}, "`right` alone, same rule, the other side.");

		h2("Left and right together");

		demo(() => {
			new Shell({ left: fill("left"), main: fill("main"), right: fill("right") }).style({ height: "14rem" });
		}, "`left`, `main` and `right` — **drag either inner edge**, 12rem to half the room, double-click to reset. This is `new Shell({ left, main, right })`, nothing more.");

		h2("A thin header and footer");

		demo(() => {
			new Shell({
				header: fill("header — about 2rem, a path or toolbar buttons"),
				main: fill("main"),
				footer: fill("footer — about 2rem, a status line"),
			}).style({ height: "12rem" });
		}, "`header` and `footer` are ONE thin line each, never a whole band — a path, properties, a couple of buttons.");

		h2("All five at once");

		demo(() => {
			new Shell({
				header: fill("header"),
				left: fill("left"),
				main: fill("main"),
				right: fill("right"),
				footer: fill("footer"),
			}).style({ height: "16rem" });
		}, "Every region, together — this is the whole shape `dev/DevShell` (Ctrl + \\\\) builds on: a dark `frame` Shell around the window, its `left` the page tree, its `right` the dev bar's own tabs.");

		h2("Dark");

		demo(() => {
			new Shell({
				left: fill("dark"),
				main: fill("light"),
				right: fill("dark"),
				dark: ["left", "right"],
			}).style({ height: "12rem" });
		}, "`dark: [\"left\", \"right\"]` — only those two regions flip; `main` keeps the page's own light/dark setting. `dark: true` (not shown separately — it's the same one line on the whole shell instead of two boxes) darkens everything. Nothing here ever names a colour: `color-scheme: dark` is the whole trick, the same one line `dev/DevBar`'s own dark rail already uses.");

		h2("Nested — a Shell inside a Shell's main");

		demo(() => {
			new Shell({
				left: fill("outer left"),
				main: new Shell({
					header: fill("inner header"),
					main: fill("inner main"),
				}),
			}).style({ height: "14rem" });
		}, "`main` took a real `new Shell({ … })` instead of a function — `Shell.js` never had to know about nesting specially, because a Shell is a View like any other and `main` already accepts one.");

		h2("`frame` — the whole window");

		demo(() => {
			div.c("card", () => {
				p.c("muted", "Shown at a fixed size here so it doesn't cover this page — a real `frame: true` shell is `position: fixed; inset: 0` around the whole browser window.");

				div.c("", $box => {
					$box.style({ position: "relative", height: "10rem", overflow: "hidden", border: "1px solid var(--line)" });

					const shell = new Shell({
						header: fill("header — path, hold, block, width"),
						left: fill("left"),
						right: fill("right"),
						footer: fill("footer"),
						frame: true,
					});

					// A real `frame` shell is `position: fixed`, which would break out
					// of this little preview box — pinned to THIS box instead, just for
					// the demo, so the idea reads without covering the page.
					shell.style({ position: "absolute" });
				});
			});
		}, "`frame: true` also writes each region's own size onto `<html>` as four tokens — `--shell-top`, `--shell-left`, `--shell-right`, `--shell-bottom` — so a real page underneath can pad itself in by them, exactly how `--devbar` already docks the dev rail today. `main` is always an empty, click-through hole in `frame` mode: the real page is what shows through it, never something drawn on top.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
