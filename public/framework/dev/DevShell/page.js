import { Page, md, h2, code, file_link } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "DevShell",
	label: "Dev shell",
	description: "Ctrl + \\ opens a dark shell around the whole site — page tree and route on the left, the dev bar's own tabs on the right.",
	icon: "dark_mode",

	content(){

		md("**Ctrl + \\ now opens this** — a dark `core/Shell` wrapped around the whole window: left the page tree and route, right the dev bar's own tabs (page · layout · ai), a thin header (path, hold, block, edit, width, v1, ✕) and a thin footer (socket, viewport width). Press it again to close — the page underneath is never moved, only pushed in, and closing gives that space straight back.");

		img_shot("/framework/dev/DevShell/shots/1920.png", "The dev shell open on /framework/core/Page/ at 1920px — dark left and right rails around the light page.");

		h2("v1 is one click away");

		md("The old [`dev/DevBar`](/framework/dev/DevBar/) rail still works, untouched — its own tabs are exactly what this shell's right side reuses. Click **v1** in this shell's header to switch to it; click **shell** in the old rail's header to come back. Whichever you last picked is what Ctrl + \\ opens next time (`pref.js`, one `localStorage` flag).");

		code.js(`import devshell from "/framework/dev/DevShell/DevShell.js";

devshell(app);          // app.js — mounted once, beside \`.app\`, like devbar()
devshell.refresh();     // app.js's navigated() — same contract as devbar.refresh()`);

		h2("Three widths, open and closed")

		md("Proof, not a claim: the same page loaded headless, the shell opened and closed, at 400px, 1920px and 3440px — zero console errors at every step.");

		[400, 1920, 3440].forEach(w => {
			img_shot(`/framework/dev/DevShell/shots/${w}-open.png`, `${w}px, shell open`);
			img_shot(`/framework/dev/DevShell/shots/${w}-closed.png`, `${w}px, shell closed — the page is back exactly where it started`);
		});

		md("Files: [DevShell.js](" + file_link("framework/dev/DevShell/DevShell.js") + ") (the mount + toggle) · [DevShell.css](" + file_link("framework/dev/DevShell/DevShell.css") + ") (the little this module styles itself — the grid, the dark theme and the push all come from [core/Shell](/framework/core/Shell/)) · [pref.js](" + file_link("framework/dev/DevShell/pref.js") + ") (the one shared \"which rail does Ctrl + \\\\ open\" flag).");

		md.details(import.meta, "readme.md", "Readme");
	}
});

function img_shot(src, alt){
	md(`![${alt}](${src})`);
}
