import app, { p } from "/app.js";
import { doc, cards } from "../ui/docs.js";

app.$body.ac("theme-1");

export default function () {
  doc({
    title: "Framework",
    back: "/alex/",
    build() {
      p("The whole framework is two classes. Learn these and you can build any page here.");

      p("`App` runs once, when the site loads. It creates the global `app`, reads the URL, and imports the matching `page.js`.");
      p("`View` is a thin wrapper around a single DOM element. Every tag function you import (`h1`, `p`, `div`, `a`, ...) returns one, with chainable helpers for classes, content, attributes, and events.");

      cards(
        {
          title: "App",
          desc: "Boots the site, maps the URL to a page.js, loads stylesheets and fonts.",
          href: "/alex/framework/app/",
        },
        {
          title: "View",
          desc: "Wraps one element. The methods you use to build every page.",
          href: "/alex/framework/view/",
        }
      );
    },
  });
}
