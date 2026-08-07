import { Page, p, a } from "/app.js";
import { code, section } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Focus — full",

	// the whole opt-in
	mode: "full",

	content(){
		code(`
mode: "full",`, "focus/page.js");

		p("**Mode 3 · full.** The sidebar is gone. I did not ask the App to hide it, and there is no `hide_chrome()` — `mode` is data, `App.mark()` puts it on `$app` as `data-mode`, and one CSS rule reacts.");

		section("The rule");

		code(`
[data-mode="full"] .sidebar { display: none; }`);

		p("Nothing moved. My view is in `app.$pages` exactly where every other page is, which is why I can still have children and why leaving is one attribute write.").ac("note");

		section("Compare");

		code(`
starter takeover   $app.ac("takeover").append(page.render())   moves the view,
                   page.view.remove()                          then un-moves it

new/0 full         mode: "full"                                data. one attribute.`);

		a.c("page-link", "← Home").href("/");
	}
});
