import { h1, h2, p, a, div } from "/app.js";
import Colors from "./colors/page.js";
import Typography from "./typography/page.js";
import Layout from "./layout/page.js";
import Spacing from "./spacing/page.js";
import Forms from "./forms/page.js";
import Buttons from "./buttons/page.js";
import Media from "./media/page.js";
import Utilities from "./utilities/page.js";
import Example from "./example/page.js";
import Css from "./css/page.js";
import Tailwind from "./tailwind/page.js";

app.$body.ac("theme-1");

export default function() {
    div.c("pad", () => {
        a.c("page-back btn bg mb", "Back").href("../");

        h1("Style").ac("mb").style("color", "var(--prim)");

        p("Everything below comes from `framework.css`, grouped the way a style guide usually is: colors, type, layout, spacing, forms, buttons, media, and a few small utilities.").ac("mb");

        h2("Categories").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

        div.c("flex gap wrap mb", () => {
            Colors.link().ac("btn").style({ background: "#5a57ff", color: "white" });
            Typography.link().ac("btn").style({ background: "#e8590c", color: "white" });
            Layout.link().ac("btn").style({ background: "#2f9e44", color: "white" });
            Spacing.link().ac("btn").style({ background: "#1971c2", color: "white" });
            Forms.link().ac("btn").style({ background: "#e64980", color: "white" });
            Buttons.link().ac("btn").style({ background: "#f08c00", color: "white" });
            Media.link().ac("btn").style({ background: "#ae3ec9", color: "white" });
            Utilities.link().ac("btn").style({ background: "#42404B", color: "white" });
        });

        p("Or see them ", Example.link(), " all together in one card, ", Css.link(), " to write your own plain CSS instead, or ", Tailwind.link(), " if you'd rather use that.");
    }).style({ "max-width": "40em", margin: "0 auto" });
}