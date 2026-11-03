import { Page, View, Sidebar, md, h2, div, span, a, toc } from "/app.js";
import NavModel from "./NavModel.js";

View.stylesheet(import.meta, "model.css");

// The navigation model's page: four questions, each answered with a live demo. Docs: ./readme.md
export default class NavModelPage extends Page {

	content(){
		toc();

		md("**Four questions have kept the site's navigation unclear for months. This page answers each with one rule, and shows the rule working on this very page.**");

		div.c("wide page-navm-qa", () => [
			["Is the left sidebar a table of contents or a list of sub pages?", "**Sub pages.** The headings go in the right column, *On this page*."],
			["Nest a sidebar per level, or swap one sidebar out?", "**One tree, swapped only at a section root** (here: Framework). It opens along the path you are on."],
			["Which ancestor does a link open at?", "**The target's own section root.** A link may say `?in=/web/` to keep the reader's section."],
			["Workspace pages vs document pages?", "**A page says `kind: \"workspace\"`**: it fills, unpadded, and its parts are panes. Everything else is a document."],
		].forEach(([q, ans], i) => div.c("card page-navm-q", () => { span.c("muted", `${i + 1}. ${q}`); md(ans); })));

		md("**The rail on your left is the answer, live.** It is one tree rooted at Framework, opened along *Framework → Core → Page → Navigation → Navigation: one model*: each level shows its siblings, and this page shows its children. The crumb above carries the ancestors, so no second sidebar is ever needed. On a phone the same tree is behind the menu button.");

		h2("1. The left sidebar lists sub pages").attr("id", "sidebar");
		md("A table of contents and a list of sub pages answer different questions (*where am I in this page?* and *where am I in the site?*), so each gets its own place: sub pages on the left, headings on the right. Both at once in one rail made the rail change shape every time you scrolled. The right column here is [`ext/toc`](/framework/ext/toc/), already on 23 pages.");
		md("**Where the tree starts is the only real choice.** The same `Sidebar`, rooted at two different pages:");
		this.roots_demo();

		h2("2. Nest or swap: swap, at a section root").attr("id", "swap");
		md("One sidebar per level costs a full rail width per level. Measured with this site's real rail width, five levels deep:");
		this.room_demo();
		md("So the tree never nests; it **opens**, inside one rail. It is swapped for a different tree only when you cross into a different section (Framework, Layouts, Imagine, Web, Blog). If you want every level's siblings side by side, that is [Miller columns](/framework/core/Page/overview/columns/), a choice for one page that drills into a real tree, not for the site's navigation.");

		h2("3. A link opens at its own section").attr("id", "links");
		md("One rule, written once in [`NavModel.opens()`](./NavModel.js): a link opens in the section its target lives in, and the tree and crumb follow. A link can say `?in=<section>` to keep the reader where they were, for a guide that walks through framework pages without throwing the reader out of the guide. Computed live, from the code:");
		this.links_demo();
		md("Showing a link *in place* (inside a card, or as the next column) stays the job of the page that holds the link: [`open_link()`](/framework/core/Page/doc/open.md). That is the router deciding by context, and it already works.");

		h2("4. Document or workspace").attr("id", "kind");
		md("Most pages are **documents**: padded, a reading column, content flows down. A few are **workspaces**: zero padding, they fill the screen, and they are split into panes. One word on the page decides it, and the navigation is the same for both: a workspace is one row in the left tree, and its panes never are.");
		this.kind_demo();

		h2("The four decisions, and what lost").attr("id", "decisions");
		md(`| part | decision | the alternative | why it lost |
|---|---|---|---|
| Left sidebar | one tree of sub pages, opened along your path | a table of contents, or both in one rail | headings change as you scroll; a rail that changes shape is not persistent |
| Depth | swap the tree only at a section root | one rail per level | five levels leave 0 px for content at 1200 (demo 2) |
| Link activation | the target's own section; \`?in=\` keeps the reader's | always the nearest parent, or always the reader's section | nearest parent gives a new rail per click; reader's section breaks reload and shared links |
| Page kind | \`kind: "workspace"\` fills and owns panes | a second navigation system for apps | two systems drift apart; one tree serves both |`);

		md("**Nothing here is a new system.** It reuses [`Sidebar`](/framework/core/Sidebar/) (already folds to the path), [`Router`](/framework/core/Router/), a page's `children:`, [`ext/toc`](/framework/ext/toc/), [the switcher](/framework/core/Page/layout/switcher/) for tabs inside one page, and [the columns demo](/framework/core/Page/overview/columns/). The four small changes to core and ext it needs are written down, exact, in [`doc/core-changes.md`](./doc/core-changes.md); this page shows them with a demo override instead of changing core.");

		h2("The layouts that survive").attr("id", "layouts");
		md(`Under this model almost every layout is one of four kinds. **Before: 81 layout pages in [/layouts/](/layouts/). After: 25 kept, 56 retired.**

| kind | keep | why |
|---|---|---|
| Document | [Reader](/layouts/practice/reader/) | one padded reading column, the right column for headings |
| Document in the app | [Left rail](/layouts/labs/shells/left/) | the left tree beside a document: what this page is |
| Workspace | [Workbench](/layouts/practice/workbench/) · [Both rails](/layouts/labs/shells/both/) | fills, panes, zero padding |
| Wall (an index) | [Catalog](/layouts/practice/catalog/) | a grid of cards for a page whose job is its children |

Also kept, because they are the tools, not layouts: [the twelve layout ids](/layouts/), [Browse](/layouts/browse/), [Choosing a layout](/layouts/decide/), [Tags](/layouts/tag/), [Docs](/layouts/doc/), [Shell](/layouts/shell/).

**Retired** (moved, never deleted): [Explorer](/layouts/explorer/), [Blogx](/layouts/labs/blogx/), [Decks](/layouts/labs/decks/), [Magazine](/layouts/labs/mag/), [Screens](/layouts/labs/screens/), [Sections](/layouts/labs/sections/), the eight other [Shells](/layouts/labs/shells/), the [homepage variants](/layouts/shell/home/), and [Family tree](/layouts/archive/labs-trees/). Only Family tree has moved so far: the others are still linked from other pages or import a file beside them. [\`layouts/archive/retire.mjs --plan\`](/layouts/archive/) names each blocker; \`--apply\` moves a folder the moment nothing links to it.`);

		h2("Where the template library stands").attr("id", "templates");
		md(`- **Exists:** [\`Template\`](/framework/core/Page/Template/) clones a page into a new use that reads through to its source (\`clone(data)\`); one template so far, \`BigCard\`.
- **Exists:** [Browse](/layouts/browse/) shows 102 layouts with **Approve** and **Improve**, but no verdict has ever been cast: the approved list is empty.
- **Exists:** [the Library](/framework/library/) browses every ui and Figma item, with one container rule (\`needs_parent_padding\`: an item that must not touch an unpadded edge).
- **Missing:** the link between them: nothing turns an approved layout into a template, and the only container rule is padding.
- **Next step:** approve the four kinds above in [Browse](/layouts/browse/) (one press each), then give \`Template\` a \`fits: "document" | "workspace"\` word, the same \`kind\` this page adds, so a template says which pages it can go in.`);
	}

