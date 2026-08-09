// `App` the CLASS is a named export; /app.js's DEFAULT export is the running
// app instance, which has no .prototype for classdoc to read.
import { App, classdoc, md, pre, code, h2, toc } from "/app.js";

export default classdoc.page({
	meta: import.meta,
	title: "App",
	description: "Boot, and the one container pages mount into.",
	icon: "widgets",

	Class: App,

	properties: "$app $pages root router ready $body",

	methods: "instantiate config render load initialize inject error " +
	         "font loaded styles_loaded stylesheet path_to_page_url assign log_label",

	// Each name is a ./doc/<name>.md the readme cites. `mode` and `fonts` cover the
	// two sibling modules — mode.js and Font.js — which are not members of App.
	notes: "constructor boot error-page loaders adoption fonts mode aliases",

	content(){

		toc();

		code.js(`import App from "/framework/core/App/App.js";

window.app = new App();`);

		md("Two lines is a working site. `App` boots, builds one container, and walks to whatever url you opened. You never write a route.");

		h2("Six steps, in order");

		pre(`app.instantiate()
  config()      a font, a theme's behaviour, a Router option
  render()      chrome + $pages, still detached
  await load()  import /page.js, then walk to this url
  initialize()
  inject()      $app into <body> — first paint`);

		md("**Nothing is on screen until `inject()`.** Fonts and stylesheets are awaited in `load()`, so the first thing the reader sees is finished — no flash, no reflow. The same fact is the cost: a deep cold link waits for the whole walk.");

		h2("Your own chrome");

		code.js(`render(){
    this.$body = View.body();

    this.$app = div.c("app", () => {
        div.c("nav", () => a("Home").href("/"));
        this.$pages = div.c("pages");
    });

    View.set_captor(this.$pages);
}`);

		md("Override `render()` and build whatever you like around `this.$pages`. Two rules, both silent when broken: **pages mount into `$pages`**, and **the captor has to end up there** — a page's view is built by an element factory, and a factory appends to the captor.");

		md("Chrome built here is built **once**. Navigation never touches it, so a sidebar can't blink and a scroll position in it can't reset.");

		h2("Fonts");

		code.js(`config(){
    this.font("Montserrat");        // awaited before first paint
    this.font("Material Icons");    // icon("dashboard") needs it
}`);

		md("Asked for in `config()`, a font is already applied at first paint. Ask later and it still loads, it just isn't waited for. Add your own with `Font.fonts.Inter = { name, url, options }`.");

		md("That is the whole class. It doesn't resolve urls — the moment a segment can need an import, that became navigation, and navigation is the [Router](/framework/core/Router/)'s.");

		md("Next: [Sidebar](/framework/core/Sidebar/) — the one component core ships.");

		md.details(import.meta, "readme.md", "Design record — boot, adoption, and the two aliases");
	}
});
