import { h1, h2, p, a, pre, div, hr } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "Utilities").href("/edric/style/utilities/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("Utilities").ac("mb").style("color", "var(--prim)");

            p("These are the utility features built into this framework:");
            p("`.zoom-*`: use it if you want to scale an element up or down.");
            p("`pre`: scrolls horizontally on its own if a line is too long.");
            p("Rounded corners: use it if you want an element to not have sharp corners.");
            p("Shadows: use it if you want an element to look raised off the page.");
            p("Text truncation: use it if you want long text to cut off with `...` instead of wrapping or overflowing.");
            p("Hover: use it if you want something to change when the mouse is over it.").ac("mb");

            hr();

            h2("Zoom").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

            p("`.zoom-25` through `.zoom-200`, plus `.zoom-responsive`: scales an element with CSS `zoom`. Same box at three different zoom levels:").ac("mb");

            div.c("flex gap v-center mb", () => {
                div.c("zoom-50", () => p("box")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
                div.c("zoom-100", () => p("box")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
                div.c("zoom-150", () => p("box")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
            });
            pre(`div.c("zoom-50", () => p("box"));
div.c("zoom-100", () => p("box"));
div.c("zoom-150", () => p("box"));`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            h2("Pre").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

            p("`pre`: scrolls horizontally instead of stretching the page. This line is long on purpose, try scrolling it instead of the page:").ac("mb");

            pre(`const thisIsOneVeryLongLineThatWontWrapAndInsteadScrollsHorizontallyInsideThisBoxInsteadOfStretchingTheWholePage = true;`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            h2("Rounded (not native, plain CSS)").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

            p("There's no class for rounded corners in `framework.css`, this is just normal CSS via `.style(\"border-radius\", ...)`. Almost every box on this site uses `0.3em` for a subtle round, here it is next to a fully rounded pill and a circle:").ac("mb");

            div.c("flex gap v-center mb", () => {
                div(() => p("0.3em")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
                div(() => p("pill")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "999px" });
                div().style({ background: "var(--bg)", width: "3em", height: "3em", "border-radius": "50%" });
            });
            pre(`div(() => p("...")).style("border-radius", "0.3em");  // subtle round
div(() => p("...")).style("border-radius", "999px"); // full pill
div(() => p("...")).style("border-radius", "50%");   // circle (needs equal width/height)`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            h2("Shadows (not native, plain CSS)").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

            p("There's no shadow class either, use `.style(\"box-shadow\", ...)`. A few common depths:").ac("mb");

            div.c("flex gap-2em v-center mb", () => {
                div(() => p("small")).style({ background: "white", padding: "0.5em 1em", "border-radius": "0.3em", "box-shadow": "0 1px 3px rgba(0,0,0,0.3)" });
                div(() => p("medium")).style({ background: "white", padding: "0.5em 1em", "border-radius": "0.3em", "box-shadow": "0 4px 8px rgba(0,0,0,0.3)" });
                div(() => p("large")).style({ background: "white", padding: "0.5em 1em", "border-radius": "0.3em", "box-shadow": "0 10px 20px rgba(0,0,0,0.3)" });
            });
            pre(`div(() => p("...")).style("box-shadow", "0 1px 3px rgba(0,0,0,0.3)");  // small
div(() => p("...")).style("box-shadow", "0 4px 8px rgba(0,0,0,0.3)");  // medium
div(() => p("...")).style("box-shadow", "0 10px 20px rgba(0,0,0,0.3)"); // large`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            h2("Text Truncation (not native, plain CSS)").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

            p("Cut off long text with `...` instead of letting it wrap or overflow. Needs `overflow: hidden`, `text-overflow: ellipsis`, and `white-space: nowrap` together, plus a width to truncate against:").ac("mb");

            p("This sentence is way too long to fit, so it gets cut off").style({
                width: "12em",
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap",
                background: "var(--bg)",
                color: "white",
                padding: "0.5em 1em",
                "border-radius": "0.3em"
            }).ac("mb");
            pre(`p("This sentence is way too long...").style({
    width: "12em",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    "white-space": "nowrap"
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            h2("Hover (not native, plain JS)").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

            p("There's no hover class, and inline `.style()` can't target `:hover` either, that needs real CSS. Swap styles with `.on(\"mouseenter\"/\"mouseleave\", ...)` instead:").ac("mb");

            div(() => p("Hover me"))
                .style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em", display: "inline-block", cursor: "pointer" })
                .ac("mb")
                .on("mouseenter", function(){ this.style("background", "var(--prim)"); })
                .on("mouseleave", function(){ this.style("background", "var(--bg)"); });

            pre(`div(() => p("Hover me"))
    .style({ background: "var(--bg)", color: "white" })
    .on("mouseenter", function() { this.style("background", "var(--prim)"); })
    .on("mouseleave", function() { this.style("background", "var(--bg)"); });`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("If you'd rather write a real `:hover` rule instead of JS, that needs a loaded stylesheet, see ", a("Normal CSS").href("/edric/style/css/"), ".");
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}