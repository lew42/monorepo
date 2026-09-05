import { div, p, span, a, code, input, icon, md, drawer, Page } from "/app.js";
import { CONTROLS, means_of } from "./blocks.js";
import { PRESETS, preset_url } from "./presets.js";
import { link_for, nest_of } from "./url.js";
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

/* `focus` names the one thing the caller came for. Today there is one: `"code"`, the
   bar's **Code** button — which promises the `page.js` and used to open this rail at
   the top with that box below the fold, byte-identical to what **More** opened
   (paging-audit-3, item 4). So Code puts the code box FIRST and More leaves it last:
   two buttons, two drawers, each one delivering what its label says.

   ⚠ IT REORDERS RATHER THAN SCROLLING. Scrolling to the box was tried first and it
     races: `code.js()` highlights asynchronously, so the JSON block above grows AFTER
     the scroll and pushes the code back off the bottom (measured: the box landed 765px
     down a 800px rail). Order is not a race. */
export function fill_drawer(stage, page, focus){
	return drawer(($slot, $body) => {
		$slot.empty(() => {
			icon("tune");
			span(page?.title ?? "This page");
		});

		$body.empty(() => {
			link_box(stage);
			if (focus === "code") code_box(stage, page);

			form(stage);
			nesting(stage);
			json_box(stage, page);

			if (focus !== "code") code_box(stage, page);
		});
	});
}

/* ── 0 · THE LINK TO THIS EXACT PAGE ──────────────────────────────────────────
   Every word you change is written into the address (`url.js`), so this box is just
   showing you the address — but showing it is the whole point: until 2026-09-05 the
   realm could reach about 100,800 configurations by clicking and send 43 of them,
   because nothing ever appeared in the url. Copy this and the page travels.

   ⚠ The field is `readonly`, not disabled: a disabled input cannot be selected, and
     "select it and press ctrl-C" is the fallback for every browser that refuses
     `navigator.clipboard` outside a secure context (which localhost is not always). */
function link_box(stage){
	p.c("h4 muted", "The link to this page");

	const url = link_for(stage.config, stage.base, stage.nest, stage.base_nest);

	let $said;

	const $field = input().ac("paging-link-field").attr("type", "text").attr("readonly", "readonly");
	$field.el.value = url;

	div.c("paging-said", () => {
		span.c("paging-chip on")
			.attr("role", "button").attr("tabindex", "0")
			.append(() => { icon("link"); span("Copy this link"); })
			.click(async () => {
				try { await navigator.clipboard.writeText(url); $said.empty(() => { icon("check_circle"); span("copied"); }); }
				catch { $field.el.select(); $said.empty(() => span("select it and press ctrl-C")); }
			});

		$said = span.c("paging-said-ok");
	});

	return md("Open it cold, in any browser, and you get exactly this page.").ac("muted paging-means");
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
		? "The box holds " + stage.nest.title + ", running. Click it again to take it out."
		: "Click one and it runs inside this page's box, with its own navigation and its own colours.");

	// A preset's own page has a url; a page you made has one too, and it is the field.
	if (stage.nest?.id && !stage.nest.url) a.c("page-link", "Open " + stage.nest.title + " on its own →").href(preset_url(stage.nest));
	if (stage.nest?.url) a.c("page-link", "Open " + stage.nest.title + " on its own →").href(stage.nest.url);

	any_page(stage);
}

/* ── ANY PAGE, NOT ONE OF TWELVE ──────────────────────────────────────────────
   The owner's sentence is *"put any one of these page types inside any other"*, and
   until now `?nest=` took a preset id — so the twelve ready-made pages were the only
   things that could go inside a page and the page you had just MADE could not
   (paging-audit-4). It takes a url now, and this is where you type one. */
function any_page(stage){
	p.c("muted paging-means", "…or the address of any page you have made:");

	const $url = input().ac("paging-link-field paging-nest-field").attr("type", "text")
		.attr("placeholder", "/imagine/paging/make/notes/");

	$url.el.value = stage.nest?.url ?? "";

	const put = () => {
		const url = ($url.el.value || "").trim();
		nest(stage, url ? nest_of(url) : null);
	};

	$url.on("keydown", event => { if (event.key === "Enter"){ event.preventDefault(); put(); } });

	div.c("paging-said", () => {
		span.c("paging-chip on")
			.attr("role", "button").attr("tabindex", "0")
			.append(() => { icon("layers"); span("Put it inside"); })
			.click(put);

		a.c("page-link", "the pages you have made →").href("/imagine/paging/make/");
	});
}

// One seam, and it is the stage's: `nest_to()` redraws AND writes `?nest=` into the
// address, so a page inside a page is a link like every other configuration.
function nest(stage, preset){
	stage.nest_to(preset);
	drawer.refresh();
}

/* ── 3 · THE JSON, AND THE PAGE IT WOULD BE ───────────────────────────────────
   The configuration is data. This is that data, and the button that turns it into a
   real directory with a real `page.json` in it.

   ⚠ YOU NAME THE PAGE. Until now this took the title, icon and description of the
     page you happened to be STANDING ON — so making a page from the hub gave you a
     second page called "Paging", described as the realm's own front page, and the
     line that said it had worked linked Make's list rather than the thing you had
     just made (paging-audit-4). A new page is a new page: it gets a name you type,
     a slug derived from it, and a link to its own url. */
