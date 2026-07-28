import { h1, h2, p, a, pre, div, img, textarea, button, ul, li } from "/app.js";

app.$body.ac("theme-1");

export default function() {
    div.c("pad", () => {
        div.c("flex split mb", () => {
            div.c("flex gap", () => {
                a.c("btn prim", "Framework").href("/edric/framework/");
                a.c("btn bg", "Style").href("/edric/style/");
                a.c("btn", "Custom Components").href("/edric/components/").style({ background: "#0ca678", color: "white" });
            });

            a.c("btn bg", "Download Framework").href("https://github.com/lew42/monorepo").attr("target", "_blank");
        });

        h1("Get Started").ac("mb").style("color", "var(--prim)");

        p("New here? No worries, this page will get you up and running in a couple of minutes. No build tools, no config files to fight with.").ac("mb");

        h2("Why Use This Framework").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

        p("No build step: plain ES modules, served straight from disk. Edit a file, refresh, done.").ac("mb");
        p("No CSS to fight: `framework.css` only gives you a reset and a few opt-in utility classes. You start from nothing and add only what you need.").ac("mb");
        p("A tiny API: really just `App` and `View`. Learn a handful of methods (`.c()`, `.ac()`, `.append()`, `.style()`...) and you can build any page.").ac("mb");

        h2("Install (Windows)").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

        p("You'll need Node.js installed first. If you don't have it, grab it from `nodejs.org`, it only takes a minute.").ac("mb");

        p("Then open a terminal (VS Code has one built in: View > Terminal) and run these four lines:").ac("mb");

        pre(`git clone https://github.com/lew42/monorepo.git
cd monorepo
npm install
node server.js`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

        p("In plain terms: line 1 downloads the code, line 2 steps into the folder, line 3 installs a few small dependencies, and line 4 starts your local server.").ac("mb");

        p("Now open `http://localhost` in your browser. That's it, you're running the framework.").ac("mb");

        h2("Start Using It").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

        p("Every site here gets its own folder under `/public/`, named after whoever built it, this very page lives inside one of those folders. When you're ready to build something, make your own folder, like `/public/yourname/`, and add a `page.js` inside it. It'll show up at `/yourname/`.").ac("mb");

        p("Every HTML tag is a function you can call from `/app.js`. Calling one adds it straight to the page, so your `page.js` might start out looking like this:").ac("mb");

        pre(`import { h1, p } from "/app.js";

export default function() {
    h1("Hello World");
    p("Some text");
}`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

        p("No HTML file to write, no JSX, nothing to compile. Save, refresh your browser at `/yourname/`, and your change shows up.").ac("mb");

        p("The URL maps straight to the file: `/yourname/` loads `/yourname/page.js`, the same pattern this page follows.").ac("mb");

        h2("Putting It Together").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

        p("A small notes widget, using `App` and `View` (Framework) together with `framework.css` classes (Style):").ac("mb");

        div.c("pad mb", () => {
            h2("Quick Notes").style("color", "var(--prim)").ac("mb");

            div.c("flex gap mb", () => {
                img().attr("src", "/edric/image/seagul.jpeg").style({ width: "3em", height: "3em", "border-radius": "0.3em" });
                textarea.c("flex-1 auto").text("Ship the newsletter draft by Friday.");
            }).style("min-width", "0");

            div.c("flex gap mb", () => {
                button("Save").ac("btn prim");
                button("Clear").ac("btn bg");
            });

            ul(() => {
                li("Review pull request #42");
                li("Book flights for the meetup").ac("uppercase");
                li("Reply to the last message");
            });
        }).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

        app.loaded.then(() => console.log("Quick Notes ready"));

        pre(`div.c("pad", () => {
    h2("Quick Notes").style("color", "var(--prim)");

    div.c("flex gap", () => {
        img().attr("src", "/edric/image/seagul.jpeg").style({ width: "3em", height: "3em", "border-radius": "0.3em" });
        textarea.c("flex-1 auto").text("Ship the newsletter draft by Friday.");
    });

    div.c("flex gap", () => {
        button("Save").ac("btn prim");
        button("Clear").ac("btn bg");
    });

    ul(() => {
        li("Review pull request #42");
        li("Book flights for the meetup").ac("uppercase");
        li("Reply to the last message");
    });
}).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

app.loaded.then(() => console.log("Quick Notes ready"));`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

        p("`img()`, `textarea()`, `button()`, `ul()`/`li()`, `.style()`, `.ac()`, and `app.loaded` are all `View`/`App` (Framework). `\"btn prim\"`, `\"uppercase\"`, `\"auto\"`, `\"flex\"` are all `framework.css` classes (Style).").ac("mb");

        p("Ready for more? The Framework and Style buttons above go deeper into what you can build with.");
    }).style({ "max-width": "40em", margin: "0 auto" });
}