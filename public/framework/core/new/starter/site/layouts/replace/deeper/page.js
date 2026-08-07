import { Page, p } from "/app.js";
import { code, section } from "../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Deeper",

	content(){
		p("Four pages are mounted right now. You can see one.");

		code(`
chain   Home › Four layouts › 1 · Replace › Deeper
shown   ─────────────────────────────────── ▲`);

		section("Go back up");

		p("Click **1 · Replace** in the sidebar. Only this page deactivates; the other three were never touched, so there is nothing to restore.");
	}
});
