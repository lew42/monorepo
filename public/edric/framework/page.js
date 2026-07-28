import { h1, h2, p, a, pre, div } from "/app.js";
import App from "./app/page.js";
import View from "./view/page.js";

app.$body.ac("theme-1");

export default function() {
    div.c("pad", () => {
        a.c("page-back btn bg mb", "Back").href("../");

        h1("Framework").ac("mb").style("color", "var(--prim)");

        h2("Full Reference").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

        div.c("flex gap mb", () => {
            App.link().ac("btn prim");
            View.link().ac("btn bg");
        });

        p("The whole framework is really just two classes.").ac("mb");

        h2("The Two Classes").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

        p("`App` boots the site once: it creates `window.app`, and loads your `page.js` based on the current URL.").ac("mb");
        p("`View` is what every tag function (`h1, p, div, a`...) returns. It wraps one DOM element and gives you chainable helpers to build with.").ac("mb");

        h2("Example").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

        p("Building with `View` looks like this:").ac("mb");

        pre(`div.c("flex gap", () => {
    p("child 1");
    p("child 2");
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
    }).style({ "max-width": "40em", margin: "0 auto" });
}