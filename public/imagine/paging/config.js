import { div, p, span, a, code, input, icon, md, drawer, Page } from "/app.js";
import { CONTROLS, means_of } from "./blocks.js";
import { PRESETS, preset_url } from "./presets.js";
import { link_for, nest_of } from "./url.js";
import { code_for_node } from "./build/words.js";
import store_for, { name_for, file_of } from "./make/made.js";

/* ⚠ A CLICKABLE THAT IS NOT A `<button>` — the realm's own note, restated here rather
     than imported: `paging.js` imports `toolbar.js`, which imports THIS file, so
     reaching back up for `press` would close the loop. Four lines beats a cycle. */
const press = ($el, act) => $el
	.attr("role", "button").attr("tabindex", "0")
	.click(act)
	.on("keydown", event => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		act();
	});

/* ── COPY IT ──────────────────────────────────────────────────────────────────
   Two boxes in this rail hand you text you are meant to take away — the link to this
   page, and the `page.js` it would be. The link had a button and the code did not, so
   the nineteen-line file was hand-selected inside a 280px window (paging-audit-5).
   One helper, both boxes, and the same fallback: `navigator.clipboard` is refused
   outside a secure context, and localhost is not always one. */
/* ⚠ `text` MAY BE A FUNCTION, and one of the three callers needs it to be: the bar's
     address field is TYPED IN, so a string captured when the button was built would copy
     whatever was in the box when the page loaded. A getter is read on the press. */
export function copy_chip(text, words, fallback, says){
	return press(span.c("paging-act").append(() => { icon("content_copy"); span(words); }),
		async () => {
			try {
				await navigator.clipboard.writeText(typeof text === "function" ? text() : text);
				says?.(() => { icon("check_circle"); span("copied"); });
			} catch {
				fallback?.();
				says?.(() => span("select it and press ctrl-C"));
			}
		});
}

/* ── THE DRAWER ────────────────────────────────────────────────────────────────

   The hover toolbar has the five words you change while you look at a page. Every
   other thing you might want to do with a configuration lives here, in the site's
   own right rail (`ext/drawer`) — which PUSHES the page rather than covering it, so
   the stage you are configuring is still on screen while you configure it.

     THE FULL FORM      all seven words, each with the sentence that says what it
                        does — the room the hover bar has no space for
     NEST               put any of the twelve presets INSIDE this one, and see it —
                        or type the address of any page at all
     THE FILE           the page as a `page.json`: the file it ALREADY IS on a page you
                        made, and the file it WOULD BE anywhere else — with
                        MAKE THIS A PAGE, which hands that JSON to Make's own backend
                        and gets a real directory and a real page.json on disk in dev
     THE CODE           the same page as a runnable `page.js`
     DELETE             on a page you made, and only there: the directory and the
                        parent's own list of children, removed together

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
/* ⚠ AND IT ASKS THE PAGE WHAT IT IS, rather than assuming. Every box below used to be
     written for a page that IS SEVEN WORDS — which the twelve ready-made pages are, and
     which neither editor is. Mounted over Build and over a page you made, the same boxes
     printed a `page.json` with no blocks and no children, a `page.js` titled after the
     page you were STANDING on, and a second Save beside the one the page already had
     (paging-audit-7b). Two questions fix all three, and a page answers them itself:

       page.node_now()          the node this page IS, or nothing. Build and a page you
                                made both have one; a demo does not.
       page.prints_own_file     true when the page already shows its own file and its own
                                code on the page itself (Build), so the drawer must not
                                print a second, different answer to the same question. */
