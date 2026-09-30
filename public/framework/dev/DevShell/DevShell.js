import View, { div, span, button, label, input } from "../../core/View/View.js";
import { CoreShell as Shell } from "../../core/Shell/Shell.js";
import Socket from "../Socket/Socket.js";
import { edit, set_edit } from "../../ext/Ask/edit.js";
import pathbar from "../DevBar/pathbar.js";
import width from "../DevBar/width.js";
import hold from "../DevBar/hold.js";
import blocked from "../DevBar/blocked.js";
import { tabs } from "../DevBar/tools.js";
import devbar from "../DevBar/DevBar.js";
import { use_v1, set_v1 } from "./pref.js";

View.stylesheet(import.meta, "DevShell.css");

/* The dark dev shell — Ctrl + \, a `core/Shell` wrapped around the whole window
 * (`frame: true`, `dark: true`): left the page tree, right the dev bar's own
 * tabs, a thin header and footer. It does not replace `dev/DevBar` — that rail
 * still works untouched, one click away behind the "v1" button — it is the
 * shell `pref.js` picks by default. Design record: readme.md, doc/decisions.md.
 *
 * ⚠ Built like `DevBar.js`: mounted ONCE, on `<body>`, and toggled by a class
 *   on `<html>` (`dev-shell-open`) rather than being constructed and torn down
 *   every open — `CoreShell`'s own `frame` mode already zeroes every
 *   `--shell-*` token when its regions have no size, and `display: none`
 *   (DevShell.css) IS zero size, so closing the shell and closing the gap it
 *   pushed in `.app` are the same one class, no extra code either place. */
let app, $tree, $tabs, $body, $foot;
let tab_name = "page";

export default function devshell(a){
	app = a;

	const shell = new Shell({
		name: "devshell",
		// ⚠ NOT `dark: true` — in `frame` mode the whole shell is the outer
		// `position: fixed; inset: 0` box, and `dark: true` paints THAT
		// element's own background, which sits behind `main`'s transparent
		// hole and would black out the live page it is supposed to show
		// through (doc/decisions.md). Naming the four chrome regions darkens
		// only them; `main` is never in this list, so it is never dark.
		dark: ["head", "left", "right", "foot"],
		frame: true,

		header(){ head(); },
		left(){ $tree = div.c("dev-shell-tree flex v"); },
		right(){ right(); },
		footer(){ $foot = div.c("dev-shell-foot flex v-center gap"); },
	});

	shell.ac("dev-shell-root");

	// ⚠ Dev chrome, not the page — same reason `DevBar.js` marks its own rail
	// this way: `ext/DesignTool`'s probe skips anything so marked.
	shell.el.setAttribute("data-layout-ignore", "");

	app.styles_loaded().then(() => shell.append_to(View.body()));

	document.addEventListener("keydown", e => {
		if (!(e.ctrlKey || e.metaKey) || (e.key !== "\\" && e.code !== "Backslash")) return;
		// `dev/DevBar` owns this same shortcut when the "v1" choice is on —
		// exactly one of the two listens at a time, never both.
		if (use_v1()) return;
		e.preventDefault();
		toggle();
	});

	// The old rail's "shell" button (DevBar.js) asks for this one to open —
	// an event, not a direct call, so neither file has to import the other's
	// module just for this one direction (pref.js is the only shared import).
	window.addEventListener("dev-open-shell", () => toggle(true));

	window.addEventListener("resize", devshell.refresh);

	devshell.refresh();
	return shell;
}

function head(){
	div.c("dev-shell-head-line flex v-center", () => {
		pathbar(app);
		span.c("dev-shell-hint", "ctrl + \\");
		blocked();
		hold();
		edit_knob();

		button.c("dev-shell-v1", "v1")
			.attr("title", "Switch to the old dev bar (Ctrl + \\ opens that one instead until you switch back)")
			.click(() => { set_v1(true); toggle(false); devbar.toggle(true); });

		button.c("dev-shell-x", "✕")
			.attr("title", "Close (Ctrl + \\)")
			.attr("aria-label", "Close the dev shell")
			.click(() => toggle(false));
	});

	width(app);
}

// The one switch every editor control on the site reads (ext/Ask/edit.js) —
// the same four lines `DevBar.js` writes inline; not imported from there
// because it is not a function DevBar.js exports, only markup inside its own
// closure. Reloads on flip, same as the old rail's knob, for the same reason:
// every control decides whether to render at construction time, not live.
function edit_knob(){
	label.c("dev-shell-knob", () => {
		const $box = input().attr("type", "checkbox")
			.on("change", function(){ set_edit(this.el.checked); location.reload(); });

		if (edit()) $box.attr("checked", true);
		span("edit");
	}).attr("title", "Edit mode — on shows drag/drop, verdicts, Make's writes and every other editor control; off previews production");
}

// The right side IS `dev/DevBar`'s own tab system, reused by import — the
// section functions (`says`, `route`, `server`, `structure`, `layout`, `ask`…)
// live in `tools.js` and its siblings; nothing here copies one.
function right(){
	div.c("dev-shell-tabs-wrap flex v", () => {
		$tabs = div.c("dev-shell-tabs flex");
		$body = div.c("dev-shell-body flex v");
	});
}

function footer_line(){
	if (!$foot) return;

	const socket = Socket.singleton();
	const [state, cls] = socket.disabled ? ["off — not localhost", "off"]
		: socket.connected ? ["socket ok", "ok"]
		: ["connecting…", "warn"];

	$foot.empty(() => {
		span.c("dev-shell-val " + cls, state);
		span.c("dev-shell-val", `${innerWidth}px`);
	});
}

/* Everything the shell shows reads the world at render time, so a navigation
 * or a resize makes it a lie — the same contract `devbar.refresh` keeps, and
 * `app.js`'s `navigated()` calls this one right alongside it. Only while the
 * shell is open: closed, there is nothing on screen to go stale. */
devshell.refresh = function(){
	if (!open()) return;

	$tree?.empty(() => {
		// The brief's own two things — "the page tree / route and the
		// `structure` section" — picked OUT of the `page` tab's section
		// list by each function's own `.name` (never by array position,
		// which would silently point at the wrong section the day
		// `tools.js`'s own array is reordered): `route` draws the
		// breadcrumbs + page title, `structure` the nested `.page` tree.
		// The rest of that tab (the mastermind log, the socket line, the
		// x-ray checkbox, the jump links) stays on the right, under its
		// own "page" tab, not duplicated here.
		const page_sections = tabs.find(([n]) => n === "page")?.[1] ?? [];
		const wanted = ["route", "structure"];
		wanted.forEach(name => page_sections.find(fn => fn.name === name)?.(app));
	});

	$tabs?.empty(() => tabs.forEach(([n]) =>
		button.c("dev-shell-tab", n).ac(n === tab_name && "on").click(() => tab(n))));

	$body?.empty(() => {
		const shown = tabs.find(([n]) => n === tab_name)?.[1] ?? tabs[0][1];
		shown.forEach(section => section(app));
	});

	footer_line();
};

function tab(name){
	tab_name = name;
	devshell.refresh();
}

const html = document.documentElement;

const open = () => html.classList.contains("dev-shell-open");

function toggle(on = !open()){
	html.classList.toggle("dev-shell-open", on);
	if (on) devbar.toggle(false);
	devshell.refresh();
}

devshell.toggle = toggle;

export { devshell };