function json_box(stage, page){
	p.c("h4 muted", "This page, as a file");

	const $box = div.c("paging-code-box");
	const draw = () => $box.empty(() => { code.js(JSON.stringify(node_for(stage), null, "\t")); });

	name_field(stage, draw);
	draw();

	const $said = div.c("paging-said");

	span.c("paging-chip on")
		.attr("role", "button").attr("tabindex", "0")
		.append(() => { icon("save"); span("Make this a page"); })
		.click(() => save(stage, page, $said));

	md("It lands under [Make](/imagine/paging/make/) — one directory and one `page.json`, on disk in dev, in the list beside every other page you have made.").ac("muted paging-means");
}

/* THE NAME. Held on the STAGE, not in this function: `ext/drawer` refills the whole
   rail on `drawer.refresh()` (every chip press), so a name kept in a local would be
   gone the first time you changed a word after typing it. */
function name_field(stage, draw){
	return div.c("paging-drawer-row", () => {
		span.c("paging-pick-label", "the new page's name");

		const $name = input().ac("paging-link-field paging-name-field").attr("type", "text")
			.attr("placeholder", "A name — “Docs browser”");

		$name.el.value = stage.new_title ?? "";

		// ⚠ Redraws the JSON box only — never the drawer. `drawer.refresh()` here would
		//   delete the input the cursor is in on every keystroke.
		$name.on("input", () => { stage.new_title = $name.el.value; draw(); });

		stage.$new_title = $name;
	});
}

/* ── 4 · THE PAGE.JS THIS WOULD BE ────────────────────────────────────────────
   The seven words as a real, runnable file. `page.json` is the version a machine
   writes; this is the version a hand writes, and it is the way OUT of the realm —
   copy it into a directory of your own and the configuration is now code you can
   change in ways no control offers. (Build has said this for its own nodes since it
   shipped; the stage had no way out at all until now.) */
function code_box(stage, page){
	p.c("h4 muted", "The same page, as code");

	div.c("paging-code-box", () => { code.js(code_for_config(stage.config, page)); });

	return md("One directory, one `page.js`. Every word above is an argument.").ac("muted paging-means");
}

/* ⚠ `code_for_config`, and `build/words.js` has `code_for_node`. Both print a
     `page.js` and both were called `code_for` (paging-audit-3b, fix 7). A
     CONFIGURATION is seven words, so its file is one `this.stage({…})` call; a NODE
     has blocks and children, so its file is a `Page` with a `content()`. */
export function code_for_config(config, page){
	const words = Object.entries(config).map(([key, value]) => "\n\t\t\t" + key + ": " + JSON.stringify(value) + ",").join("");

	return [
		'import { Paging } from "/imagine/paging/paging.js";',
		"",
		"export default new Paging({",
		"\tmeta: import.meta,",
		"\ttitle: " + JSON.stringify(page?.title ?? "My page") + ",",
		"\ticon: " + JSON.stringify(page?.icon ?? "description") + ",",
		"",
		"\tcontent(){",
		"\t\tthis.stage({" + words + "\n\t\t});",
		"\t},",
		"});",
	].join("\n");
}

/* WHAT GETS WRITTEN — the NEW page, not the one you are standing on. `mode` is
   passed through whole by `made.js`, so the whole configuration rides safely inside
   it; the five top-level keys are all that store keeps (`FileStore.file()`), and
   anything outside `mode` would be silently dropped. */
function node_for(stage){
	return {
		title: (stage.new_title || "").trim() || "New page",
		icon: "description",
		description: "A page made from a paging configuration.",
		mode: { ...stage.config },
		children: [],
	};
}

/* ⚠ LOAD, THEN SAVE. `made.js`'s `save(tree, was)` works out the smallest set of
     files to write by comparing the tree it is handed with the tree it had — so the
     current tree has to be read first, or the write would delete every page already
     there. */
async function save(stage, page, $said){
	// A page with no name would be one more "New page" in a list of them, so the
	// answer is the field, focused — not a silent default.
	if (!(stage.new_title || "").trim()){
		stage.$new_title?.el?.focus();
		return $said.empty(() => { p.c("muted", "Give the page a name first — the field just above."); });
	}

	$said.empty(() => { p.c("muted", "Writing…"); });

	const store = store_for(page ?? { store: () => ({ get: () => ({}), patch(){} }) });
	const tree = await store.load();

	const node = node_for(stage);
	node.name = name_for(node.title, tree, Page.slug);

	const ok = await store.save([...tree, node], tree);

	// The url is a child of MAKE (`/imagine/paging/make/<name>/`) while the file is
	// under `made/` — make/page.js's own note explains why the two differ.
	const url = "/imagine/paging/make/" + node.name + "/";

	$said.empty(() => {
		if (!ok) return void p.c("muted", "No dev server here, so nothing was written to disk — it is kept in this browser instead, and it is still a real page: [open " + node.title + "](" + url + ").");

		icon("check_circle").ac("paging-said-ok");
		md("**Saved to disk** as `public/imagine/paging/made/" + node.name + "/page.json`. **[Open " + node.title + "](" + url + ")** — or find it in [Make's list](/imagine/paging/make/).");
	});
}

export default fill_drawer;
