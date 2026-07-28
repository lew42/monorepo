import app, { div, h2, p, pre } from "/app.js";
import { doc } from "../../ui/docs.js";

app.$body.ac("theme-1");

// small helper: a labelled demo row of boxes
function row(...labels) {
  return () => {
    for (const l of labels) div(l);
  };
}

export default {
  render() {
    doc({
      title: "Flex",
      back: "/alex/styles/",
      build() {
        p("`.flex` turns on flexbox. Compose it with the modifier classes below. `.gap` adds spacing between children — you will use it constantly.");

        h2("A row with gaps");
        div.c("demo boxes flex gap", row("1", "2", "3"));
        pre(`div.c("flex gap", () => {
    div("1"); div("2"); div("3");
});`);

        h2("Stack vertically");
        p("`.flex.v` switches the direction to a column.");
        div.c("demo boxes flex v gap", row("1", "2", "3"));
        pre(`div.c("flex v gap", ...);`);

        h2("Even columns");
        p("`.flex.all-1` makes every child share the space equally. `.flex.auto` lets children wrap once they get narrower than `--column` (14em).");
        div.c("demo boxes flex gap all-1", row("1", "2", "3"));
        pre(`div.c("flex gap all-1", ...);`);

        h2("Push apart");
        p("`.flex.split` pushes children to the two ends — handy for a header with a title on the left and actions on the right.");
        div.c("demo boxes flex split", row("left", "right"));
        pre(`div.c("flex split", ...);`);

        h2("Centering");
        p("`.flex.h-center` centers on the main axis, `.flex.v-center` on the cross axis. Combine them to center both ways.");
        div.c("demo boxes flex gap h-center v-center", row("centered")).style("min-height", "5em");

        h2("Spacing utilities");
        p("`.pad` adds padding to an element; `.all-pad` pads every child. `.mb` adds a bottom margin. These pair well with flex layouts.");
      },
    });
  },
};
