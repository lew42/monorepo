import { h1, p, a, pre, div, ul, ol, li, hr } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "Typography").href("/edric/style/typography/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("Typography").ac("mb").style("color", "var(--prim)");

            p("These are the typography features built into this framework:");
            p("Default text: use it if you just want normal, readable text, no class needed.");
            p("Word wrap: use it if you have a long word or link that would otherwise break your layout.");
            p("`pre` / `code`: use it if you want text to look like code, monospaced.");
            p("`ul` / `ol`: use it if you want a list.");
            p("`.capitalize` / `.uppercase`: use it if you want to change the casing of text.").ac("mb");

            hr();

            p("Body text uses a system font, `line-height: 1.5`, and a responsive size that scales between `16px` and `20px` with the viewport.").ac("mb");

            p("Live:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            p("This sentence is the example, it uses no extra classes at all, that's just what text looks like by default.").ac("mb");

            hr();

            p("Long words wrap instead of overflowing (`overflow-wrap: break-word`).").ac("mb");

            p("Live:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            p("https://www.example.com/a/very/long/url/that/would/otherwise/overflow/its/container/if/it/couldnt/wrap").ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
            p("Code:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            pre(`p("a-very-long-unbreakable-string...");
// wraps on its own, no class needed`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`pre` and `code` use a monospace font.").ac("mb");

            p("Live:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            pre(`const example = "monospace";`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
            p("This sentence has inline `code` in it too, from wrapping words in backticks.").ac("mb");
            p("Code:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            pre(`pre('const example = "monospace";');

p("This has inline \`code\` in it.");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`ul` is a bulleted list (unordered, item order doesn't matter). `ol` is a numbered list (ordered, item order matters). Both get a smaller left padding than the browser default.").ac("mb");

            p("Live:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            ul.c("mb", () => {
                li("First item");
                li("Second item");
            });
            ol.c("mb", () => {
                li("First step");
                li("Second step");
            });
            p("Code:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            pre(`ul(() => {
    li("First item");
    li("Second item");
});

ol(() => {
    li("First step");
    li("Second step");
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`.capitalize` / `.uppercase` transform text. Same words, three ways:").ac("mb");

            p("Live:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            p("hello world (plain)").ac("mb");
            p("hello world (capitalize)").ac("capitalize mb");
            p("hello world (uppercase)").ac("uppercase mb");
            p("Code:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            pre(`p("hello world");                   // hello world
p("hello world").ac("capitalize"); // Hello World
p("hello world").ac("uppercase");  // HELLO WORLD`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("All of it together, a little article preview:").ac("mb");

            div.c("pad mb", () => {
                p("category").ac("uppercase mb");
                p("This paragraph uses the default font and line-height, no class needed. It links out to the `View` docs for the full example.").ac("mb");
                pre(`npm install`).ac("pad mb").style({ background: "var(--subtle)", color: "white", "border-radius": "0.3em" });
                ul(() => {
                    li("Read the docs").ac("capitalize");
                    li("Run the example");
                });
            }).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            pre(`div.c("pad", () => {
    p("category").ac("uppercase");
    p("This paragraph uses the default font, no class needed.");
    pre("npm install");
    ul(() => {
        li("Read the docs").ac("capitalize");
        li("Run the example");
    });
}).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });`).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}