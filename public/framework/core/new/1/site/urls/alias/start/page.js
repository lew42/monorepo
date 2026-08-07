import { Page } from "/app.js";
import { md, visit } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Start",

	content(){
		md(`This page has one url: \`/urls/alias/start/\`.

\`intro\`, \`getting-started\` and \`v1\` all resolve to it, and none of them survives in the address bar. Reload from any of them and you land here, with this title — which is the test that matters, because it is the only way a bookmark, a share and a crawler agree.`);

		visit(["/urls/alias/intro/", "/urls/alias/getting-started/", "/urls/alias/v1/", "/urls/alias/"]);
	},
});
