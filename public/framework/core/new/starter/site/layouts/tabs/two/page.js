import { Page, p, input } from "/app.js";
import { code } from "../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "two",

	content(){
		p("Tab two, and a real url. Copy it, open it in a new window — you land straight here with the tab already selected.");
		input.c("probe").attr("placeholder", "this box has its own state too");

		code(`
/layouts/tabs/two/

  root.child("layouts")   →  Four layouts
  layouts.child("tabs")   →  3 · Tabs        ← renders the tab bar
  tabs.child("two")       →  two             ← mounts into tabs.$pages

  chain = Home › Four layouts › 3 · Tabs › two`, "a cold load of this tab");

		p("The tab bar exists because `3 · Tabs` rendered on the way past. Selection isn't stored anywhere — it's `mark_links()` finding an `<a>` whose href equals the active page's url.").ac("note");
	}
});
