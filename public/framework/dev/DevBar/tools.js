import { div, a, button } from "../../core/View/View.js";
import Socket from "../Socket/Socket.js";
import { section, row, check } from "./parts.js";
import ask from "./ask.js";
import layout from "./layout.js";
import structure from "./structure.js";
import says from "./says.js";

import page_chat from "./chat.js";
import shots from "./shots.js";

/* What the rail shows, in order, one array per tab. Each section renders itself into
   the captor. ⚠ `layout` is alone on a tab on purpose — it is the one section that
   downloads 45KB and measures the page, and a tab nobody opened does neither.
   ⚠ There is no `viewport` section any more: its four presets and its three number
   rows were the same state as the layout tab's readout, on a different screen and
   in a different unit. Both live in the head now — width.js. */
export const tabs = [
	["page", [says, route, server, xray, instances, structure, jump]],
	["layout", [layout]],
	["ai", [ask]],
	["chat", [page_chat]],
	["screenshots", [shots]],
];

const LINKS = [
	["/framework/", "framework"],
	["/framework/ai/", "ai log"],
	["/framework/styles/", "styles"],
	["/framework/ext/DesignTool/", "layout tool"],
	["/web/", "web"],
];

/* ⚠ The ACTIVE PAGE's url, not `location.pathname` — `Router.go()` loads first and
   pushes history second, so during `navigated()` the address bar is one hop behind. */
function route(app){
	const page = app?.router?.active;
	const parts = (page?.url ?? location.pathname).split("/").filter(Boolean);

	section("route", () => {
		div.c("dev-crumbs flex wrap", () => {
			a.c("dev-crumb", "/").href("/");
			parts.forEach((name, i) =>
				a.c("dev-crumb", name).href("/" + parts.slice(0, i + 1).join("/") + "/"));
		});

		row("page", page?.title ?? "—");
	});
}

function server(){
	const socket = Socket.singleton();

	const [state, cls] = socket.disabled ? ["off — not localhost", "off"]
		: socket.connected ? ["connected", "ok"]
		: ["connecting…", "warn"];

	section("dev server", () => {
		// The one value here that settles on its own: the rail is built during
		// App.render(), a moment before the WebSocket opens.
		const $socket = row("socket", state, cls);
		if (!socket.disabled) socket.ready.then(() => $socket.rc("warn").ac("ok").text("connected"));

		row("host", location.host);
	});
}

/* Toggle: the live instance tree (ux/Content/Object/InstanceTree.js). Off by default, so nothing loads. */
let tree_on = false;
function instances(app){
	section("instances", () => {
		button.c("dev-link", tree_on ? "hide live tree" : "show live tree").click(() => { tree_on = !tree_on; devbar_refresh(); });
		if (!tree_on) return;
		const $box = div.c("dev-tree");
		import("../../ux/Content/Object/InstanceTree.js").then(m => $box.append(() => new m.default({ app })));
	});
}

function devbar_refresh(){ import("./DevBar.js").then(m => m.default.refresh()); }

function xray(){
	section("x-ray", () => check("outline every box", "dev-outline"));
}

function jump(){
	section("go", () => {
		div.c("dev-links flex wrap", () =>
			LINKS.forEach(([url, text]) => a.c("dev-link", text).href(url)));
	});
}

