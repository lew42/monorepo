import { h1, h2, p, a, pre, div, img, input, button } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "Example").href("/edric/style/example/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("All Together").ac("mb").style("color", "var(--prim)");

            p("A small card, using a bit of every category above: `Colors`, `Typography`, `Layout`, `Spacing`, `Forms`, `Buttons`, `Media`, and `Utilities`.").ac("mb");

            div.c("flex gap pad mb", () => {
                img().attr("src", "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%25' height='100%25' fill='%235a57ff'/></svg>").style({ width: "4em", height: "4em", "border-radius": "50%" });

                div.c("flex-1 flex v gap", () => {
                    h2("Jane Doe").style("color", "var(--prim)");
                    p("web developer").ac("capitalize");
                    input().attr("placeholder", "Say hello...");
                    button("Follow").ac("btn prim");
                }).style("min-width", "0");
            }).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            p("That card, in code:").ac("mb");

            pre(`div.c("flex gap pad", () => {
    img().attr("src", avatarUrl).style({ width: "4em", height: "4em", "border-radius": "50%" });

    div.c("flex-1 flex v gap", () => {
        h2("Jane Doe").style("color", "var(--prim)");
        p("web developer").ac("capitalize");
        input().attr("placeholder", "Say hello...");
        button("Follow").ac("btn prim");
    });
}).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });`).ac("pad").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}