export function fill_drawer(stage, page, focus){
	const node = page?.node_now?.() ?? null;
	const own = page?.prints_own_file === true;

	return drawer(($slot, $body) => {
		/* ⚠ THE LAST FILL'S FIELDS ARE DEAD. `ext/drawer` replaces the whole rail on every
		     call, so a field held from the previous fill is a detached input still holding
		     what was typed into it — and `nest_now()` reads that field. `Code` puts its box
		     ABOVE the nest section, so without this it would print the nest as it was two
		     drawers ago. Cleared here, set again by the sections below. */
		stage.$nest_field = null;
		stage.draw_json = null;

		$slot.empty(() => {
			icon("tune");
			span(page?.title ?? "This page");
		});

		$body.empty(() => {
			link_box(stage);
			if (focus === "code" && !own) code_box(stage, page, node);

			form(stage);
			nesting(stage);

			if (own) return void on_the_page();

			if (node) file_box(node); else json_box(stage, page);
			if (focus !== "code") code_box(stage, page, node);

			if (page?.delete_now) delete_box(page);
		});
	});
}

/* THE ONE LINE BUILD'S DRAWER GETS INSTEAD OF TWO BOXES. Build prints its own file and
   its own `page.js` full-width under the stage, and it has its own Save — so the honest
   thing here is to point at them rather than print a second copy that disagrees. */
function on_the_page(){
	return md("**This page's file and its code are on the page itself**, in the two full-width boxes under the builder — with the one **Save** that writes them. Everything above changes what they say.").ac("muted paging-means");
}

/* ── 0 · THE LINK TO THIS EXACT PAGE ──────────────────────────────────────────
   Every word you change is written into the address (`url.js`), so this box is just
   showing you the address — but showing it is the whole point: until 2026-09-05 the
   realm could reach about 117,600 configurations by clicking and send 43 of them,
   because nothing ever appeared in the url. Copy this and the page travels. (And the
   count is a floor, not a ceiling: `content` takes a url now, so the box can hold any
   page or `.md` file on the site.)

   ⚠ The field is `readonly`, not disabled: a disabled input cannot be selected, and
     "select it and press ctrl-C" is the fallback for every browser that refuses
     `navigator.clipboard` outside a secure context (which localhost is not always). */
/* ⚠ NOT OVER A STAGE THAT CANNOT READ AN ADDRESS. An `inner` stage is a page drawn
     inside another page: it never reads `?…` and never writes it (`stage.js`
     `initialize()`), so the address this box handed you under the words "open it cold and
     you get exactly this page" opened on the page's own words instead. Measured on Build,
     which is an inner stage: *room=wide&type-size=display* came back reading and regular
     (paging-audit-7b, fix 3). A box that cannot keep its promise says so instead. */
