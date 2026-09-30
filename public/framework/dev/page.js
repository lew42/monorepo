import { Page, md, code, h2, pre, file_link } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Dev",
	label: "Dev server",
	description: "Local-only tooling: live reload.",
	icon: "terminal",

	children: "Socket DevBar DevShell Claim",

	content(){

		// Line first, then the two commands that produce it.
		md("Save a file, the browser reloads. That is all this tier does — the server watches `public/` and pushes a reload down a WebSocket.");

		md(`Files: [page.js](${file_link("framework/dev/page.js")}) · [Socket.js](${file_link("framework/dev/Socket/Socket.js")}) · [DevBar.js](${file_link("framework/dev/DevBar/DevBar.js")}) · [claim.js](${file_link("framework/dev/Claim/claim.js")})`);

		pre(`npm install
node server.js      # http://localhost`);

		this.previews();

		h2("It ships nothing");

		code.js(`socket: Socket.singleton(),   // app.js — unconditional`);

		md("The environment check is **inside the socket**, not at the call site, so a site wires it once and never writes an `if (dev)`. Off localhost nothing connects and `send()`/`request()` no-op. Production is plain static files; nothing here may become a runtime dependency. That is a hard constraint, not a preference — [localhost](/framework/dev/Socket/doc/localhost/) is the argument.");

		h2("Three packages, all dev-only");

		md("`chokidar`, `express`, `ws`. **The short list is the feature** — `server.js` is a static file server with a watcher bolted on, and `public/` is served as-is because that is what production does too. If it needs a build to run locally, it is not this framework.");

		md("Next: [Socket](/framework/dev/Socket/), the class that reloads you — or [DevBar](/framework/dev/DevBar/), the rail `Ctrl + \\\\` opens on every page. [Claim](/framework/dev/Claim/) is the third: a ring an agent draws around a tab it is driving.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