	// Two Sidebars on the real page tree: rooted at Framework (the section root) and at Core.
	roots_demo(){
		const chain = this.chain();
		const at = url => chain.find(p => p.url === url);
		div.c("wide page-navm-row", () => {
			for (const [url, say] of [["/framework/", "Rooted at the section root, Framework: what the app does."], ["/framework/core/", "Rooted at Core: a smaller tree, but Core would become a second section."]]) {
				div.c("page-navm-cell", () => {
					div.c("page-navm-rail", () => { if (at(url)) new Sidebar({ brand: at(url).title, root: at(url) }); });
					span.c("muted", say);
				});
			}
		});
	}

	// The width each strategy leaves for content, at 1200 and 3440, from the real rail's width.
	roots_rail(){
		const w = document.querySelector(".page--framework > .sidebar")?.getBoundingClientRect().width;
		return w && w < innerWidth / 2 ? w : NavModel.RAIL;   // on a phone the rail is a full-width top bar: not a rail width
	}

	room_demo(){
		const $box = div.c("wide page-navm-room");
		const draw = () => $box.empty(() => {
			const rail = Math.round(this.roots_rail());
			for (const screen of [1200, 3440]) for (const [rails, name] of [[5, "a rail per level"], [1, "one tree"]]) {
				const left = NavModel.room(screen, rails, rail);
				div.c("page-navm-bar", () => {
					span.c("page-navm-label", `${screen} px, ${name}: `).append(() => span.c("page-navm-crumb", left ? `${left} px for content` : "no room left"));
					div.c("page-navm-track", () => {
						for (let i = 0; i < rails; i++) div.c("page-navm-seg").style({ width: Math.min(100, rail / screen * 100) + "%" });
						div.c("page-navm-left").style({ flex: "1 1 0" });
					});
				});
			}
			span.c("muted", `One rail is ${rail} px here.`);
		});
		draw();
		setTimeout(draw, 300);   // re-measure once the app's own rail has laid out
		return $box;
	}

	links_demo(){
		const cases = [
			["/framework/core/Router/", "a plain link to Router"],
			["/layouts/practice/reader/", "a link into Layouts"],
			["/framework/core/Router/?in=/web/", "the same Router link, written in a Web guide"],
		];
		div.c("wide page-navm-row", () => cases.forEach(([href, say]) => {
			const o = NavModel.opens(href);
			div.c("page-navm-cell", () => {
				span.c("muted", say);
				a(href).href(href);
				div.c("page-navm-frame", () => {
					div.c("page-navm-mini-rail", "tree: " + NavModel.label(o.root));
					div.c("page-navm-mini-main", () => {
						span.c("page-navm-crumb", o.crumb.map(u => NavModel.label(u)).join(" › "));
						span(o.stay ? "kept the reader's section" : "opened in its own section");
					});
				});
			});
		}));
	}

	kind_demo(){
		div.c("wide page-navm-row", () => {
			div.c("page-navm-cell", () => {
				div.c("page-navm-kind page-navm-doc", () => { for (let i = 0; i < 6; i++) div.c("page-navm-line"); });
				md("**Document**: padded, flows. *This page.*");
			});
			div.c("page-navm-cell", () => {
				div.c("page-navm-kind page-navm-ws", () => { div.c("page-navm-pane"); div.c("page-navm-pane"); div.c("page-navm-pane"); });
				md("**Workspace**: fills, three panes, no padding. [Open the real one](./workspace/).");
			});
		});
	}
}
