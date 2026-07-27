import { Page, p } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Dev",
	description: "Local-only dev tooling (live reload).",
	content(){
		p("Dev-only tooling, active on localhost and inert in production. `Socket` connects to the dev server's WebSocket and reloads the page when a watched file changes (chokidar watches `public/` on the server side).");
		p("None of it ships to production — the client checks the hostname and no-ops off localhost, so the static build stays pure. That's a core constraint: nothing may depend on server-side logic at runtime.");
	}
});
