import { h1, p, a, app } from "/app.js";
import HTML from "./HTML/page.js";
import b from "./b/page.js";
import c from "./c/page.js";
import d from "./d/page.js";
import e from "./e/page.js";

app.$body.ac("theme-1");

export default function() {
    a.c("page-back", "Back").href("../");

    h1("Style");
    p("Basic style examples: ", HTML.link(), ", ", b.link(), ", ", c.link(), ", ", d.link(), ", and ", e.link());
}
