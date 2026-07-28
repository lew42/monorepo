import app, { h2, p, pre } from "/app.js";
import { doc } from "../../ui/docs.js";

app.$body.ac("theme-1");

export default {
  render() {
    doc({
      title: "View",
      back: "/alex/framework/",
      build() {
        p("Every tag function returns a `View` wrapping one DOM element. You build a page by calling those functions and chaining methods on what they return.");
        pre(`import { div, p } from "/app.js";

div.c("flex gap", () => {
    p("child 1");
    p("child 2");
});`);
        p("Calling a tag function adds it to the page automatically. When you pass a function as the last argument, the tags created inside it become children.");

        h2("Create with a class");
        p("`div.c(\"flex gap\")`:every tag function has a `.c()` shortcut that creates the element with those classes already on it.");

        h2("Classes");
        p("`.ac(\"a b\")`:add class(es).");
        p("`.rc(\"a\")`:remove class(es).");
        p("`.hc(\"a\")`:has class? returns true/false.");
        p("`.tc(\"a\")`:toggle class(es).");

        h2("Content");
        p("`.append(...)`:add children — Views, strings, DOM nodes, arrays, or a build function.");
        p("`.prepend(...)`:same, but at the start.");
        p("`.empty(...)`:remove all children, then optionally append new ones.");
        p("`.text(v)` / `.html(v)`:get or set text or inner HTML.");
        p("Inside `p(...)`, text wrapped in backticks turns into `code` automatically.");

        h2("Attributes & events");
        p("`.attr(name, v)`:get or set an attribute.");
        p("`.href(url)`:shortcut for `.attr(\"href\", url)`.");
        p("`.style(prop, v)`:get or set inline CSS. Pass an object to set several at once.");
        p("`.on(event, cb)` / `.click(cb)`:listen for events. `cb` runs with `this` set to the View.");

        h2("Layout & lifecycle");
        p("`.hide()` / `.show()` / `.toggle()`:control `display`.");
        p("`.remove()` / `.replace(view)`:take it off the page or swap it out.");
        p("`.load(meta, url)` / `.lazy(meta, url)`:import another module and append its default export (`lazy` waits its turn).");

        h2("Make your own");
        p("Two ways to build a reusable piece: a plain function that builds Views, or a class with a `.render()` method. You can also `extend View` for something more stateful. The helpers on this docs site (`doc()`, `cards()`) are just the function approach.");
        pre(`export function card(title){
    return div.c("card", () => h2(title));
}`);
      },
    });
  },
};
