import { Page, md, code, h2, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Dev",
	label: "Dev server",
	description: "Local-only tooling: live reload.",
	icon: "terminal",

	children: "Socket",

	content(){

		pre(`npm install
node server.js      # http://localhost`);

		md("Save a file, the browser reloads. That is all this tier does — the server watches `public/` and pushes a reload down a WebSocket.");

		this.previews();

		h2("It ships nothing");

		code.js(`socket: Socket.singleton(),   // app.js — unconditional`);

		md("The environment check is **inside the socket**, not at the call site, so a site wires it once and never writes an `if (dev)`. Off localhost nothing connects and `send()`/`request()` no-op. Production is plain static files; nothing here may become a runtime dependency. That is a hard constraint, not a preference — [localhost](/framework/dev/Socket/docs/localhost/) is the argument.");

		h2("Three packages, all dev-only");

		md("`chokidar`, `express`, `ws`. **The short list is the feature** — `server.js` is a static file server with a watcher bolted on, and `public/` is served as-is because that is what production does too. If it needs a build to run locally, it is not this framework.");

		md("Next: [Socket](/framework/dev/Socket/) — the one class in here.");
	}
});
