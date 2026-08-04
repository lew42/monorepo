import { Page, md, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "App",
	description: "Boot, and the one container pages mount into.",

	content(){

		pre(`app.instantiate()
  config()      a Router option, a font
  render()      chrome + $pages, still detached
  await load()  import /page.js, then walk to this url
  initialize()
  inject()      $app into <body> — first paint`);

		md("`App` boots and owns **one** container. It does not resolve urls — the moment a segment can need an import, that became navigation, and navigation is the [Router](/framework/core/Router/)'s.");

		md("A site overrides `render()` to build its own chrome around `this.$pages`.");

		md("## Fonts");

		pre(`app.font("Montserrat");        // in config(), to beat first paint
app.font("Material Icons");    // anywhere — icon("dashboard") needs it`);

		md("`app.font(name)` loads a face from `Font.fonts` and pushes it onto `loaders`, which `instantiate()` awaits **before** `inject()` — so a font asked for in `config()` is already applied at first paint. Ask later and it still loads, it just isn't waited for. Memoized, so two pages asking share one fetch.\n\nAdd your own with `Font.fonts.Inter = { name, url, options }`. See [lew42](/framework/styles/theme/lew42/) for a theme that needs both.");
	}
});
