import { h1, h2, a, div } from "/app.js";

app.$body.ac("theme-1");

export default function() {
    div.c("pad", () => {
        a.c("page-back btn bg mb", "Back").href("../");

        h1("Custom Components").ac("mb").style("color", "var(--prim)");

        h2("Button");
        h2("Forms");
        h2("Navbar");
        h2("Card");
    }).style({ "max-width": "40em", margin: "0 auto" });
}