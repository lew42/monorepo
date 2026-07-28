import app, { div, h2, p, pre } from "/app.js";
import { doc } from "../../ui/docs.js";

app.$body.ac("theme-1");

function boxes(n) {
  return () => {
    for (let i = 1; i <= n; i++) div(String(i));
  };
}

export default {
  render() {
    doc({
      title: "Grid",
      back: "/alex/styles/",
      build() {
        p("`.grid` turns on CSS grid. The utility classes give you responsive columns without writing any media queries.");

        h2("Auto-fit columns");
        p("`.grid.auto` fills the row with as many columns as fit, each at least `--column` (14em) wide, then wraps. Resize the window to watch it reflow.");
        div.c("demo boxes grid auto gap", boxes(6));
        pre(`div.c("grid auto gap", () => {
    div("1"); div("2"); div("3"); /* ... */
});`);

        h2("Up to three across");
        p("`.grid.three` behaves like `auto` but never grows past three columns — nice for card layouts that should not stretch too wide.");
        div.c("demo boxes grid three gap", boxes(6));
        pre(`div.c("grid three gap", ...);`);

        h2("Tuning the column width");
        p("Both layouts key off the `--column` custom property (14em by default). Override it inline to change the breakpoint — no new CSS required:");
        div.c("demo boxes grid auto gap", boxes(6)).style("--column", "8em");
        pre(`div.c("grid auto gap", ...).style("--column", "8em");`);

        h2("Gaps");
        p("`.gap` gives a 1em gap; `.gap-2em` doubles it. The same classes work on flex and grid alike.");
      },
    });
  },
};
