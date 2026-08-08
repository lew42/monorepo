import { Page, h2, md, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Utilities",
	description: "Small, dependency-free helpers, plus the dev-only live reload socket.",

	content(){
		code.js(`import { is } from "/app.js";`).ac("mb");
		md("**Two callers that must agree**, that's the rule for earning a place here. A helper with one caller belongs in that caller; a helper with two belongs here, because the alternative isn't two copies, it's two copies that drift.").ac("mb");

		h2("is").ac("mb");
		md("Type checks: `View.append()` dispatches on argument type, and so does `prepend()`, both need one answer to \"is this a view, a function, a promise?\"").ac("mb");

		h2("source").ac("mb");
		md("`demo(fn)` renders a function's source, and `code.fn(fn)` renders it too, both need to agree on where a function body starts.").ac("mb");

		h2("markup").ac("mb");
		md("`demo()`'s html pane and any element reference both want \"show me this DOM as source\".").ac("mb");

		h2("dev/Socket").ac("mb");
		code.js(`if (host === "localhost" || host.endsWith(".localhost"))
    this.socket = Socket.singleton();`).ac("mb");
		md("Local-only tooling: save a file, the browser reloads. The dev server watches `public/` and pushes a reload over a WebSocket. The client checks the hostname and no-ops anywhere else, production is plain static files, this can never become a runtime dependency.").ac("mb");

		md("Next: [Style](/edric/getStarted/style/), framework.css, grouped the way a style guide usually is.");
	}
});