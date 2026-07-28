import { div, h2, p, pre, button, Page } from "/app.js";
import { doc } from "../../ui/docs.js";

export default new Page({
  meta: import.meta,
  title: "BEM",
  theme: "theme-1",
  content() {
    doc({
      back: "/alex/styles/",
      build() {
        p("BEM (Block, Element, Modifier) is a naming convention that keeps styles scoped to their components. Example:");

        pre(`.block            /* standalone component */
.block__element   /* a piece inside the block */
.block--modifier  /* a variant of the block */`);

        p("The framework makes this easy: `c()` chains classes, and the flat CSS means your selectors stay shallow and fast.");

        h2("A responsive card component");
        p("A card block with `__image`, `__title`, `__body`, and `__footer` elements. Padding and font sizes scale fluidly with `clamp()` — no breakpoints needed for the card itself:");

        div.c("demo", () => {
          div.c("card", () => {
            div.c("card__image", "Image");
            div.c("card__body", () => {
              div.c("card__title", "Regular Card");
              p.c("card__text", "A simple card with BEM-scoped styles. Resize the window to see it adapt.");
              div.c("card__footer", () => {
                button.c("card__btn", "Action");
              });
            });
          });
        });

        pre(`div.c("card", () => {
    div.c("card__image", "Image");
    div.c("card__body", () => {
        div.c("card__title", "Regular Card");
        p.c("card__text", "Content here.");
        div.c("card__footer", () => {
            button.c("card__btn", "Action");
        });
    });
});`);

        h2("The responsive CSS");
        p("Fluid values via `clamp()` and `min()` replace breakpoints. The card adapts from phone to desktop in one set of rules:");

        pre(`.card {
    border: 1px solid var(--subtle);
    border-radius: 0.5rem;
    padding: clamp(0.5rem, 2vw, 1rem);
}
.card__image {
    background: var(--bg);
    padding: clamp(1rem, 4vw, 2rem);
    text-align: center;
    font-size: clamp(1.5rem, 4vw, 2rem);
}
.card__body {
    padding: clamp(0.5rem, 2vw, 1rem);
}
.card__title {
    font-weight: 600;
    color: var(--prim);
    margin-bottom: 0.3rem;
    font-size: clamp(1rem, 2.5vw, 1.25rem);
}
.card__text {
    margin: 0;
    color: var(--subtle);
    font-size: clamp(0.8rem, 2vw, 0.9rem);
}
.card__footer {
    margin-top: 1rem;
}
.card__btn {
    padding: 0.4rem 1rem;
    border: 1px solid var(--subtle);
    border-radius: 0.3rem;
    cursor: pointer;
    background: transparent;
    font-size: clamp(0.8rem, 2vw, 1rem);
}`);

        h2("Responsive card list");
        p("A `card-list` block that uses grid to lay out cards. It reflows from one column to many using `auto-fit` and `min()` — the same pattern as `.grid.auto`:");

        div.c("demo", () => {
          div.c("card-list grid auto gap", () => {
            div.c("card", () => {
              div.c("card__image", "Image");
              div.c("card__body", () => {
                div.c("card__title", "Card 1");
                p.c("card__text", "First card in a responsive list.");
              });
            });
            div.c("card", () => {
              div.c("card__image", "Image");
              div.c("card__body", () => {
                div.c("card__title", "Card 2");
                p.c("card__text", "Second card — watch it reflow.");
              });
            });
            div.c("card", () => {
              div.c("card__image", "Image");
              div.c("card__body", () => {
                div.c("card__title", "Card 3");
                p.c("card__text", "Third card fills remaining space.");
              });
            });
          });
        });

        pre(`div.c("card-list grid auto gap", () => {
    div.c("card", () => { /* card 1 */ });
    div.c("card", () => { /* card 2 */ });
    div.c("card", () => { /* card 3 */ });
});`);

        pre(`.card-list {
    --card-min: min(16rem, 100%);
    grid-template-columns: repeat(auto-fit, minmax(var(--card-min), 1fr));
}
/* Override the minimum inline if you want wider cards: */
div.c("card-list", ...).style("--card-min", "min(20rem, 100%)");`);

        h2("Layout modifier: horizontal card");
        p("A `--horizontal` modifier flips the card to a row layout on wide screens, stacking back to a column on narrow ones. Sizing stays fluid; a single breakpoint switches the direction:");

        div.c("demo", () => {
          div.c("card card--horizontal", () => {
            div.c("card__image", "Image");
            div.c("card__body", () => {
              div.c("card__title", "Horizontal Card");
              p.c("card__text", "Image beside text on wide screens, stacked on narrow. Resize to see it switch.");
              div.c("card__footer", () => {
                button.c("card__btn card__btn--prim", "Primary");
              });
            });
          });
        });

        pre(`.card--horizontal {
    display: flex;
    flex-direction: column;
}
@media (min-width: 28rem) {
    .card--horizontal { flex-direction: row; }
}
.card--horizontal > .card__image {
    flex: 0 0 clamp(4rem, 30%, 8rem);
    display: flex;
    align-items: center;
    justify-content: center;
}
.card--horizontal > .card__body { flex: 1; }`);

        h2("Modifiers");
        p("Add a modifier class alongside the block class to change appearance:");

        div.c("demo", () => {
          div.c("card card--featured", () => {
            div.c("card__image", "Image");
            div.c("card__body", () => {
              div.c("card__title", "Featured Card");
              p.c("card__text", "This card uses the --featured modifier.");
              div.c("card__footer", () => {
                button.c("card__btn card__btn--prim", "Featured Action");
              });
            });
          });
        });

        pre(`.card--featured {
    border-color: var(--prim);
    box-shadow: 0 0.25rem 1rem var(--subtle);
}
.card__btn--prim {
    background: var(--prim);
    color: white;
    border-color: var(--prim);
}`);

        h2("Why it works here");
        p("The framework's `View` API and BEM are a natural fit:");

        p("`.c()` chains classes cleanly — `div.c('card card--horizontal')` reads like the CSS it produces.");
        p("No CSS preprocessor needed — plain CSS selectors are flat by design with BEM.");
        p("Fluid responsiveness — `clamp()` and `min()` handle most scaling, with a media query only where fluid math can't reach.");
        p("Components are portable — copy a block's CSS and JS together and it works anywhere, because nothing leaks in or out.");
        p("Modifiers compose — add `card--featured` and `card__btn--prim` independently, no cascade surprises.");

        h2("Notation rules");
        p("Use two underscores for elements: `block__element`, never `block-element` or `block_element`.");
        p("Use two hyphens for modifiers: `block--modifier`, never `block-modifier`.");
        p("Never nest BEM selectors in CSS: `.card__title` not `.card .card__title`.");
        p("Mix block and modifier on the same element: `class=\"card card--featured\"`, not just `class=\"card--featured\"`.");
        p("Prefer `clamp()` and `min()` for responsive values; use a media query only when fluid math can't express the change.");
      },
    });
  },
});
