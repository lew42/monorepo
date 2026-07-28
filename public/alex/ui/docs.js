// Shared helpers for Alex's docs. Just functions that build Views —
// exactly the kind of small, reusable piece the framework encourages.
import app, { div, a, h3, p } from "/app.js";

app.stylesheet("/alex/styles.css");

// A doc page shell: a "Back" link, then your content. The h1 comes from the
// Page itself (`title` renders as h1.page-title above this shell).
//   doc({ back: "/alex/", build(){ p("..."); } })
export function doc({ back = "../", build }) {
  return div.c("doc", () => {
    if (back)
      div.c("doc-header", () => {
        a.c("doc-back", "Back").href(back);
      });
    build();
  });
}

// A grid of link cards.
//   cards({ title, desc, href }, { title, desc, href }, ...)
export function cards(...items) {
  return div.c("doc-cards", () => {
    for (const item of items) {
      a.c("doc-card", () => {
        h3(item.title);
        p(item.desc);
      }).href(item.href);
    }
  });
}
