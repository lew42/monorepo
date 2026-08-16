import { Page, div, span, h1, input, button } from "/app.js";
import panel, { Panel } from "/framework/ext/Panel/workspace.js";

/* The index is a BROWSER, not a reading page: every layout as a card, grouped by the
   `group:` each child declares, beside a rail that filters them. Both halves are
   ext/Panel leaves, so the seam between them drags — and `panel()` carries no saver,
   so nothing a visitor rearranges survives a reload. The prose that used to live here
   is `model/`, the first card. Design record: readme.md. */

export default new Page({
	meta: import.meta,
	title: "Layouts",
	description: "Seventeen whole-page layouts and the twelve words they are built from — one browsable wall.",
	icon: "dashboard_customize",

	// The whole catalog, in one list. Each child declares the `group:` that heads its
	// run, and previews() turns each run into a section — nothing here orders sections.
	children: "model "
		+ "fit flex grid "
		+ "space 400 "
		+ "document docs landing hero pricing stack "
		+ "shell dashboard split overlay gallery sidebar masonry "
		+ "feed carousel mail chat",

	/* ⚠ Page.render() emits the h1 OUTSIDE content(), and `full` zeroes the gutter that
	   would sit it anywhere sane — so this replaces the view rather than patching it,
	   the way Doc.render() does, and the title rides the filter rail instead. */
	render(){
		return this.view ??= div.c("page full fill flex v", () => this.content())
			.ac(this.name && "page-" + this.name);
	},

	content(){
		let $wall, $none;
		const state = { group: "", text: "" };

		// ⚠ A wall filtered down to nothing is a dead end with no way back — the search
		// that emptied it is off in the other panel, and the reader sees a blank region.
		const apply = () => { if ($wall) $none.style("display", sift($wall, state) ? "none" : ""); };

		/* ⚠ `align: "tl"` on both. A panel body centres what it is handed, and a wall
		   taller than the panel then spills out of BOTH ends with the near end outside
		   the scrollable region entirely — the first section heading was unreachable. */
		const tree = new Panel({ data: { dir: "row" } });
		tree.add(new Panel({ data: { template: "filters", mode: "hug", align: "tl" } }));
		tree.add(new Panel({ data: { template: "wall", grow: 8, align: "tl" } }));

		/* ⚠ Rides the tree and never serializes (ext/Panel readme). A private vocabulary
		   is also what withholds `random` from the T menu — offered, it would roll this
		   index into a second arrangement nobody asked for. */
		tree.templates = {
			filters: { icon: "filter_list", draw: () => this.filters(state, apply) },

			/* ⚠ `$wall` is the GRID, never the padded box around it — tag() and sift()
			   both walk `.page-previews`'s own children, and a wrapper would hand them
			   one child that is never a card. */
			wall: { icon: "grid_view", draw: () => {
				/* ⚠ `width: 100%`. A panel body is a grid with `justify-items: safe start`
				   (the alignment picker's own token), which SHRINK-WRAPS whatever it is
				   handed — the wall then sized to its content and left 2500px of a 3440
				   screen empty. Declaring the width is how a section band already answers
				   this (`.panel-body > .section-band`, panel.css): the picker positions
				   what is INSIDE the full-width box. */
				div.c("pad", () => {
					$wall = tag(this.previews());
					$none = span.c("muted", "Nothing matches. Clear the search, or pick Everything.");
				}).style({ "--pad": "1em", width: "100%" });

				apply();
			} },
		};

		return panel(tree).style("--panel-height", "100%");
	},

	// The inner left sidebar: the page's own title, a search, and one row per section.
	filters(state, apply){
		const pages = [...this.children.values()];
		const groups = [...new Set(pages.map(page => page?.group).filter(Boolean))];

		return div.c("flex v gap pad", () => {
			h1.c("h3", this.title);

			input().attr("type", "search").attr("placeholder", `Search ${pages.length} layouts`)
				.on("input", e => { state.text = e.target.value; apply(); });

			div.c("flex v gap", () => {
				row("Everything", "", pages.length);
				groups.forEach(group => row(group, group, pages.filter(page => page?.group === group).length));
			}).style("--gap", "0.15em");
		}).style({ "--gap": "0.8em", "--pad": "1em", width: "100%" });

		function row(label, group, count){
			const $row = button.c("flex gap v-center split", () => {
				span(label);
				span.c("muted", String(count));
			})
				.ac(state.group === group && "prim")
				.click(() => {
					state.group = group;
					[...$row.el.parentElement.children].forEach(el => el.classList.remove("prim"));
					$row.ac("prim");
					apply();
				});

			return $row;
		}
	},

	/* The layouts nav, as plain entries — handed to whichever layout draws one, so a
	   thumbnail's rail is the same rail. Adoption, not an import: a child reaches UP
	   through `this.parent`, and a mutual import here would break deep reloads only. */
	rail(){
		return [...this.children]
			.filter(([, page]) => page?.layout)
			.map(([name]) => this.nav_for(name));
	},
});

/* previews() emits one flat run — heading, its cards, the next heading — so the group a
   card belongs to is the last heading above it. Recorded on the way past, once, rather
   than re-derived on every keystroke.

   ⚠ The search text is the card's own title, description and url — NEVER its
   `textContent`. Most cards here hold a live render of a whole fictional site, so a
   card's text includes "email", "Pricing" and every nav word in it: searching `mail`
   matched Stack and Sidebar, which contain a form and a menu. */
function tag($wall){
	let group = "";

	for (const el of $wall.el.children){
		if (el.classList.contains("page-previews-group")) group = el.textContent;

		el.dataset.group = group;
		el.dataset.find = [
			el.querySelector(".page-preview-title")?.textContent,
			el.querySelector(".page-preview-desc")?.textContent,
			el.querySelector("a")?.getAttribute("href"),
		].filter(Boolean).join(" ").toLowerCase();
	}

	return $wall;
}

/* ⚠ Inline `display`, not `hidden` and not a class: `.page-preview` declares
   `display: flex` (Page.css), which beats the UA's `[hidden]` outright — and this
   directory ships no stylesheet to put a class in. Per-element state, not a look. */
function sift($wall, { group, text }){
	const kids = [...$wall.el.children];
	const needle = text.trim().toLowerCase();
	const heading = el => el.classList.contains("page-previews-group");
	let shown = 0;

	kids.forEach(el => {
		if (heading(el)) return;

		const hit = (!group || el.dataset.group === group)
			&& (!needle || el.dataset.find.includes(needle));

		el.style.display = hit ? "" : "none";
		if (hit) shown++;
	});

	// ⚠ Then the headings, each answering to the run below it — a section heading left
	// standing over nothing reads as a section whose cards failed to render.
	kids.forEach((el, i) => {
		if (!heading(el)) return;

		let any = false;
		for (let j = i + 1; j < kids.length && !heading(kids[j]); j++)
			if (kids[j].style.display !== "none") { any = true; break; }

		el.style.display = any ? "" : "none";
	});

	return shown;
}
