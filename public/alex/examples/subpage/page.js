import { a, h3, p, Page } from "/app.js";
import nested from "./nested/page.js";

export default new Page({
  meta: import.meta,
  title: "Alex's subpage",
  theme: "theme-1",
  children: [nested],
  content() {
    a.c("page-back", "Back").href("/alex/");
    h3("Preview");
    nested.preview();
    p("Subpage content with a nested subpage: ", nested.link());
  },
});
