import { p, Page } from "/app.js";
import { doc, cards } from "../ui/docs.js";

export default new Page({
  meta: import.meta,
  title: "Styles",
  theme: "theme-1",
  content() {
    doc({
      back: "/alex/",
      build() {
      p("`framework.css` is deliberately small. It sets sensible defaults for raw HTML, then hands you a few opt-in utility classes. Nothing is themed until you add a theme class like `theme-1` to the body, so you always start from a clean slate.");
      p("The four pages below are the basics you will reach for first, each with live examples you can inspect:");

      cards(
        {
          title: "HTML",
          desc: "The reset: box-sizing, readable body text, responsive media, full-width inputs.",
          href: "/alex/styles/html/",
        },
        {
          title: "Forms",
          desc: "Inputs, selects, textareas, and the .btn / .prim / .bg button classes.",
          href: "/alex/styles/forms/",
        },
        {
          title: "Flex",
          desc: "The .flex utilities for one-dimensional layouts and spacing.",
          href: "/alex/styles/flex/",
        },
        {
          title: "Grid",
          desc: "The .grid utilities for responsive, wrapping column layouts.",
          href: "/alex/styles/grid/",
        },
        {
          title: "BEM",
          desc: "Alternative CSS naming: keep styles scoped to components with .block, .block__element, .block--modifier.",
          href: "/alex/styles/bem/",
        }
      );
      },
    });
  },
});
