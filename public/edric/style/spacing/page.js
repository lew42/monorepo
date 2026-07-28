import { h1, p, a, pre, div, hr } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "Spacing").href("/edric/style/spacing/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("Spacing").ac("mb").style("color", "var(--prim)");

            p("These are the spacing features built into this framework:");
            p("`.pad`: use it if you want padding inside an element.");
            p("`.all-pad`: use it if you want to pad every child instead of the container.");
            p("`.mb`: use it if you want space below an element, before the next one starts.");
            p("`.gap` / `.gap-2em`: use it if you want space between flex/grid children.");
            p("`hr`: use it if you want a divider line with extra breathing room.").ac("mb");

            hr();

            p("`body`: no default margin, ambient like this page's own default spacing.").ac("mb");

            hr();

            p("`.pad`: `padding: 1em`. There's only the one class, for anything else set your own with `.style(\"padding\", ...)`. A border is added here just to make the padding visible, here's `1em` through `4em` side by side:").ac("mb");

            p("1em (`.pad`)").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            div.c("pad mb", () => p("content")).style({ border: "1px solid var(--subtle)", "border-radius": "0.3em" });

            p("2em (custom)").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            div(() => p("content")).ac("mb").style({ border: "1px solid var(--subtle)", "border-radius": "0.3em", padding: "2em" });

            p("3em (custom)").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            div(() => p("content")).ac("mb").style({ border: "1px solid var(--subtle)", "border-radius": "0.3em", padding: "3em" });

            p("4em (custom)").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            div(() => p("content")).ac("mb").style({ border: "1px solid var(--subtle)", "border-radius": "0.3em", padding: "4em" });

            pre(`div.c("pad", () => p("content"));                      // 1em padding
div(() => p("content")).style("padding", "2em"); // 2em padding
div(() => p("content")).style("padding", "3em"); // 3em padding
div(() => p("content")).style("padding", "4em"); // 4em padding`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("Padding on just one side, use `.style(\"padding-left\"/\"padding-right\"/\"padding-top\"/\"padding-bottom\", ...)`:").ac("mb");

            div.c("flex gap wrap mb", () => {
                div.c("pad", () => p("padding-left")).style({ border: "1px solid var(--subtle)", "border-radius": "0.3em", "padding-left": "2em" });
                div.c("pad", () => p("padding-right")).style({ border: "1px solid var(--subtle)", "border-radius": "0.3em", "padding-right": "2em" });
                div.c("pad", () => p("padding-top")).style({ border: "1px solid var(--subtle)", "border-radius": "0.3em", "padding-top": "2em" });
                div.c("pad", () => p("padding-bottom")).style({ border: "1px solid var(--subtle)", "border-radius": "0.3em", "padding-bottom": "2em" });
            });
            pre(`div.c("pad").style("padding-left", "2em");
div.c("pad").style("padding-right", "2em");
div.c("pad").style("padding-top", "2em");
div.c("pad").style("padding-bottom", "2em");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("`.all-pad > *`: pads every direct child instead of the container itself:").ac("mb");

            div.c("all-pad flex gap mb", () => {
                div(() => p("one")).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
                div(() => p("two")).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
            });
            pre(`div.c("all-pad flex gap", () => {
    div(() => p("one"));
    div(() => p("two"));
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`.mb`: `margin-bottom: 1em`, space below a box before the next one starts:").ac("mb");

            div.c("mb", () => p("first")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
            div(() => p("second")).ac("mb").style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
            pre(`div.c("mb", () => p("first"));
div(() => p("second"));`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("Margin on just one side, use `.style(\"margin-left\"/\"margin-right\"/\"margin-top\"/\"margin-bottom\", ...)`. A border box is drawn around each so the push is visible:").ac("mb");

            div.c("grid auto gap mb", () => {
                div.c("pad", () => {
                    div(() => p("margin-left")).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em", "margin-left": "2em" });
                }).style({ border: "1px solid var(--subtle)", "border-radius": "0.3em" });

                div.c("pad", () => {
                    div(() => p("margin-right")).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em", "margin-right": "2em" });
                }).style({ border: "1px solid var(--subtle)", "border-radius": "0.3em" });

                div.c("pad", () => {
                    div(() => p("margin-top")).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em", "margin-top": "2em" });
                }).style({ border: "1px solid var(--subtle)", "border-radius": "0.3em" });

                div.c("pad", () => {
                    div(() => p("margin-bottom")).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em", "margin-bottom": "2em" });
                }).style({ border: "1px solid var(--subtle)", "border-radius": "0.3em" });
            });
            pre(`div(() => p("...")).style("margin-left", "2em");
div(() => p("...")).style("margin-right", "2em");
div(() => p("...")).style("margin-top", "2em");
div(() => p("...")).style("margin-bottom", "2em");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`.gap` / `.gap-2em`: gap between flex/grid children. Those two classes cover `1em` and `2em`, for anything else set your own with `.style(\"gap\", ...)`. Here's `1em` through `4em` side by side:").ac("mb");

            p("1em (`.gap`)").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            div.c("flex gap mb", () => {
                div(() => p("a")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
                div(() => p("b")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
            });

            p("2em (`.gap-2em`)").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            div.c("flex gap-2em mb", () => {
                div(() => p("a")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
                div(() => p("b")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
            });

            p("3em (custom)").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            div.c("flex mb", () => {
                div(() => p("a")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
                div(() => p("b")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
            }).style("gap", "3em");

            p("4em (custom)").ac("mb").style({ "font-style": "italic", opacity: "0.7" });
            div.c("flex mb", () => {
                div(() => p("a")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
                div(() => p("b")).style({ background: "var(--bg)", color: "white", padding: "0.5em 1em", "border-radius": "0.3em" });
            }).style("gap", "4em");

            pre(`div.c("flex gap", () => { ... });     // 1em gap
div.c("flex gap-2em", () => { ... }); // 2em gap
div.c("flex", () => { ... }).style("gap", "3em"); // 3em gap
div.c("flex", () => { ... }).style("gap", "4em"); // 4em gap`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`hr`: `margin: 3em 0`, a lot more breathing room than the browser default. That's a live one below:").ac("mb");

            hr();
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}