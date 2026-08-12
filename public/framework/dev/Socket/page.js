import Socket from "./Socket.js";
import { classdoc, md, code, h2 } from "/app.js";

export default classdoc.page({
	meta: import.meta,
	title: "Socket",
	description: "One WebSocket to the dev server, and the reload it pushes.",
	icon: "cable",

	Class: Socket,

	properties: "ready disabled connected",

	methods: "singleton initialize connect open reconnect message reload send request rpc",

	notes: "localhost backoff wire",

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

		md("A frame is `{ method, args }`, and [`message()`](/framework/dev/Socket/api/message/) looks the method up on `this`. `reload()` is the only one the shipped server ever sends — and `window.$BLOCKRELOAD` is the escape hatch when you are mid-edit in a form.");

		md("The other direction — `send`, `request`, `rpc`, and the `ls`/`rm`/`write` wrappers over them — is **wired but unused**: `server.js:6` has the plugin that answers them commented out. [wire](/framework/dev/Socket/docs/wire/) has the frame format and the honest accounting.");

		md("**And that is the whole framework.** Start building — or read [Versus](/framework/versus/), the short argument for why it looks like this, or the [session log](/framework/ai/) on how it got here.");

		md.details(import.meta, "readme.md", "Design record — the singleton, the reconnect storm, and the dead half");
	},
});
