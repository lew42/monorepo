import { h1, h2, p, a, pre, div } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "View").href("/edric/framework/view/"); // abs path? !! MUST RETURN
    },

    render(){
        div.c("pad", () => {
            a.c("page-back btn bg mb", "Back").href("../");

            h1("View").ac("mb").style("color", "var(--prim)");

            p("Every tag function (`h1, p, div, a`...) returns a `View`, wrapping one DOM element. You mostly just call methods on it:").ac("mb");
            pre(`div.c("flex gap", () => {
    p("child 1");
    p("child 2");
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

            div.c("flex gap", () => {
                div.c("flex-1", () => {
                    h2("Classes").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

                    p("`.c(\"cls\")`: create with a class.").ac("mb");
                    pre(`div.c("flex gap");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.ac(\"cls\")`: add a class (or several, space-separated) after the fact.").ac("mb");
                    pre(`div().ac("flex gap");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.rc(\"cls\")`: remove a class.").ac("mb");
                    pre(`div().rc("flex gap");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.hc(\"cls\")`: check if it has a class.").ac("mb");
                    pre(`if (div().hc("active")) {
    // ...
}`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.tc(\"cls\")`: toggle a class on/off.").ac("mb");
                    pre(`div().tc("active");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    h2("Content").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

                    p("`.append(...)`: add children, views, text, DOM nodes, arrays, or a function that builds them.").ac("mb");
                    pre(`div().append(p("hello"), " ", a("link").href("/"));`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.prepend(...)`: same as `.append()`, but adds to the start.").ac("mb");
                    pre(`div().prepend(p("this goes first"));`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.empty(...)`: clear all children, optionally append new ones.").ac("mb");
                    pre(`div().empty(p("fresh content"));`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.text(value)`: get or set the text content.").ac("mb");
                    pre(`p().text("Hello");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.html(value)`: get or set the inner HTML.").ac("mb");
                    pre(`div().html("<b>Hello</b>");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("Inside `p(...)`, text wrapped in backticks (like this) automatically becomes `code`.").ac("mb");
                    pre(`p("Use \`.style()\` to set CSS.");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
                }).style("min-width", "0");

                div.c("flex-1", () => {
                    h2("Attributes & events").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

                    p("`.attr(name, value)`: get or set an HTML attribute.").ac("mb");
                    pre(`div().attr("data-id", "42");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.href(url)`: shortcut for `.attr(\"href\", url)`.").ac("mb");
                    pre(`a("Home").href("/");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.style(prop, value)`: get or set inline CSS. Pass an object to set several at once.").ac("mb");
                    pre(`div().style({ padding: "1em", color: "red" });`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.on(event, cb)` / `.off(event, cb)`: add or remove an event listener.").ac("mb");
                    pre(`const log = () => console.log("clicked");
button("Click me").on("click", log);`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.click(cb)`: shortcut for `.on(\"click\", cb)`.").ac("mb");
                    pre(`button("Click me").click(() => console.log("clicked!"));`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    h2("Visibility & structure").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

                    p("`.hide()` / `.show()` / `.toggle()`: control `display`.").ac("mb");
                    pre(`const box = div();
box.hide(); // later...
box.show();`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.remove()`: remove it from the page.").ac("mb");
                    pre(`div().remove();`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.replace(view)`: swap it out for another view.").ac("mb");
                    pre(`oldView.replace(newView);`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.clone()` / `.repeat(n)`: duplicate it.").ac("mb");
                    pre(`div.c("item").repeat(3); // three copies`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.append_to(view)` / `.prepend_to(view)`: attach it somewhere else instead of where it was created.").ac("mb");
                    pre(`p("Hello").append_to(app.$app);`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    h2("Loading other files").ac("mb").style({ "border-bottom": "1px solid var(--subtle)", "padding-bottom": "0.3em" });

                    p("`.load(meta, url)`: dynamically import a module and append its default export.").ac("mb");
                    pre(`div().load(import.meta, "./widget.js");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

                    p("`.lazy(meta, url)`: same as `.load()`, but waits its turn behind earlier `.lazy()` calls.").ac("mb");
                    pre(`div().lazy(import.meta, "./widget.js");`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
                }).style("min-width", "0");
            }).ac("mb");

            p("There are a few more internal methods (`prerender`, `classify`, `buffer`/`flush`...) the framework uses under the hood, you won't need to call those directly when starting out.");
        }).style({ "max-width": "64em", margin: "0 auto" });
    }
}