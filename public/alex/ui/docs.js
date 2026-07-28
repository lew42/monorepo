// Shared helpers for Alex's docs. Just functions that build Views —
// exactly the kind of small, reusable piece the framework encourages.
import app, { div, a, h1, h2, h3, p } from "/app.js";

app.stylesheet("/alex/styles.css");

// A doc page shell: a "Back" link, a title, then your content.
//   doc({ title: "Framework", build(){ p("..."); } })
export function doc({ title, back = "../", build }) {
  return div.c("doc", () => {
    div.c("doc-header", () => {
      if (back) a.c("doc-back", "Back").href(back);
      h1(title);
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
