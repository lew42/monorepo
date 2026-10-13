import { View, div, a, el, input, label } from "/app.js";

View.stylesheet(import.meta, "kit.css");

// Shell + crumbs/nav/steps. History and design: doc/kit-notes.md
export function chrome(config = {}){
	return {
		render(){ build(this, config); },
		navigated(page){ update(this, page); },
	};
}

// Declared label or name. Second copy (site/chrome/chrome.js); pending Page.child_label(). See doc/kit-notes.md.
export function child_label(parent, name){
	return parent.labels?.[name] ?? name.replace(/[-_]/g, " ").replace(/^./, c => c.toUpperCase());
}

// ID is GLOBAL: <label for> reaches any checkbox. Two shells = one burger drives both unless numbered. Measured /kit/.
let shells = 0;

export function shell(app, config = {}){
	const n = ++shells;
	const drawer_id = "kit-drawer-" + n;
	const content_id = "kit-content-" + n;

	app.kit_home = config.home;

	return app.$kit_app = div.c("kit-app", () => {

		a.c("kit-skip", config.skip ?? "Skip to content").href("#" + content_id);

		app.$kit_toggle = input().attr("type", "checkbox").attr("id", drawer_id).ac("kit-toggle");

		app.$kit_nav = el.c("nav", "kit-nav", () => {
			a.c("kit-brand", config.brand ?? app.root?.title ?? "").href("/");
			app.$kit_links = div.c("kit-links");
		}).attr("aria-label", "Sections");

		label.c("kit-scrim").attr("for", drawer_id);

		div.c("kit-main", () => {
			div.c("kit-bar", () => {
				label.c("kit-burger", "☰").attr("for", drawer_id);
				app.$kit_crumbs = el.c("nav", "kit-crumbs").attr("aria-label", "Breadcrumb");
			});

			// Fragment link moves sequential start, not focus. tabindex="-1" required or skip link is decoration.
			app.$pages = el.c("main", "pages kit-pages")
				.attr("id", content_id).attr("tabindex", "-1");

			app.$kit_steps = el.c("nav", "kit-steps").attr("aria-label", "Section");
		});

		// role="status" → aria-live="polite". Must exist before it speaks; page cannot do this for itself.
		app.$kit_announcer = div.c("kit-announcer").attr("role", "status");
	});
}

function build(app, config){
	app.$body = View.body();
	app.$app = shell(app, config).ac("kit-document");
	View.set_captor(app.$pages);
}

// Four steps, order is load-bearing. Wrong order leaves focus on <body> silently. See doc/kit-notes.md.
function update(app, page){
	nav(app, page);
	crumbs(app, page);
	steps(app, page);

	app.router?.mark_links();

	if (app.$kit_toggle) app.$kit_toggle.el.checked = false;

	focus(app, page);
}

function nav(app, page){
	if (!app.$kit_links.el.children.length)
		app.$kit_links.append(() => app.root.children.forEach((_, name) =>
			a.c("kit-link", child_label(app.root, name)).href(app.root.url + name + "/")));

	const section = page.chain()[1];
	if (section === app.kit_section) return;

	app.kit_section = section;
	app.$kit_sub?.remove();
	app.$kit_sub = null;

	const anchor = section && app.$kit_links.el.querySelector(`a[href="${section.url}"]`);
	if (!anchor) return;

	app.$kit_sub = div.c("kit-sub", () => section.children.forEach((_, name) =>
		a.c("kit-link kit-sub-link", child_label(section, name)).href(section.url + name + "/")));

	anchor.after(app.$kit_sub.el);
}

function crumbs(app, page){
	const chain = page.chain();

	app.$kit_crumbs.empty(() => chain.forEach((pg, i) =>
		a.c("kit-crumb", i ? pg.title : app.kit_home ?? pg.title).href(pg.url)));
}

function steps(app, page){
	app.$kit_steps.empty(() => {
		const parent = page.parent;
		if (!parent) return;

		const names = [...parent.children.keys()];
		const at = names.indexOf(page.name);
		const step = (i, dir) => names[i] &&
			a.c("kit-step " + dir, child_label(parent, names[i])).href(parent.url + names[i] + "/");

		div.c("kit-step-slot", () => { step(at - 1, "prev") || up(parent); });
		div.c("kit-step-slot", () => { step(at + 1, "next"); });
	});
}

function up(parent){ return a.c("kit-step up", "↑ " + parent.title).href(parent.url); }

// Three attributes should be set by Page.render(), not here. When that lands, delete setAttribute lines, keep focus().
function focus(app, page){
	app.kit_navigations = (app.kit_navigations ?? 0) + 1;

	if (app.kit_navigations === 1) return;

	const view = page.view?.el;

	if (view && app.$pages.el.contains(view)){
		if (!view.hasAttribute("tabindex")){
			view.setAttribute("tabindex", "-1");
			view.setAttribute("role", "region");
			view.setAttribute("aria-label", page.title ?? page.name ?? "");
		}
		return view.focus();
	}

	app.$pages.el.focus();
	announce(app, page.title);
}

export function announce(app, text){ app.$kit_announcer?.text(text ?? ""); }

export { build, update, nav, crumbs, steps, focus };
