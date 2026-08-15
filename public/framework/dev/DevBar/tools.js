import { div, a, button, icon } from "../../core/View/View.js";
import Socket from "../Socket/Socket.js";
import { MIN, settings, rail, set } from "./settings.js";
import { section, row, check } from "./parts.js";
import ask from "./ask.js";

// What the rail shows, in order. Each one renders itself into the captor.
export const sections = [viewport, route, ask, server, xray, jump];

// icon, the page width it aims at, what to call it.
const SIZES = [
	["smartphone", 390, "mobile"],
	["tablet", 810, "tablet"],
	["desktop_windows", 1920, "desktop"],
	["tv", 3440, "mega"],
];

const LINKS = [
	["/framework/", "framework"],
	["/framework/ai/", "ai log"],
	["/framework/styles/", "styles"],
	["/framework/ext/LayoutTool/", "layout tool"],
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

/* The window in `em` is the number this site's layouts are actually written in —
   every breakpoint, measure and column token is em off the body clamp. */
function viewport(){
	const px = parseFloat(getComputedStyle(document.body).fontSize);

	section("viewport", () => {
		sizes();
		row("size", `${innerWidth} × ${innerHeight}`);
		row("font", `${px.toFixed(1)}px`);
		row("em", `${(innerWidth / px).toFixed(1)}em`);
	});
}

/* The rail is the only thing between the window and the page, so sizing the PAGE is
   sizing the rail: `innerWidth - target`. A target this window cannot hold has no
   rail width that reaches it — that button says so rather than quietly missing.

   ⚠ Lit off `settings.width`, not off a measurement: `.app` eases its push over
     0.18s, so anything measured right after a click reads mid-transition. */
function sizes(){
	const marks = [];
	const mark = () => marks.forEach(([$size, target]) =>
		$size.rc("on").ac(settings.width === innerWidth - target && "on"));

	div.c("dev-sizes flex gap", () => SIZES.forEach(([name, target, label]) => {
		const width = innerWidth - target;
		const $size = button.c("dev-size", () => icon(name)).attr("aria-label", `${label} — ${target}px`);
		marks.push([$size, target]);

		if (width < MIN){
			$size.attr("title", `${label} ${target} — needs a ${target + MIN}px window`);
			$size.el.disabled = true;
		} else {
			$size.attr("title", `${label} — ${target}px`);
			$size.click(() => { set({ width: rail(width) }); mark(); });
		}
	}));

	mark();
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

function xray(){
	section("x-ray", () => check("outline every box", "dev-outline"));
}

function jump(){
	section("go", () => {
		div.c("dev-links flex wrap", () =>
			LINKS.forEach(([url, text]) => a.c("dev-link", text).href(url)));
	});
}

