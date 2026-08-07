import { Page, p } from "/app.js";
import { code, section, step } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Url → chain",

	content(){
		p("The first half of a cold load: everything that happens before anything is on screen. It ends with a chain and renders nothing.");

		step(1, "The server can't find that file, so it sends index.html", `
GET /nesting/deep/   →   no such file
                     →   index.html   (SPA fallback)`);

		step(2, "index.html loads exactly one script", `
<script type="module" src="/app.js"></script>`);

		step(3, "/app.js builds the App, which builds the chrome", `
export default window.app = new App({
    render(){                       // ← the sidebar you're looking at
        this.$app = div.c("app", () => {
            this.$main = div.c("main", () => { this.$pages = div.c("pages"); });
        });
    }
});`);

		step(4, "App.start() loads the ROOT page — always, on every url", `
async start(){
    this.render();
    this.root   = await this.load_root();     //  /page.js
    this.router = new Router({ app: this });
    await this.router.load(location.pathname);
    this.$body.append(this.$app);             // ← nothing painted until here
}`);

		step(5, "The Router walks the url ONE SEGMENT AT A TIME", `
async load_segments(url){
    let page = this.app.root;

    for (const name of url.split("/").filter(Boolean)){
        page = await page.child(name);
        if (!page) return null;
    }

    return page;
}`);

		code(`
"/nesting/deep/"  →  ["nesting", "deep"]

  root.child("nesting")   →  import("/nesting/page.js")        →  Nesting
  Nesting.child("deep")   →  import("/nesting/deep/page.js")   →  Deep

  chain = [Home, Nesting, Deep]`, "the walk, for this url");

		p("This is a **waterfall**, not a parallel fetch — and that's deliberate. You have to load a page before you can know whether it wants to claim the rest of the path itself. It's what makes dynamic urls work with zero 404s.").ac("note");

		step(6, "Each page resolves its own child", `
async child(name){
    const known = this.children.get(name);
    if (known) return known.assign({ parent: this, app: this.app });

    const page = await Page.import(this.url + name + "/")   // the filesystem
              ?? this.route?.(name);                         // …or me

    return page ? this.add(name, page) : null;
}`);

		p("`add()` sets `parent`, so by the time the walk finishes the last page already knows its whole ancestry. Nothing keeps a separate list.").ac("note");

		section("Clicking a link starts at step 5");

		code(`
click  →  router.click(e)          is this ours? (not external, not ⌘-click, …)
       →  router.go(url)           load FIRST, pushState after
       →  router.load(url)         load_segments() + activate()
       →  history.pushState()      only if the load succeeded`, "the click path");

		p("Load-before-push is the whole reason a broken link can't corrupt your history: if the walk returns null, `go()` hands the url to the browser and no entry was ever pushed.").ac("note");

		section("Why the root is always loaded");

		p("Every walk starts at `app.root`. Without it there's nothing to call `.child()` on, and the first segment would need a special case — 'segment 0 comes from the filesystem, the rest come from parents'. One small cached module is cheaper than that exception.");

		code(`
/                 →  [Home]
/nesting/         →  [Home, Nesting]
/nesting/deep/    →  [Home, Nesting, Deep]`, "every url is the same rule");

		p("Loading the root is not the same as **showing** it — that's the next question, and it's on **Load order**.").ac("note");
	}
});
