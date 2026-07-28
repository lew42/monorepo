import app, { div, p, h2 } from "/app.js";
import nav from "/nav.js";
import { cards } from "./ui/docs.js";
import subpage from "./examples/subpage/page.js";

app.$body.ac("theme-1");

export default function () {
  nav();

  div.c("doc", () => {
    h2("Framework Guide /Alex/").style("margin-top", "0");

    p("A short, friendly tour of this framework for people who have never seen it before. There is no build step and no config: two classes (`App` and `View`), a handful of opt-in CSS utilities, and plain ES modules served straight from disk.");

    p("Start with whichever half you need:");

    cards(
      {
        title: "Framework",
        desc: "The two classes that run everything: App boots the site, View is every element.",
        href: "/alex/framework/",
      },
      {
        title: "Styles",
        desc: "The opt-in CSS in framework.css: html reset, forms, flex, and grid.",
        href: "/alex/styles/",
      }
    );

    h2("Examples:");
    p("Pages can link to sub-pages that live in their own folders: ", subpage.link());
  });
}
