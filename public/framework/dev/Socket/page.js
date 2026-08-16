import Socket from "./Socket.js";
import { Doc, md, code, h2 } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Socket",
	description: "One WebSocket to the dev server, and the reload it pushes.",
	icon: "cable",

	subject: Socket,

	properties: "ready disabled connected",

	methods: "singleton initialize connect open reconnect message reload changed eval send request rpc",

	notes: "localhost backoff wire",

	files: "Socket.js page.js readme.md",

	content(){

		code.js(`import Socket from "/framework/dev/Socket/Socket.js";

new App({ socket: Socket.singleton() });`);

		md("Save a file, the browser reloads. That is the whole feature, and that is the whole call site — **no environment check anywhere**, because the guard is inside the socket.");

		h2("The guard is in the class");

		code.js(`if (host === "localhost" || host.endsWith(".localhost")) this.connect();
else { this.disabled = true; this.ready.resolve(); }`);

		md("Off localhost it opens no connection, and every method that would talk returns immediately. So the line above is safe to ship, and a static host gets a static site — the hard constraint this module exists inside. [localhost](/framework/dev/Socket/docs/localhost/) is the long version.");

		h2("The server calls a method on you");

		code.js(`socket.rpc("reload")        // Server/plugins/SocketServer/LiveReload.js
socket.reload()             // …lands here, on your instance`);

		md("A frame is `{ method, args }`, and [`message()`](/framework/dev/Socket/api/message/) looks the method up on `this` — so adding a server command is adding a method. `window.$BLOCKRELOAD` is the escape hatch when you are mid-edit in a form.");

		h2("A save reloads the tabs that loaded the file");

		code.js(`socket.changed(["/framework/core/Page/Page.css", "/app.js"])`);

		md("Each path is checked against what this tab actually fetched. Never loaded it? **Nothing happens.** A `.css` it has as a `<link>`? The `?t=` on that same element is bumped and the sheet re-fetches — no navigation, no lost state. Anything else? One reload for the whole batch. [`changed`](/framework/dev/Socket/api/changed/) has the decision table and the `@layer` trap that makes *same element* load-bearing.");

		md("A `.jsonl` never reaches `changed` at all — appends arrive as `jsonl` frames and [JSONL](/framework/ext/JSONL/) applies them in place. [wire](/framework/dev/Socket/docs/wire/) is the whole protocol, both directions.");

		md("**And that is the whole framework.** Start building — or read [Versus](/framework/versus/), the short argument for why it looks like this, or the [development log](/framework/ai/) on how it got here.");

		md.details(import.meta, "readme.md", "Design record — the singleton, the reconnect storm, and the dead half");
	},
});
