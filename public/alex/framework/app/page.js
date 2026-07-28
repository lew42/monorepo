import app, { h2, p, pre } from "/app.js";
import { doc } from "../../ui/docs.js";

app.$body.ac("theme-1");

export default {
  render() {
    doc({
      title: "App",
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
        p("Three shapes all work as the `default` export:");
        pre(`// 1. a function
export default function(){ h1("Hi"); }

// 2. an object with render()
export default { render(){ h1("Hi"); } };

// 3. nothing — just build at the top level
h1("Hi");`);
        p("Prefer a function or a `render()` method for anything you might want to `import` elsewhere, so it does not draw itself the moment it is imported.");

        h2("Handy on every page");
        p("`app.$body`:the `<body>` View. Add a theme class with `app.$body.ac(\"theme-1\")`.");
        p("`app.$app`:the `<div class=\"app\">` your page renders into.");
        p("`app.stylesheet(\"/alex/styles.css\")`:load a stylesheet. Everything is opt-in, so nothing but `framework.css` applies until you ask for it.");
        p("`app.font(name)`:load one of the predefined fonts.");
        p("`app.ready`:a promise that resolves once the page and its stylesheets have finished loading.");
      },
    });
  },
};
