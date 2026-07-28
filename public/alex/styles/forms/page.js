import app, { div, h2, p, pre, form, fieldset, legend, label, input, select, option, textarea, button } from "/app.js";
import { doc } from "../../ui/docs.js";

app.$body.ac("theme-1");

export default {
  render() {
    doc({
      title: "Forms",
      back: "/alex/styles/",
      build() {
        p("Form controls are styled straight out of the box: padded, bordered, and full-width. Buttons get a couple of opt-in color classes.");

        h2("Buttons");
        p("`button` and `.btn` are padded with a pointer cursor. Add `.prim` for the accent color or `.bg` for the dark background. `.btn` lets any element (like an `a`) look like a button.");
        div.c("demo flex gap", () => {
          button("Plain");
          button.c("prim", "Primary");
          button.c("bg", "Background");
        });
        pre(`button("Plain");
button.c("prim", "Primary");
button.c("bg", "Background");`);

        h2("A whole form");
        p("Wrap fields in a `fieldset` for a grouped, bordered block. Inputs, selects, and textareas fill the width automatically:");
        div.c("demo", () => {
          form(() => {
            fieldset(() => {
              legend("Sign up");

              label("Name");
              input().attr("type", "text").attr("placeholder", "Ada Lovelace");

              label("Role").style("display", "block").style("margin-top", "0.75em");
              select(() => {
                option("Newbie");
                option("Pro");
              });

              label("About").style("display", "block").style("margin-top", "0.75em");
              textarea.c("auto").attr("placeholder", "A few words...");

              div.c("flex gap", () => {
                button.c("prim", "Submit");
                button("Cancel");
              }).style("margin-top", "1em");
            });
          });
        });

        h2("Auto-growing textarea");
        p("`textarea.auto` grows to fit its content as you type — that is the `.auto` class in the demo above.");
        pre(`textarea.c("auto");`);
      },
    });
  },
};
