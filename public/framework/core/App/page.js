// `App` the CLASS is a named export; /app.js's DEFAULT export is the running
// app instance, which has no .prototype for classdoc to read.
import { App, classdoc, md, pre, code, h2, toc } from "/app.js";

export default classdoc.page({
	meta: import.meta,
	title: "App",
	description: "Boot, and the one container pages mount into.",
	icon: "widgets",

	Class: App,
	methods: "instantiate load loaded font",

	// The design record, served: each name is a ./doc/<name>.md the readme cites.
	notes: "boot error-page loaders adoption fonts aliases",

	content(){

		toc();

		code.js(`import App from "/framework/core/App/App.js";

window.app = new App();`);

		md("Two lines is a working site. `App` boots, builds one container, and walks to whatever url you opened.");

		h2("The six steps");

		pre(`app.instantiate()
  config()      a Router option, a font
  render()      chrome + $pages, still detached
  await load()  import /page.js, then walk to this url
  initialize()
  inject()      $app into <body> — first paint`);

		md("Nothing is on screen until `inject()`, which is what buys the no-flash first paint: fonts and stylesheets are awaited in `load()`, so the first thing the reader sees is finished.");

		h2("Your own chrome");

		code.js(`render(){
    this.$body = View.body();

    this.$app = div.c("app", () => {
        div.c("nav", () => a("Home").href("/"));
        this.$pages = div.c("pages");
    });

    View.set_captor(this.$pages);
}`);

		md("Override `render()` and build whatever you like around `this.$pages`. Two rules: **pages mount into `$pages`**, and the captor has to end up there — a page's view is built by an element factory, and a factory appends to the captor.");

		md("Chrome built here is built **once**. Navigation never touches it, so a sidebar can't blink and a scroll position in it can't reset.");

		h2("Fonts");

		code.js(`config(){
    this.font("Montserrat");        // awaited before first paint
    this.font("Material Icons");    // icon("dashboard") needs it
}`);

		md("`font()` pushes onto `loaders`, which `instantiate()` awaits **before** `inject()` — so a font asked for in `config()` is already applied at first paint. Ask later and it still loads, it just isn't waited for. Memoized, so two pages asking share one fetch.");

		md("Add your own with `Font.fonts.Inter = { name, url, options }`. See [lew42](/framework/styles/layers/theme/lew42/) for a theme that needs both.");

		h2("What App does not do");

		md("It doesn't resolve urls. The moment a segment can need an import, that became navigation — and navigation is the [Router](/framework/core/Router/)'s. `App` keeps boot and the one container, and that's the whole class.");

		md("Next: [Sidebar](/framework/core/Sidebar/) — the one component core ships. Then [Extensions](/framework/ext/).");

		md.details(import.meta, "readme.md", "Design record — boot, adoption, and the two aliases");
	}
});
