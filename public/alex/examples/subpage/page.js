import { a, h2, h3, p } from "/app.js";
import nested from "./nested/page.js"

app.$body.ac("theme-1");

export default {
  link() {
    return a.c("page-link", "/alex/examples/subpage/").href("/alex/examples/subpage/");
  },
  render() {
    a.c("page-back", "Back").href("/alex/");
    h2("Alex's subpage");
    h3("Preview");
    nested.preview();
    p("Subpage content with a nested subpage: ", nested.link());
  },
};
