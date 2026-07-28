import { a, h3, p, Page } from "/app.js";

export default new Page({
  meta: import.meta,
  title: "Nested subpage",
  description: "Preview text",
  theme: "theme-1",
  content() {
    a.c("page-back", "Back").href("../");
    h3("Alex's subpage");
    p("Nested subpage content");
  },
});
