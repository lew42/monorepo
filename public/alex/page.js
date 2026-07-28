import { div, p, h2, Page } from "/app.js";
import nav from "/nav.js";
import { cards } from "./ui/docs.js";
import subpage from "./examples/subpage/page.js";

export default new Page({
  meta: import.meta,
  title: "Framework Guide /Alex/",
  theme: "theme-1",
  children: [subpage],
  content() {
    nav();

    div.c("doc", () => {
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
  },
});
