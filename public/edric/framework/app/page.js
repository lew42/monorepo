import { h1, h2, p, a, pre, div } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "App").href("/edric/framework/app/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("App").ac("mb").style("color", "var(--prim)");

            p("`window.app` is created once when the site boots. Here's how to use each piece of it.").ac("mb");

            h2("app.$body").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });
            p("The `<body>` View. Every page calls this to opt into the theme.").ac("mb");
            pre(`app.$body.ac("theme-1");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            h2("app.$app").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });
            p("The root View your page's content renders into. You won't need this often, but it's there:").ac("mb");
            pre(`app.$app.style("padding", "1em");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            h2("app.stylesheet(url)").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });
            p("Loads a CSS file and returns a promise. Call it from your `page.js` to bring in your own styles:").ac("mb");
            pre(`app.stylesheet("/yourname/styles.css");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            h2("app.font(name)").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });
            p("Loads a built-in font. The two options right now are `\"Montserrat\"` and `\"Material Icons\"`:").ac("mb");
            pre(`app.font("Montserrat");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            h2("app.ready").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });
            p("A promise that resolves once the app has finished booting:").ac("mb");
            pre(`app.ready.then(() => {
    console.log("app is ready");
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            h2("app.loaded").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });
            p("A promise that resolves once every stylesheet and font has finished loading:").ac("mb");
            pre(`app.loaded.then(() => {
    console.log("everything is loaded");
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
        }).style({ "max-width": "40em", margin: "0 auto" });
    }
}