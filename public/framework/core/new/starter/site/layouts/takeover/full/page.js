import { Page, p, a } from "/app.js";
import { code, section } from "../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Full window",

	// two lines, in the file that wants the behaviour
	activate(){ this.app.takeover(this); },
	deactivate(){ this.app.restore(this); },

	content(){
		p("No sidebar, no content column. This page asked the App directly and got the whole window.");

		a.c("page-link", "← back to 4 · Takeover").href("/layouts/takeover/");

		section("What just happened");

		code(`
router.activate  activate  Full window
page{…}.activate()  → app.takeover(this)     ← NOT container().$pages
app.takeover        sidebar and $main hidden`, "the console, on the way in");

		p("The Router did nothing special. It called `activate()` like it does for every page — this one just answers differently.").ac("note");

		section("Still mounted, still in the chain");

		code(`
chain     Home › Four layouts › 4 · Takeover › Full window
$pages    Home › Four layouts › 4 · Takeover    ← hidden by .app.takeover, not removed
$app      Full window                           ← appended alongside`);

		p("Which is why leaving is instant. `restore()` drops one class and removes one node; the three pages underneath never moved.");
	}
});
