import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose and the four frames keep the measure — a 9em floor per frame means four across at
   1280 and up, two at 400, which is what the note draws. Own layout: `flex gap wrap` over
   four fixed-height stages. Two regions, no children. Preview: the photo thumb.

   Each stage is a BOUNDED box (6.5em tall) holding a fixed wireframe, so nothing can
   overflow it — the layout skill's "say what happens to content longer than the box"
   question has no content to ask it about here. */

/* The note's four words, each drawn as what it does to a panel inside a pane.
   `panel` is the inline geometry of the highlighted box in that state. */
const SCREENS = [
	{ name: "Iso", rail: 1, panel: { width: "55%", height: "55%" },
		line: "Stays in its panel. The box keeps its place and changes what it holds." },
	{ name: "Grow", rail: 1, panel: { width: "100%", height: "100%" },
		line: "Fills the pane. The panel takes the whole content area; the rail stays." },
	{ name: "Max", rail: 0, panel: { width: "100%", height: "100%", inset: true },
		line: "Full screen. Everything behind it — rail included — goes away." },
	{ name: "Popout", rail: 1, panel: { width: "70%", height: "70%", float: true },
		line: "Leaves the layout. It floats over what it came from, which stays put." },
];

function screen_frame({ name, rail, panel, line }){
	return div.c("flex v gap").style({ minWidth: "0" }).append(() => {
		span().style("fontWeight", "700").text(name);

		// The stage: a fixed 6.5em box, so the four read as the same screen four ways.
		div.c("surface").style({ height: "6.5em", padding: "0.4em", display: "flex",
			gap: "0.3em", position: "relative", overflow: "hidden" }).append(() => {

			div().style({ flex: "0 0 22%", background: "var(--line)",
				borderRadius: "2px", opacity: String(rail) });

			div().style({ flex: "1 1 auto", position: "relative",
				border: "1px dashed var(--line)", borderRadius: "2px" }).append(() => {
				div().style({
					width: panel.width, height: panel.height,
					border: "2px solid var(--prim)", borderRadius: "2px",
					background: "var(--surface)",
					position: panel.float ? "absolute" : "static",
					...(panel.float ? { top: "-0.6em", left: "-1.4em",
						boxShadow: "0 2px 8px rgb(0 0 0 / 0.25)" } : {}),
					...(panel.inset ? { position: "absolute", inset: "-0.4em",
						width: "auto", height: "auto" } : {}),
				});
			});
		});

		span.c("muted").style("fontSize", "0.85em").text(line);
	});
}

function property_screens(){
	/* A WALL of four, not a control row — so `grid auto-fit` with a real floor, which the
	   layout skill asks for: `flex wrap` landed 3 + 1 in the split layout's half-width
	   prose column, and a lone fourth frame stretched to the full row. This gives 4 across
	   at 1280 and up and 2 x 2 at 400.
	   Measured 2026-09-06, container width -> columns: 400 -> 344px, 2x2 · 1280 -> 566px, 4x1
	   · 1920 -> 640px, 4x1 · 3440 -> 720px, 4x1. One odd row is left, in a narrow band around
	   900px (a 392px container gives 3 + 1) right where notes.css's split kicks in: the floor
	   that would fix it (~8.05em) leaves 6px of slack at 1280 and would drop to 3 columns
	   there the moment the gap ramp moves, so the odd row is the safer trade. */
	return div.c("grid gap").style("gridTemplateColumns", "repeat(auto-fit, minmax(7.9em, 1fr))")
		.append(() => SCREENS.forEach(s => { screen_frame(s); }));
}

export default new NotesNote({
	meta: import.meta,
	title: "Iso, Grow, Max, Popout",
	icon: "open_in_full",
	description: "Four property screens, and reload keeps them.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is a navigation model, and it starts on the phone.**

> **MAIN (MOBILE) MENU PATTERN** — *left nav on desktop = mobile "main menu"*

with a small frame drawn beside it, a rail down one side. Then:

> **CONTENT NAV**
> Short content might not need nav… It just has jump menus built in…
> For large topic pages, however,
> Would the left nav be the mobile **"home"** for that topic? The main menu?

Under a rule, the model itself — this is the part the page is named for:

> ∞ **Depth**
> ☑ **Property Screens:** **Iso** (stays in panel) · **Grow** (fills pane) ·
>   **Max** (full screen) · **Popout**
> ☑ **Menus** (overlap, must stay on screen…)
> ☑ **Pager:** sub-pages, links open next to? \`[ A | B ]\`

and then the hard part, stated honestly rather than solved:

> **Routing?** It would be hard for the URL to accurately represent increasingly complex
> UI/state. However, you could try.
>
> ✱ **We always want reload to stay… same UX** ☑ Same Selection ☑ Same Workspace

**The right page is the multi-user half.**

> **Users, Groups, Teams, etc…**
> Chat? Actions? Feed?
> Dark = Anon? or Public?
> One big **Users** table, & multiple small group dbs? \`group_id\` \`user_id\` → all users in
> one big db

then two markup questions:

> \`hx\`: auto-heading, based on placement… → could use \`h2\`s for all
> \`#\` → \`hx\`? you'd need \`###\` for \`h2\`… /nesting

and three about shipping:

> \`Lew42.com\` → **PWA? Native/Electron?**
>
> \`app.$content.rc("page")\`? — \`$content.md(fetch("file.md"))\` *or* \`import content from
> "file.md"\`?
>
> For bundle & pushState, do \`page.js\` still work? → We'd need a **pager**?

A small frame labelled \`lew42\` closes the page.`);

		md(`## The four property screens

Each word is one thing that can happen to a panel inside a pane. The frames are the same
screen four times over — a rail on the left, a content pane on the right, and the panel
outlined in the accent colour.`);

		property_screens();

		md(`**The site shipped all four, under different names.** They are the paging realm's
four mechanisms:

| the note | shipped as | what it does |
| --- | --- | --- |
| **Iso** | [swap](/imagine/paging/mechanisms/swap/) | The box keeps its place and changes what it holds. |
| **Grow** | [expand](/imagine/paging/mechanisms/expand/) | The row grows in place. Nothing else moves. |
| **Max** | [takeover](/imagine/paging/mechanisms/takeover/) | One child fills the screen; everything behind becomes the trail. |
| **Popout** | [launch](/imagine/paging/mechanisms/launch/) | A new column opens beside; the page you came from stays. |

And the routing worry was right: two of the four change the url and two do not. \`launch\`
and \`takeover\` are real navigation with a real address and a real Back button; \`expand\` and
\`swap\` are states of the page you are already on. That split is exactly the line the note
could not see a way through — it turned out you do not need the url to hold everything, only
the two things a Back button must undo.`);

		md(`## What it points at

- [Paging · mechanisms](/imagine/paging/mechanisms/) — the four, live, each with the
  gesture that triggers it.
- [core/Sidebar](/framework/core/Sidebar/) — "left nav on desktop = mobile main menu",
  built: one rail that becomes the menu when the screen is narrow.
- [\`doc/columns.md\`](/framework/core/Page/doc/columns/) — "links open next to \`[A|B]\`" is
  the columns row, and \`width: "full"\` is Max.
- [The data decision](/imagine/platform/decisions/data/) — "one big Users table & multiple
  small group dbs" answered: one \`users\` row per person, and a Durable Object per live
  surface rather than a database per group.
- [ext/markdown](/framework/ext/markdown/) — \`$content.md(fetch("file.md"))\`, shipped as
  \`md()\`; and a \`.md\` file beside a page is already a child page, so the import form was
  never needed.`);
	}
});
