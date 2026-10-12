import { Page, md, div } from "/app.js";

const META = import.meta;

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a page in `/framework/ai/`'s catalog detail column — a normal page
                grid (`main` for prose, `wide` for the leftover), never a columns row.
   2 SIZE       prose at `--measure`; the one before/after pair claims `wide` so the
                two files sit side by side from 1280 up and stack under it. Measured
                at 1280: 967px page, 437px a side — no code block scrolls.
   3 OWN LAYOUT `.flow` prose, one `.cols.half` pair, two short lists. Nothing else.
   4 REGIONS    one — core's. `Plan` is the only child, and it is the long form.
   5 PREVIEW    core's default card, on the day board.

   ⚠ ONE SCREEN. The plan is 400 lines; this page is the sentence a reader needs
     before deciding whether to open it. Detail nests one click down, in `Plan`.
   ⚠ TWO SPACES, NOT TABS, in the two code samples below — a tab renders eight
     columns wide in a <pre>, and the same eleven lines were 700px taller for it. */

const BEFORE = "```js\n"
	+ "export default new Page({\n"
	+ '  title: "Notes",\n'
	+ '  children: "today later",\n'
	+ "\n"
	+ "  // a rail of my children, a panel on the\n"
	+ "  // right, on a card, using the whole width\n"
	+ "  // — every bit of it by hand.\n"
	+ "  content(){\n"
	+ '    div.c("wide flex gap", () => {\n'
	+ "      this.my_own_rail();\n"
	+ '      div.c("surface pad", () => p("In the box."));\n'
	+ "      this.my_own_panel();\n"
	+ "    });\n"
	+ "  },\n"
	+ "});\n"
	+ "```";

const AFTER = "```js\n"
	+ "export default new Page({\n"
	+ '  title: "Notes",\n'
	+ '  children: "today later properties",\n'
	+ "\n"
	+ '  navigation: "rail",\n'
	+ '  arrangement: "rail-right",\n'
	+ '  width: "wide",\n'
	+ '  surface: "card",\n'
	+ '  background: "plain",\n'
	+ '  type_size: "regular",\n'
	+ "\n"
	+ "  content(){\n"
	+ '    p("In the box.");\n'
	+ "  },\n"
	+ "});\n"
	+ "```";

export default new Page({
	meta: META,
	title: "Six words for any page",
	description: "The plan that moves the paging lab's vocabulary into core Page, so any page is configured the same way.",
	icon: "auto_awesome_mosaic",

	children: {
		Plan: {
			icon: "menu_book",
			description: "The full plan: the map, the seam, three slices, the risks, what to delete.",
			content(){ return md.file(META, "plan.md", { h1: false }); },
		},
	},

	content(){

		md("**Today a page's shape is code you write. After this it is six words you say.**\n\n"
			+ "`/imagine/paging/` is a lab where you build a page out of six words instead of code. It works — "
			+ "and only inside the lab. This plan moves the six words into `core/Page`, so every page on the site "
			+ "is configured the same way and the lab deletes its own copy.");

		div.c("wide cols half gap", () => {
			md("**Before** — the page draws its own shape.\n\n" + BEFORE);
			md("**After** — the page says what shape it is.\n\n" + AFTER);
		});

		md("## The six words\n\n"
			+ "- **navigation** — six of its seven answers are core today under other names: `tabs` is `ext/tabs`, `columns` is `Page.columns()`, `takeover` is `width: \"full\"`. Only `expand` is new.\n"
			+ "- **content** — **core wins outright.** On a real page, what is in the box *is* `content()`. It gains one thing: a `content` that is an address renders the page or file there.\n"
			+ "- **room** — `width:` is declared 194 times here, so it keeps the key and gains the lab's four values. `room:` still reads, for every file already written.\n"
			+ "- **arrangement** — core opens the box; a declared child fills it, the way an `ext/tabs` child mounts today.\n"
			+ "- **colour** — two controls, `surface:` and `background:`. Five words, every one already a theme token.\n"
			+ "- **type** — three steps, on the key `type_size:`. A core page really does have a `type()` method, and a field of that name would read the function back.");

		md("## Three slices, each leaving the site green\n\n"
			+ "About 90 lines added to `Page.class.js` and one block in `Page.css`, against about 580 deleted from the lab — five of the six deletions being a second copy of a list.\n\n"
			+ "1. **Core gains the words and nobody uses them.** Every screenshot on the site is identical, and a grep proves no page says one.\n"
			+ "2. **The lab imports them and deletes its own copy.** The nine-step use test still passes end to end.\n"
			+ "3. **Sections and layouts move under *arrangement*** — the two realms that already hold that catalogue.");

		md("**[Read the plan →](./plan/)** — the six words mapped to core with file and line, the seam in code, the three slices written for a cold reader to execute, the risks, and the deletion list.");
	},
});
