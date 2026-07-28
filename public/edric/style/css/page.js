import { h1, p, a, pre, div, hr } from "/app.js";

app.$body.ac("theme-1");
app.stylesheet("/edric/style/css/demo.css");

export default {

    link(){
        return a.c("page-link", "Normal CSS").href("/edric/style/css/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("Normal CSS").ac("mb").style("color", "var(--prim)");

            p("Everything on this site so far uses either `framework.css`'s own classes or inline `.style()` calls, but you can always write completely normal CSS too:");
            p("Write a `.css` file, anywhere you like.");
            p("Load it once with `app.stylesheet(url)`.");
            p("Use its classes with `.ac()` / `.c()`, exactly like a framework class.").ac("mb");

            hr();

            p("1. Write a `.css` file. This page's demo lives at `/edric/style/css/demo.css`:").ac("mb");

            pre(`.demo-highlight {
    color: #e64980;
    font-weight: bold;
    text-decoration: underline wavy;
}

.demo-highlight:hover {
    color: #ae3ec9;
}

@media (max-width: 30em) {
    .demo-highlight {
        font-size: 1.3em;
    }
}`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("2. Load it once, anywhere in your `page.js`:").ac("mb");

            pre(`app.stylesheet("/edric/style/css/demo.css");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("3. Use the class like any other:").ac("mb");

            p("Hover me, I'm styled by real CSS").ac("demo-highlight mb");
            pre(`p("Hover me").ac("demo-highlight");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("Why bother with a real stylesheet instead of `.style()`? Anything `.style()` can't do inline: `:hover` (try it above), `:focus`, animations, and `@media` queries (that text also grows on narrow screens, try shrinking the window).");
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}