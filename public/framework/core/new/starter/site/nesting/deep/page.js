import { Page, p, div } from "/app.js";
import { code, section } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Deep",

	content(){
		p("Chain: Home → Nesting → Deep. Three pages loaded, one visible.");

		section("Reload this url");

		p("Press F5. You get the identical result — the server sends index.html, the walk runs from the root, and the same three pages resolve in the same order. A cold load and a click are the same code path after step 5.");

		code(`
/nesting/deep/

  root.child("nesting")   →  import("/nesting/page.js")
  Nesting.child("deep")   →  import("/nesting/deep/page.js")

  chain = [Home, Nesting, Deep]`);

		section("Scroll down, then go back up");

		p("Scroll to the bottom of this page and click Nesting in the sidebar. That page comes back as the **same DOM node**, at its own scroll position — not this one's.");

		p("Each page scrolls itself — `overflow-y` lives on `.page-content`, not on the chrome — so the two positions are independent. No JS restores anything; there is simply nothing shared to restore.").ac("note");

		div.c("filler", () => {
			for (let i = 1; i <= 30; i++)
				p(`line ${i} — filler so this page actually scrolls`).ac("note");
		});

		p("You made it to the bottom. Now click Nesting, then come straight back — you land right here again.");
	}
});
