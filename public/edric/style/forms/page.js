import { h1, p, a, pre, div, input, select, option, fieldset, legend, textarea, hr } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "Forms").href("/edric/style/forms/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("Forms").ac("mb").style("color", "var(--prim)");

            p("These are the form features built into this framework:");
            p("`input`, `select`, `textarea`: use them for form fields, they inherit the page's font and get a subtle border for free.");
            p("`select`: use it if you want a dropdown, its arrow is styled for you too.");
            p("`fieldset` / `legend`: use them to group related fields together.");
            p("`textarea.auto`: use it if you want a textarea that grows instead of scrolling.").ac("mb");

            hr();

            p("`input`, `select`, `textarea` inherit the page's font, default to `width: 100%`, and get padding plus a subtle border. Here's a live one:").ac("mb");

            input().attr("placeholder", "Type here...").ac("mb");
            pre(`input().attr("placeholder", "Type here...");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`select`: the browser's default arrow is swapped for a plain custom one:").ac("mb");

            select(() => {
                option("Option 1");
                option("Option 2");
            }).ac("mb");
            pre(`select(() => {
    option("Option 1");
    option("Option 2");
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`fieldset > p:first-of-type`: no extra top margin, so the legend and first paragraph sit close together:").ac("mb");

            fieldset(() => {
                legend("Section");
                p("First paragraph, right under the legend, no extra gap.");
            }).style({ border: "1px solid var(--subtle)", "border-radius": "0.3em", padding: "1em" }).ac("mb");
            pre(`fieldset(() => {
    legend("Section");
    p("First paragraph, right under the legend.");
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            hr();

            p("`textarea.auto`: grows to fit its content instead of scrolling:").ac("mb");

            textarea.c("auto").text("This textarea grows\nas you add more lines,\ninstead of scrolling.").ac("mb");
            pre(`textarea.c("auto").text("Some\\nmulti-line\\ncontent...");`).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}