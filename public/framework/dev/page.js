import { Page, md, h2, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Dev",
	description: "Local-only tooling: live reload.",
	col: "narrow",
	content(){

		pre(`npm install
node server.js      # http://localhost`);

		md("Save a file, the browser reloads. That's all this tier does — the server watches `public/` and pushes a reload over a WebSocket.");

		h2("It ships nothing");

		pre(`if (host === "localhost" || host.endsWith(".localhost"))
    this.socket = Socket.singleton();`);

		md("The client checks the hostname and no-ops anywhere else. Production is plain static files; nothing here may become a runtime dependency. That's a hard constraint, not a preference.");

		md("That is the whole framework. If you skipped it, [Versus](/framework/versus/) is the short argument for why it looks like this.");
	}
});
