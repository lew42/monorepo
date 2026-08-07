import { Page, md, demo, code, h2, div, p, span, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Page flow",
	description: "Vertical rhythm: who owns the space between two blocks.",
	icon: "format_line_spacing",

	content(){

		toc();

		md("**Spacing belongs to the container, not to the things in it.** A `.page` is a *flow*, and a flow gives its children the gaps. Write a component with no margins at all and it will sit correctly on any page that holds it.");

		code.css(`:where(.flow, .page, .md, blockquote, .demo-render) > * + * {
    margin-block-start: var(--flow);
}`);

		md("That is the whole system. Four more rules tune it — a heading hugs what follows, an `h2` takes air above — and every selector is wrapped in `:where()`, so it has **specificity zero** and any component that genuinely needs its own spacing wins by being an ordinary class.");

		h2("The four tokens");

		md(`| token | between |
|---|---|
| \`--flow\` | two ordinary blocks |
| \`--flow-tight\` | a heading and the thing under it |
| \`--flow-section\` | anything and an \`h2\` |
| \`--flow-sub\` | anything and an \`h3\`/\`h4\` |

Retune the rhythm by setting these — on \`.app\`, on a theme class, on one page. Never by writing a margin.`);

		demo("The four gaps, visible", () => {
			div.c("flow", () => {
				p("An ordinary block.");
				p("Another — this gap is `--flow`.");
				p.c("h2", "A section");
				p("Under a heading: `--flow-tight`.");
				p.c("h3", "A subsection");
				p("Same hug, and the heading above it took `--flow-sub`.");
			});
		}, "`.flow` is the opt-in class — the same rules a `.page` gets for free. Anything that stacks prose can ask for it.");

		h2("Authoring a component");

		md("Three rules, and the first one is most of it.");

		md("**1. A component has no outer margin.** Not `margin-bottom: 1em`, not `margin: 1.75em 0`. If it needs air around it, the flow it sits in provides that — and if it is dropped into a `flex gap` row instead, the row does. A component that brings its own margin has decided something about a page it has never seen.");

		md("**2. A component that arranges its own children owns their spacing.** The moment you write `display: flex` or `display: grid`, use `gap`. The flow rules only reach *direct children of a flow*, so a grid inside a page is on its own — and `.flex > *` and `.grid > *` in the utility layer zero the inherited margins for exactly this reason.");

		code.js(`div.c("flex v gap", () => { … })     // gap, not margins`);

		md("**3. `--flow` is page rhythm, not component rhythm.** `--flow-sub` put a card's eyebrow 32px from its own title, which is why `.gap` reads `--gap` and not `--flow`. Inside a box, use `gap`; between boxes, let the page decide.");

		h2("The trap");

		md("A margin written on a component is `(0,1,0)`. The flow rules are `(0,0,0)`. **The component always wins**, silently, and only on pages that happen to hold one — so the rhythm looks right everywhere you tested and wrong on the page someone writes next month.");

		md("`demo.css` had `margin: 1.75em 0` and gave every demo box a rhythm nothing else on the site had. It was deleted rather than matched, and the record is in `core/Page/readme.md`.");

		h2("First and last child");

		md("A flow's first child never takes a top margin and its last never takes a bottom one — `:first-child { margin-top: 0 }` and its twin live in the **utility layer**, globally, so a box's outer gap collapses into its own padding with nothing declared per component.");

		md("Next: [Page layouts](/framework/core/Page/layouts/) — what the page *around* this rhythm can be.");
	}
});