function link_box(stage){
	p.c("h4 muted", "The link to this page");

	if (stage.inner) return md("**There is no link to this exact page.** What you are looking at is a page drawn *inside* another page, so it has no address of its own — the words you set here are not in the browser's address bar and cannot be sent to anybody. Save it as a page and it gets a real address.").ac("muted paging-means");

	const url = link_for(stage.config, stage.base, stage.nest, stage.base_nest);

	let $said;

	const $field = input().ac("paging-link-field").attr("type", "text").attr("readonly", "readonly");
	$field.el.value = url;

	div.c("paging-said", () => {
		copy_chip(url, "Copy this link", () => $field.el.select(), said => $said.empty(said));
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

	// ⚠ ITS OWN NAME. Twelve of these chips look exactly like the thirty-nine in the form
	//   above, and one of the form's is called Dashboard too — so the group a chip belongs
	//   to has to be sayable, in a test as much as on screen (paging-audit-7, note d).
	div.c("paging-drawer-values paging-nest-chips", () => {
		PRESETS.forEach(preset => {
			const on = stage.nest && stage.nest.id === preset.id;

			span.c("paging-chip").ac(on && "on")
				.attr("role", "button").attr("tabindex", "0").attr("aria-pressed", String(!!on))
				// ⚠ `aria-pressed`, like the 39 chips in the form above — twelve chips that
				//   look identical to those and announced nothing (paging-audit-6b, fix 6).
				.attr("title", preset.one_line)
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
/* ⚠ AND IT READS BACK. `?nest=dashboard` pressed the chip and left this field EMPTY, so
     the one control that can hold an arbitrary nest could not show you the nest you had
     arrived with (paging-audit-7, item 2). The field IS the nest, whichever way it was
     set, so it shows a preset's name as readily as an address. */
function any_page(stage){
	p.c("muted paging-means", "…or the address of any page you have made:");

	const $url = input().ac("paging-link-field paging-nest-field").attr("type", "text")
		.attr("placeholder", "/imagine/paging/make/notes/");

	$url.el.value = stage.nest?.url ?? stage.nest?.id ?? "";

	/* ⚠ HELD ON THE STAGE, like the name field two boxes down — so `node_for()`, both
	     exports and Save can all read what is in the box RIGHT NOW rather than what was
	     in it when they were built. That is the whole of item 1: nothing below captures
	     this value, everything below asks for it. */
	stage.$nest_field = $url;

	const $note = p.c("muted paging-means paging-nest-note");
	const say = () => $note.empty(() => { const line = means_of_nest(stage); if (line) md(line); });

	const put = () => { nest(stage, nest_now(stage)); };

	$url.on("keydown", event => { if (event.key === "Enter"){ event.preventDefault(); put(); } });

	/* SAY WHAT IT MEANS WHILE YOU TYPE, and redraw the file box under it — so the file
	   you are about to save visibly gains the `nest` line as you type the address into
	   this field. A reader never has to wonder whether the box heard them. */
	$url.on("input", () => { say(); stage.draw_json?.(); });

	/* ⚠ AND COMMITTED ON THE WAY OUT — but WITHOUT `drawer.refresh()`. A refresh fired
	     from a blur handler deletes the button you are in the middle of pressing and the
	     click never lands; the stage redraws itself, and the chips catch up on the next
	     refresh. `change` fires on blur only when the value actually changed. */
	$url.on("change", () => { const now = nest_now(stage); if (id_of(now) !== id_of(stage.nest)) stage.nest_to(now); });

	div.c("paging-said", () => {
		press(span.c("paging-act").append(() => { icon("layers"); span("Put it inside"); }), put);

		a.c("page-link", "the pages you have made →").href("/imagine/paging/make/");
	});

	say();
}

/* ── WHAT THE NEST IS, RIGHT NOW ──────────────────────────────────────────────
   The field's LIVE value, turned into the page it names. Read by every export, by the
   JSON box and by Save.

   ⚠ THIS IS ITEM 1, AND IT IS THE WHOLE OF IT. Enter used to be the only thing that
     committed this field — so you could type `dashboard`, press *Make this a page*, and
     read a green tick naming a file that had no `nest` key in it (paging-audit-7). The
     tick was telling the truth about the file; the file was missing what you typed. Now
     the field is asked on the press, the same way `copy_chip` takes a getter rather than
     the string it was built with. */
function nest_now(stage){
	const $field = stage.$nest_field;
	if (!$field?.el) return stage.nest ?? null;

	const typed = ($field.el.value || "").trim();
	if (!typed) return null;

	// The page already in the box, unchanged — keep the object, which carries its title.
	if (typed === id_of(stage.nest)) return stage.nest;

	return nest_of(typed);
}

const id_of = nest => nest?.url ?? nest?.id ?? null;

// The sentence under the field: what this value means, or why it means nothing.
function means_of_nest(stage){
	const typed = (stage.$nest_field?.el?.value || "").trim();
	if (!typed) return "";

	const found = nest_of(typed);

	return found
		? "**" + found.title + "** goes inside this page's box, running, with its own navigation and its own colours."
		: "`" + typed + "` is not a page. An address starts with `/` — or type one of the twelve names above, like `dashboard`.";
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

	// ⚠ THE NEST FIELD REDRAWS THIS BOX TOO — it is drawn above this one, so it cannot
	//   reach `draw` directly. Typing an address makes the `nest` line appear in the file
	//   as you type, which is the visible proof that the field was heard.
	stage.draw_json = draw;

	name_field(stage, draw);
	draw();

	const $said = div.c("paging-said");

	press(span.c("paging-act").append(() => { icon("save"); span("Make this a page"); }),
		() => save(stage, page, $said));

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
/* ⚠ AND IT PRINTS THE PAGE, NOT THE SEVEN WORDS, WHEN THE PAGE IS MORE THAN SEVEN WORDS.
     On `/imagine/paging/make/notes/` — a real page with two children — this printed a
     `page.js` with no `pages:` and no `children:`, so the file it handed you would have
     drawn four canned strangers instead of Today and Later (paging-audit-7b, fix 1). A
     page that has a NODE gets `code_for_node()`, which has printed a node's children,
     blocks and default tab correctly since Build shipped. One question, one printer. */
function code_box(stage, page, node){
	p.c("h4 muted", "The same page, as code");

	const text = node ? code_for_node(node) : code_for_config(stage.config, page, nest_now(stage));
	const $box = div.c("paging-code-box", () => { code.js(text); });

	// ⚠ THE SELECT FALLBACK IS A RANGE, not `input.select()`: this is a `<pre>`, not a
	//   field, so "select it and press ctrl-C" has to select the element's own text.
	let $said;
	div.c("paging-said", () => {
		copy_chip(text, "Copy the code", () => select_text($box.el), said => $said.empty(said));
		$said = span.c("paging-said-ok");
	});

	return md(node
		? "One directory, one `page.js` — the whole page: its seven words, the pages under it and whatever is in its box."
		: "One directory, one `page.js`. Every word above is an argument.").ac("muted paging-means");
}

/* ── THIS PAGE, AS THE FILE IT ALREADY IS ─────────────────────────────────────
   A page you MADE is not a configuration waiting to be written — it is a `page.json` on
   disk right now, and the bar above writes into it as you change a word. So on that page
   this box READS the file instead of composing a new one, and there is no second Save:
   the box that offered one printed a different page from the one you were standing on
   (paging-audit-7b, fix 1). To make a NEW page from these words, that is Make. */
function file_box(node){
	p.c("h4 muted", "This page, as a file");

	const text = JSON.stringify(file_of(node), null, "\t");
	const $box = div.c("paging-code-box", () => { code.js(text); });

	let $said;
	div.c("paging-said", () => {
		copy_chip(text, "Copy the file", () => select_text($box.el), said => $said.empty(said));
		$said = span.c("paging-said-ok");
	});

	return md("This is the whole page, as it sits on disk under `made/`. Change a word in the bar and it is written here — reload and it is still there.").ac("muted paging-means");
}

/* ── UNMAKE THIS PAGE ─────────────────────────────────────────────────────────
   A page you made could be made and never unmade: there was no delete on the page itself,
   and deleting the directory by hand left the page above it naming a child that 404s —
   the exact trap `CLAUDE.md` warns about (paging-audit-7, item 3). Both halves go
   together here, because `made.js`'s one save seam does both: it `rm`s the directory and
   rewrites the parent's file without the name.

   ⚠ TWO PRESSES. A one-click control that deletes a file is the wrong shape however
     clearly it is labelled — the same rule `baseline.js`'s Reset already keeps. */
function delete_box(page){
	p.c("h4 muted", "Delete this page");

	const $acts = div.c("paging-said paging-del");

	const arm = () => $acts.empty(() => {
		press(span.c("paging-act").append(() => { icon("delete"); span("Delete " + page.title); }), ask);
	});

	const ask = () => $acts.empty(() => {
		press(span.c("paging-act paging-act-warn").append(() => { icon("delete_forever"); span("Yes — delete " + page.title + " and its file"); }), go);
		press(span.c("paging-act").append(() => span("Cancel")), arm);
	});

	// ⚠ NAVIGATE AFTERWARDS, ALWAYS. The page you are standing on has just stopped
	//   existing, so staying here would leave a live view of a deleted page on screen.
	const go = () => {
		const back = page.delete_now();
		drawer.close();
		page.app?.router?.go(back);
	};

	arm();

	return md("The directory, its `page.json` and every page under it go — and the page above it stops naming it, in the same write. Nothing is left pointing at a page that is not there.").ac("muted paging-means");
}

/* Selecting a `<pre>`'s own text — the fallback when `navigator.clipboard` is refused.
   `input.select()` cannot do this: a code block is not a field. */
export function select_text(el){
	const range = document.createRange();
	range.selectNodeContents(el);
	const selection = getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

/* ⚠ `code_for_config`, and `build/words.js` has `code_for_node`. Both print a
     `page.js` and both were called `code_for` (paging-audit-3b, fix 7). A
     CONFIGURATION is seven words, so its file is one `this.stage({…})` call; a NODE
     has blocks and children, so its file is a `Page` with a `content()`. */
export function code_for_config(config, page, nest){
	const words = Object.entries(config).map(([key, value]) => "\n\t\t\t" + key + ": " + JSON.stringify(value) + ",").join("");

	/* THE PAGE INSIDE THIS ONE is the stage's second argument, exactly as `pages:` and
	   `draw:` are - so the file you copy runs the nested page too. */
	const inside = nest?.id
		? ", {\n\t\t\tnest: " + JSON.stringify(nest.id) + ",   // a whole page, running inside this one\n\t\t}"
		: "";

	return [
		'import { Paging } from "/imagine/paging/paging.js";',
		"",
		"export default new Paging({",
		"\tmeta: import.meta,",
		"\ttitle: " + JSON.stringify(page?.title ?? "My page") + ",",
		"\ticon: " + JSON.stringify(page?.icon ?? "description") + ",",
		"",
		"\tcontent(){",
		"\t\tthis.stage({" + words + "\n\t\t}" + inside + ");",
		"\t},",
		"});",
	].join("\n");
}

/* WHAT GETS WRITTEN — the NEW page, not the one you are standing on. `mode` is
   passed through whole by `made.js`, so the whole configuration rides safely inside
   it; the five top-level keys are all that store keeps (`FileStore.file()`), and
   anything outside `mode` would be silently dropped. */
/* ⚠ AND THE PAGE INSIDE THIS ONE RIDES WITH IT. The box two rows above hands you
     `…?nest=dashboard` — the nested page is real and sendable — and this export printed
     the seven words and dropped it, so the one control the owner asked for by name was
     the one thing a saved page lost (paging-audit-6b, break 2). `nest` is a STRING here
     (a preset id, or a page's address), and it rides inside `mode` because `mode` is the
     one object `made.js` passes through whole. */
/* ⚠ AND IT READS THE NEST FIELD LIVE. `stage.nest` is only set once the field has been
     COMMITTED, and Enter was the only thing that committed it — so a nest you had typed
     and not pressed Enter on was missing from this object, from the box that prints it,
     and from the file Save wrote, while the tick said the file was saved (paging-audit-7,
     item 1). `nest_now()` asks the field. */
function node_for(stage){
	const nest = nest_now(stage);

	return {
		title: (stage.new_title || "").trim() || "New page",
		icon: "description",
		description: "A page made from a paging configuration.",
		mode: { ...stage.config, ...(nest?.id ? { nest: nest.id } : {}) },
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

	/* ⚠ COMMIT THE NEST FIELD BEFORE WRITING, so the page you are looking at, the address
	     and the file that is about to be written all say the same thing. `nest_to()` and
	     not `nest()`: `drawer.refresh()` would delete the box this function is about to
	     write its answer into, mid-save. The chips catch up on the next refresh. */
	const nest = nest_now(stage);
	if (id_of(nest) !== id_of(stage.nest)) stage.nest_to(nest);

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
