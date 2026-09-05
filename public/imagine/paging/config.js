import { div, p, span, a, code, icon, md, drawer, Page } from "/app.js";
import { CONTROLS, means_of } from "./blocks.js";
import { PRESETS, preset_url } from "./presets.js";
import store_for, { name_for } from "./make/made.js";

/* ── THE DRAWER ────────────────────────────────────────────────────────────────

   The hover toolbar has the five words you change while you look at a page. Every
   other thing you might want to do with a configuration lives here, in the site's
   own right rail (`ext/drawer`) — which PUSHES the page rather than covering it, so
   the stage you are configuring is still on screen while you configure it.

     THE FULL FORM      all seven words, each with the sentence that says what it
                        does — the room the hover bar has no space for
     NEST               put any of the twelve presets INSIDE this one, and see it
     THE JSON           the configuration, as the file it would be
     MAKE THIS A PAGE   hands that JSON to Make's own backend, which writes a real
                        directory and a real page.json on disk in dev

   ⚠ NO NEW STORE. "Make this a page" writes through `make/made.js` — the one store
     this realm has, the same one Make and Build write — so a page made here shows
     up in Make's list and nowhere else has to learn about it. doc/persistence.md.

   ⚠ FILL, DON'T HOLD. `ext/drawer` replaces its contents on every call and collects
     the old DOM with them; nothing here subscribes to anything that outlives the
     rail, so there is nothing to unbind (ext/drawer/readme.md).                   */

export function fill_drawer(stage, page){
	return drawer(($slot, $body) => {
		$slot.empty(() => {
			icon("tune");
			span(page?.title ?? "This page");
		});

		$body.empty(() => {
			form(stage);
			nesting(stage);
			json_box(stage, page);
		});
	});
}

/* ── 1 · THE FULL FORM ────────────────────────────────────────────────────────
   The same seven controls the toolbar has, with the sentence each value means. The
   toolbar is for changing; this is for understanding what you just changed. */
function form(stage){
	p.c("h4 muted", "The whole configuration");

	CONTROLS.forEach(control => div.c("paging-drawer-row", () => {
		span.c("paging-pick-label", control.label);

		div.c("paging-drawer-values", () => control.values.forEach(value => {
			const on = stage.config[control.axis] === value.id;

			span.c("paging-chip").ac(on && "on")
				.attr("role", "button").attr("tabindex", "0").attr("aria-pressed", String(on))
				.append(() => span(value.title))
				.click(() => { stage.set(control.axis, value.id); drawer.refresh(); })
				.on("keydown", event => {
					if (event.key !== "Enter" && event.key !== " ") return;
					event.preventDefault();
					stage.set(control.axis, value.id);
					drawer.refresh();
				});
		}));

		md(means_of(control.axis, stage.config[control.axis])).ac("muted paging-means");
	}));
}

/* ── 2 · NEST — a page inside this page ───────────────────────────────────────
   The owner: *"we want to be able to put any one of these page types inside any
   other, whether it's an actual child, or a link to an imported/referenced page."*
   Both are here: **inside** draws the preset's configuration as a second stage in
   this one's box, and **as a link** hands the box the preset's real url. */
function nesting(stage){
	p.c("h4 muted", "Put another page inside this one");

	div.c("paging-drawer-values", () => {
		PRESETS.forEach(preset => {
			const on = stage.nest && stage.nest.id === preset.id;

			span.c("paging-chip").ac(on && "on")
				.attr("role", "button").attr("tabindex", "0").attr("title", preset.one_line)
				.append(() => { icon(preset.icon); span(preset.title); })
				.click(() => nest(stage, on ? null : preset));
		});
	});

	p.c("muted paging-means", stage.nest
		? "The box holds " + stage.nest.title + ", running. Click it again to take it out — or open it at its own url below."
		: "Click one and it runs inside this page's box, with its own navigation and its own colours.");

	if (stage.nest) a.c("page-link", "Open " + stage.nest.title + " on its own →").href(preset_url(stage.nest));
}

// One seam: the nested preset, kept whole (its title is what the drawer reads back).
function nest(stage, preset){
	stage.nest = preset ? { ...preset.config, id: preset.id, title: preset.title } : null;
	stage.redraw();
	drawer.refresh();
}

/* ── 3 · THE JSON, AND THE PAGE IT WOULD BE ───────────────────────────────────
   The configuration is data. This is that data, and the button that turns it into a
   real directory with a real `page.json` in it. */
function json_box(stage, page){
	p.c("h4 muted", "This page, as a file");

	code.js(JSON.stringify(node_for(stage, page), null, "\t"));

	const $said = div.c("paging-said");

	span.c("paging-chip on")
		.attr("role", "button").attr("tabindex", "0")
		.append(() => { icon("save"); span("Make this a page"); })
		.click(() => save(stage, page, $said));

	md("It lands under [Make](/imagine/paging/make/) — one directory and one `page.json`, on disk in dev, in the list beside every other page you have made.").ac("muted paging-means");
}

// What gets written. `mode` is passed through whole by `made.js`, so the whole
// configuration rides safely inside it — the five top-level keys are all that store
// keeps (`FileStore.file()`), and anything outside `mode` would be silently dropped.
function node_for(stage, page){
	const title = (page?.title ?? "New page");

	return {
		title,
		icon: page?.icon ?? "description",
		description: page?.description ?? "A page made from a paging configuration.",
		mode: { ...stage.config },
		children: [],
	};
}

/* ⚠ LOAD, THEN SAVE. `made.js`'s `save(tree, was)` works out the smallest set of
     files to write by comparing the tree it is handed with the tree it had — so the
     current tree has to be read first, or the write would delete every page already
     there. */
async function save(stage, page, $said){
	$said.empty(() => { p.c("muted", "Writing…"); });

	const store = store_for(page ?? { store: () => ({ get: () => ({}), patch(){} }) });
	const tree = await store.load();

	const node = node_for(stage, page);
	node.name = name_for(node.title, tree, Page.slug);

	const ok = await store.save([...tree, node], tree);

	$said.empty(() => {
		if (!ok) return void p.c("muted", "No dev server here, so nothing was written to disk — it is kept in this browser instead.");

		icon("check_circle").ac("paging-said-ok");
		md("**Saved to disk** as `" + node.name + "` — a real directory under `public/imagine/paging/made/`. It is in [Make's list](/imagine/paging/make/) now.");
	});
}

export default fill_drawer;
