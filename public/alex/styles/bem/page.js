import { Page, md, code, h2, demo, div, p, button, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "BEM",
	description: "Block, Element, Modifier — keeping styles scoped to a component.",
	icon: "style",

	content(){

		toc();

		code.css(`.block                     /* standalone component */
.block__element            /* a piece inside the block */
.block--modifier           /* a variant of the block */
.block__element--modifier  /* a variant of the element */`);

		md("A naming convention that keeps styles scoped to their component. `.c()` chains classes, and the flat CSS means selectors stay shallow.");

		h2("A responsive panel");

		demo(() => {
			div.c("panel", () => {
				div.c("panel__image", "Image");
				div.c("panel__body", () => {
					div.c("panel__title", "Regular Panel");
					p.c("panel__text", "A simple panel with BEM-scoped styles. Drag the demo narrower to see it adapt.");
					div.c("panel__footer", () => {
						button.c("panel__btn", "Action");
					});
				});
			});
		}, "A `panel` block with `__image`, `__body`, `__title`, `__text` and `__footer` elements.");

		md("Padding and font sizes scale fluidly with `clamp()` — no breakpoints needed for the panel itself:");

		code.css(`.panel {
    border: 1px solid var(--subtle);
    border-radius: 0.5rem;
    padding: clamp(0.5rem, 2vw, 1rem);
}
.panel__image {
    background: var(--bg);
    color: white;
    padding: clamp(1rem, 4vw, 2rem);
    text-align: center;
    font-size: clamp(1.5rem, 4vw, 2rem);
}
.panel__body  { padding: clamp(0.5rem, 2vw, 1rem); }
.panel__title { font-weight: 600; color: var(--prim); font-size: clamp(1rem, 2.5vw, 1.25rem); }
.panel__text  { margin: 0; color: var(--subtle); font-size: clamp(0.8rem, 2vw, 0.9rem); }`);

		h2("A list of them");

		demo(() => {
			div.c("panel-list grid auto gap", () => {
				["First panel in a responsive list.", "Second — watch it reflow.", "Third fills the remaining space."]
					.forEach((text, i) => div.c("panel", () => {
						div.c("panel__image", "Image");
						div.c("panel__body", () => {
							div.c("panel__title", `Panel ${i + 1}`);
							p.c("panel__text", text);
						});
					}));
			});
		}, "A `panel-list` block laying panels out on a grid — one column to many via `auto-fit`, the same pattern as `.grid.auto`.");

		code.css(`.panel-list {
    --panel-min: min(16rem, 100%);
    grid-template-columns: repeat(auto-fit, minmax(var(--panel-min), 1fr));
}`);

		md("Override the minimum inline if you want wider panels: `.style(\"--panel-min\", \"min(20rem, 100%)\")`.");

		h2("Layout modifier");

		demo(() => {
			div.c("panel panel--horizontal", () => {
				div.c("panel__image panel__image--aside", "Image");
				div.c("panel__body panel__body--fill", () => {
					div.c("panel__title", "Horizontal Panel");
					p.c("panel__text", "Image beside text on wide screens, stacked on narrow.");
					div.c("panel__footer", () => {
						button.c("panel__btn panel__btn--prim", "Primary");
					});
				});
			});
		}, "`--horizontal` flips the panel to a row on wide screens and stacks it on narrow. The children carry their own modifiers — `__image--aside`, `__body--fill` — so nothing reaches down from the block.");

		code.css(`.panel--horizontal { display: flex; flex-direction: column; }

@media (min-width: 28rem) {
    .panel--horizontal { flex-direction: row; }
}

/* after .panel__image and .panel__body — same specificity, so order decides */
.panel__image--aside { flex: 0 0 clamp(4rem, 30%, 8rem); }
.panel__body--fill   { flex: 1; }`);

		h2("Appearance modifier");

		demo(() => {
			div.c("panel panel--featured", () => {
				div.c("panel__image", "Image");
				div.c("panel__body", () => {
					div.c("panel__title", "Featured Panel");
					p.c("panel__text", "Add a modifier class alongside the block class to change appearance.");
					div.c("panel__footer", () => {
						button.c("panel__btn panel__btn--prim", "Featured Action");
					});
				});
			});
		}, "`--featured` and `__btn--prim` compose independently — no cascade surprises.");

		h2("Notation rules");

		md(`- Two underscores for elements: \`block__element\`, never \`block-element\`.
- Two hyphens for modifiers: \`block--modifier\`.
- Never nest BEM selectors: \`.panel__title\`, not \`.panel .panel__title\`.
- Mix block and modifier on the same element: \`"panel panel--featured"\`, not just the modifier.
- Prefer \`clamp()\` and \`min()\` for responsive values; reach for a media query only when fluid math cannot express the change.`);

		md("One caveat for this site: **every rule must live inside a layer**, and the layer list must be restated in full — `@layer base, theme, site, util;`. An unlayered rule beats every layer at any specificity. See `alex/styles.css`.");
	},
});
