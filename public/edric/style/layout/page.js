import { h1, p, a, pre, div, hr } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "Layout").href("/edric/style/layout/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("Layout").ac("mb").style("color", "var(--prim)");

            p("These are the layout features built into this framework:");
            p("Full-height page: use it if you want your page to fill the whole screen.");
            p("`.flex`: use it if you want to arrange things in a row or column.");
            p("`.grid`: use it if you want to arrange things in a grid.").ac("mb");

            hr();

            p("`* { box-sizing: border-box }`: sizes behave the way you'd expect, padding and border are included in the width you set.").ac("mb");
            p("`html`, `body`, `.app`: set to fill the screen (`height: 100%`), with a subtle custom `scrollbar-color` too.").ac("mb");

            hr();

            p("`.flex`: arranges children in a row. Add `.v` for a column instead, `.split` to push children apart, and `.flex-1` on a child to make it fill the leftover space:").ac("mb");

            div.c("flex gap mb", () => {
                div.c("flex-1", () => p("flex-1")).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em", "text-align": "center" });
                div.c("flex-1", () => p("flex-1")).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em", "text-align": "center" });
            });
            pre(`div.c("flex gap", () => {
    div.c("flex-1", () => p("Column 1"));
    div.c("flex-1", () => p("Column 2"));
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("Heads up: a child with a long unbreakable line (like a `pre` block) can force the whole row to overflow. If that happens, add `.style(\"min-width\", \"0\")` to the child.").ac("mb");

            hr();

            p("`.grid`: arranges children in a grid. `.grid.auto` fits as many equal-width columns as it can, and wraps automatically on smaller screens:").ac("mb");

            div.c("grid auto gap mb", () => {
                div(() => p("A")).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em", "text-align": "center" });
                div(() => p("B")).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em", "text-align": "center" });
                div(() => p("C")).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em", "text-align": "center" });
            });
            pre(`div.c("grid auto gap", () => {
    div(() => p("A"));
    div(() => p("B"));
    div(() => p("C"));
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("Setting gap, padding, and margin on a `.flex` or `.grid` works the same way:").ac("mb");

            p("Gap: use `.gap` (1em) or `.gap-2em` (2em), or set your own with `.style(\"gap\", ...)`:").ac("mb");

            div.c("flex", () => {
                div(() => p("A")).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
                div(() => p("B")).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
            }).style({ gap: "3em", "margin-bottom": "1em" });
            pre(`div.c("flex", () => { ... }).style("gap", "3em");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("Padding: use `.pad`, or set your own with `.style(\"padding\", ...)`:").ac("mb");

            div.c("flex gap", () => {
                div(() => p("A")).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
                div(() => p("B")).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
            }).style({ padding: "2em", background: "var(--subtle)", "border-radius": "0.3em", "margin-bottom": "1em" });
            pre(`div.c("flex gap", () => { ... }).style("padding", "2em");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("Margin: use `.mb`, or set your own with `.style(\"margin\", ...)`, this spaces the whole container from what comes after it. It won't space the children apart though, remember `.flex > * { margin: 0 }` resets that, use `.gap` for spacing between children instead:").ac("mb");

            pre(`div.c("flex gap", () => { ... }).style("margin-bottom", "2em");`).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}