import { div, p, h3, span, button } from "/app.js";
import { ui } from "./ui.js";

/* One call per exported component. The wall on page.js renders these, and so does
 * /michael/previews/ — so reading this object is the fastest tour of the API
 * there is, and no cell can show something its page doesn't.
 *
 * `field`, `toolbar` and `progress` have no entry: they are documented as
 * copy-paste markup, so there is nothing to call. */
export const renders = {
	table: () => ui.table(["module", "tier", "lines"],
		[["View", "core", "641"], ["Page", "core", "363"], ["Router", "core", "186"]]),

	crumbs: () => ui.crumbs(["Framework", "/framework/"], ["UI", "/framework/ui/"], "Breadcrumbs"),

	pagination: () => ui.pagination(["1", "2", "3", "…", "12"], "2"),

	card: () => ui.card(() => {
		div.c("h4 ui-muted", "Core");
		h3("View");
		p("A DOM element with a chainable API, and one idea: capturing.");
	}),

	stats: () => ui.stats(["npm deps", "3"], ["build steps", "0"], ["core classes", "5"], ["tokens", "16"]),

	badge: () => div.c("flex wrap v-center gap", () => {
		ui.badge("default");
		ui.badge.c("accent", "accent");
		ui.badge.c("outline", "outline");
		ui.badge.c("dot accent", "live");
	}).style("--gap", "0.4em"),

	alert: () => ui.alert.c("accent", "info", () => {
		div.c("h4", "Heads up");
		p("Never build DOM after an `await` — capturing is synchronous.");
	}),

	tags: () => ui.tags("core", "no-build", "esm"),

	panel: () => ui.panel(
		() => div.c("h3", "Delete branch?"),
		() => p("`michael/dev` and its preview deployment go away."),
		() => { button.c("prim", "Delete"); button("Cancel"); }),

	tooltip: () => p(() => {
		span("Capturing is ");
		ui.tooltip("synchronous", "append_fn() restores the captor when your function returns.");
		span(", so a factory call after an await lands somewhere else.");
	}),

	avatar: () => ui.avatars(() => {
		ui.avatar("ML");
		ui.avatar.c("accent", "AK");
		ui.avatar.c("wash", "+4");
	}),

	// A closed dialog renders nothing, so the cell shows what showModal() shows.
	dialog: () => ui.card(() => {
		p.c("h3", "Delete branch?");
		p("This cannot be undone.");
		div.c("flex gap reverse", () => { button.c("prim", "Delete"); button("Cancel"); });
	}),

	menu: () => ui.menu("Actions", "Rename", "Duplicate", "Delete"),

	accordion: () => ui.accordion(["Is there a build step?", "No."], ["How big is it?", "About 25 KB."]),

	timeline: () => ui.timeline(
		["Aug 2026", "The sheet is the default", "A region hands every page the measure."],
		["Jun 2026", "The Pager tier died", "An arrangement is a class a page opts into."]),

	kbd: () => div.c("flex v gap", () => {
		ui.shortcut("Command palette", "Ctrl", "K");
		ui.shortcut("Dismiss", "Esc");
	}),
};

export default renders;
