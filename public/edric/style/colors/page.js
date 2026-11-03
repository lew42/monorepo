import { h1, h2, p, a, pre, div, hr } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "Colors").href("/edric/style/colors/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("Colors").ac("mb").style("color", "var(--prime)");

            p("These are the colors built into this framework:");
            p("`--prime` (neon blue): use it if you want text, a button, or a background to stand out.");
            p("`--bg` (gray): use it if you want text, a button, or a background to just be gray.");
            p("`--subtle` (transparent): use it if you want text, a button, or a background to be see-through.").ac("mb");

            hr();

            p("`--prime`: the accent color. Used for `:focus-visible` outlines, checkbox/radio accents, and `.btn.prim`.").ac("mb");

            p("As background:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            p("Badge").ac("pad mb").style({ background: "var(--prime)", color: "white", "border-radius": "0.3em", display: "inline-block" });
            pre(`p("Badge").style({ background: "var(--prime)", color: "white" });`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("As text:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            p("Text using var(--prime)").style("color", "var(--prime)").ac("mb");
            pre(`p("Text").style("color", "var(--prime)");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`--bg`: a dark neutral, used by `.btn.bg`.").ac("mb");

            p("As background:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            p("Badge").ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em", display: "inline-block" });
            pre(`p("Badge").style({ background: "var(--bg)", color: "white" });`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("As text:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            p("Text using var(--bg)").style("color", "var(--bg)").ac("mb");
            pre(`p("Text").style("color", "var(--bg)");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`--subtle`: a translucent black, used for input borders and handy for dividers (every `h2` section title on this site uses it as a `border-bottom`).").ac("mb");

            p("As background:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            p("Badge").ac("pad mb").style({ background: "var(--subtle)", color: "white", "border-radius": "0.3em", display: "inline-block" });
            pre(`p("Badge").style({ background: "var(--subtle)", color: "white" });`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("As text:").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            p("Text using var(--subtle)").style("color", "var(--subtle)").ac("mb");
            pre(`p("Text").style("color", "var(--subtle)");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("All three together: `--bg` for the card, `--prime` for the heading, `--subtle` for the divider under it:").ac("mb");

            div.c("pad mb", () => {
                h2("Notice").style({ color: "var(--prime)", "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" }).ac("mb");
                p("Your changes have been saved.");
            }).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            pre(`div.c("pad", () => {
    h2("Notice").style({
        color: "var(--prime)",
        "border-bottom": "1px solid var(--subtle)",
        "padding-bottom": "0.3em"
    });
    p("Your changes have been saved.");
}).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("Want your own color instead of `--prime`/`--bg`/`--subtle`? Two ways:").ac("mb");

            p("Quick: just use any color value directly, no variable needed:").ac("mb");

            div(() => p("A card using my own color")).ac("pad mb").style({ background: "#e64980", color: "white", "border-radius": "0.3em" });
            pre(`div(() => p("A card")).style({ background: "#e64980", color: "white" });`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("Reusable: define your own variable in your own stylesheet, then use it exactly like `--prime`. Create `/yourname/styles.css`:").ac("mb");

            pre(`:root {
    --accent2: #e64980;
}`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("Load it once, then use `var(--accent2)` anywhere `var(--prime)` works:").ac("mb");

            pre(`app.stylesheet("/yourname/styles.css");

h1("Hello").style("color", "var(--accent2)");`).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}