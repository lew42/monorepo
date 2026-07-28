import App, { el, div, a } from "./framework/core/App/App.js";

App.stylesheet("/styles.css");

// The app: a nav config + the singleton. The Router is wired by App.config_router;
// no page is imported here — topics load lazily on first visit, and the App climbs
// to a page's pager-owning topic when needed (Page.load_ancestors).
const app = window.app = new App({
    nav(){
        el.c("nav", "flex gap", () => {
            div.c("nav-item", a("Home").href("/"));
            div.c("nav-item", a("Alex").href("/alex/"));
            div.c("nav-item", a("Arya").href("/arya/"));
            div.c("nav-item", a("Castin").href("/castin/"));
            div.c("nav-item", a("Edric").href("/edric/"));
            div.c("nav-item", a("Michael").href("/michael/"));
            div.c("nav-item", a("Framework").href("/framework/"));
        })
    }
});

export default app;
export { app };
export * from "./framework/core/App/App.js"; // App + View factories + Page
export { Pager } from "./framework/core/Pager/Pager.js";
export { ColumnPager } from "./framework/core/Pager/ColumnPager.js";
export { TabPager } from "./framework/core/Pager/TabPager.js";
export { Router } from "./framework/core/Router/Router.js";

// ext/ is opt-in by import — these two are the site's choice, made once here so
// every page.js can write md("**docs**") and demo(() => …) with no extra import.
export { default as md, marked } from "./framework/ext/markdown/md.js";
export { default as demo } from "./framework/ext/demo/demo.js";