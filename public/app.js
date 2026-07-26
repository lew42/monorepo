import App, { el, div, a } from "./framework/core/App/App.js";
// import the Page classes BEFORE michael/page.js so their classes are fully
// evaluated before any page.js module calls page()/page2() at import time
// (app.js <-> michael/page.js is a circular import; order fixes the TDZ trap).
import { Page } from "./framework/core/Page/Page.class.js";
import { Page2 } from "./framework/core/Page/Page2.class.js";
import michael from "./michael/page.js";

App.stylesheet("/styles.css");

const app = window.app = new App({
    nav(){
        el.c("nav", "flex gap", () => {
            div.c("nav-item", a("Home").href("/"));
            div.c("nav-item", a("Alex").href("/alex/"));
            div.c("nav-item", a("Arya").href("/arya/"));
            div.c("nav-item", a("Castin").href("/castin/"));
            div.c("nav-item", a("Edric").href("/edric/"));
            div.c("nav-item", michael.link("Michael"));
        })
    }
});

export default app;
export { app };
export * from "./framework/core/App/App.js";
export { Page } from "./framework/core/Page/Page.class.js";
export { Page2 } from "./framework/core/Page/Page2.class.js";
