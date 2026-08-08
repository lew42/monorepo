import { Page, h2, md, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "App",
	description: "window.app, the pieces you'll actually use.",

	content(){
		code.js(`app.$body.ac("some-class");`).ac("mb");
		md("`window.app` is created once when the site boots. `app.$body` is the `<body>` View.").ac("mb");

		h2("app.$app").ac("mb");
		code.js(`app.$app.style("padding", "1em");`).ac("mb");
		md("The root View your page's content renders into. You won't need this often.").ac("mb");

		h2("app.stylesheet(url)").ac("mb");
		code.js(`app.stylesheet("/yourname/styles.css");`).ac("mb");
		md("Loads a CSS file and returns a promise. Call it from your `page.js` to bring in your own styles.").ac("mb");

		h2("app.font(name)").ac("mb");
		code.js(`app.font("Montserrat");`).ac("mb");
		md("Loads a built-in font. The two options right now are `\"Montserrat\"` and `\"Material Icons\"`.").ac("mb");

		h2("app.ready").ac("mb");
		code.js(`app.ready.then(() => {
    console.log("app is ready");
});`).ac("mb");
		md("A promise that resolves once the app has finished booting.").ac("mb");

		h2("app.loaded()").ac("mb");
		code.js(`app.loaded().then(() => {
    console.log("everything is loaded");
});`).ac("mb");
		md("A promise that resolves once every stylesheet and font has finished loading.").ac("mb");

		md("Next: [View](/edric/getStarted/framework/view/), every tag function returns one.");
	}
});
