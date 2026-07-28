import { h2, p, pre, Page } from "/app.js";
import { doc } from "../../ui/docs.js";

export default new Page({
  meta: import.meta,
  title: "App",
  theme: "theme-1",
  content() {
    doc({
      back: "/alex/framework/",
      build() {
        p("You almost never create an `App` yourself. `app.js` does it once and exposes it as the global `app`, which you can use from any page.");

        pre(`import app from "/app.js";`);

        h2("How a page loads");
        p("When you visit a URL, `App` turns it into a file path and imports it:");
        pre(`/            ->  /page.js
/alex/       ->  /alex/page.js
/alex/x/     ->  /alex/x/page.js
/alex/x      ->  /alex/x.page.js`);
        p("A trailing slash loads `page.js` inside that folder; no slash loads a sibling `name.page.js`. Whatever your `page.js` builds gets appended to the page. If the import throws, `App` shows a page-load error instead of a blank screen.");

        h2("What a page.js exports");
        p("Prefer a `Page` — it gives you a title, a url, and registration for SPA navigation:");
        pre(`import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "My page",
    content(){ p("Hi"); }
});`);
        p("A plain function, an object with `render()`, or nothing at all (build at the top level) also work — the App duck-types them — but those pages are invisible to the Router, so links to them load the full page.");

        h2("Handy on every page");
        p("`app.$body`:the `<body>` View. Better: give your Page a `theme` property and the class is added while the page is active, removed when you leave.");
        p("`app.$app`:the `<div class=\"app\">` your page renders into.");
        p("`app.stylesheet(\"/alex/styles.css\")`:load a stylesheet. Everything is opt-in, so nothing but `framework.css` applies until you ask for it.");
        p("`app.font(name)`:load one of the predefined fonts.");
        p("`app.ready`:a promise that resolves once the page and its stylesheets have finished loading.");
      },
    });
  },
});
