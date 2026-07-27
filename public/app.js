import App, { el, div, a } from "./framework/core/App/App.js";
// Re-export the framework classes so pages import them from "/app.js". No page is
// statically imported here — topics load lazily on first visit and the App climbs
// to a page's pager-owning topic when needed (App.ensure_topic), so nothing has
// to be registered in app.js.
import { Page } from "./framework/core/Page/Page.class.js";
import { Pager } from "./framework/core/Pager/Pager.js";
import { ColumnPager } from "./framework/core/Pager/ColumnPager.js";
import { Router } from "./framework/core/Router/Router.js";

App.stylesheet("/styles.css");

const app = window.app = new App({
    nav(){
        el.c("nav", "flex gap", () => {
            div.c("nav-item", a("Home").href("/"));
            div.c("nav-item", a("Alex").href("/alex/"));
            div.c("nav-item", a("Arya").href("/arya/"));
            div.c("nav-item", a("Castin").href("/castin/"));
            div.c("nav-item", a("Edric").href("/edric/"));
            div.c("nav-item", a("Michael").href("/michael/"));
        })
    }
});

// opt-in: turns internal links into no-reload navigation (remove for full loads)
app.router = new Router({ app });

export default app;
export { app };
export * from "./framework/core/App/App.js";
export { Page } from "./framework/core/Page/Page.class.js";
export { Pager } from "./framework/core/Pager/Pager.js";
export { ColumnPager } from "./framework/core/Pager/ColumnPager.js";
export { Router } from "./framework/core/Router/Router.js";
